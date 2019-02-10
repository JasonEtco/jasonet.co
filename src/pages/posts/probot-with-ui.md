---
title: Probot Apps with a UI
date: '2019-01-26'
spoiler: Probot Apps are best known for their webhook response functionality, but you can pair them with a UI as well!
---

We've seen a lot of fantastic Probot Apps pop up that have helped people **automate all the things**, but there's a whole feature-set that many apps aren't taking advantage of.

Let's take a look at some features of Probot by digging into the codebase, and explore how to bring interactivity to your Probot App.

## Probot as an Express server

Something that is often overlooked is that Probot, at its core, is **an Express server with a fancy `POST` endpoint** for handling webhook payloads:

```typescript
// https://github.com/probot/probot/blob/beta/src/server.ts
export const createServer = (args: ServerArgs) => {
  const app: express.Application = express()

  app.use(logRequest({ logger: args.logger }))
  app.use('/probot/static/', express.static(path.join(__dirname, '..', 'static')))
  app.use(args.webhook)
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, '..', 'views'))
  app.get('/ping', (req, res) => res.end('PONG'))

  return app
}
```

The above snippet is taken from [Probot's codebase](https://github.com/probot/probot/blob/40cbfb1b5fd8b59d4ecc90d639ac2bf97fa9c333/src/server.ts#L11-L22), and illustrates the internals.

```typescript{2}
app.use('/probot/static/', express.static(path.join(__dirname, '..', 'static')))
app.use(args.webhook)
app.set('view engine', 'hbs')
```

Here we're effectively registering the webhook router as a regular old middleware (an instance of [`@octokit/webhooks`](https://github.com/octokit/webhooks)).

This important because wherever we are in our Probot app, **we can access and use the internal Express server**.

## app.route()

This method is a great way to grab the Express server and start doing stuff with it. You can add middleware, routes - it really is a regular Express server! The one "gotcha" is that Probot's internal routes are registered _before_ your app's code is run, so middleware won't apply retroactively.

```js{2,3}
module.exports = app => {
  const server = app.route()
  server.get('/example', (_, res) => res.send('Yay!'))
}
```

You can now make use of Probot's authentication functionality **outside of the webhook handler**. Let's create a `GET` route that will respond with [the app's identity](https://developer.github.com/v3/apps/#get-the-authenticated-github-app) - we'll use an Octokit client that's [authenticated as the app](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-a-github-app):

```js{4-6}
module.exports = app => {
  const server = app.route()
  server.get('/whoami', async (req, res) => {
    const octokit = await app.auth()
    const { data } = await octokit.apps.getAuthenticated()
    res.json(data)
  })
}
```

Pretty rad - we've accessed data in our Probot App that is in no way tied to a webhook payload. This is a key part of building apps that don't just respond to events, but truly integrate with GitHub.

## Identifying users

A little known part of GitHub Apps (and by extension, Probot) is [that users can "log in"](https://developer.github.com/apps/building-github-apps/identifying-and-authorizing-users-for-github-apps/#identifying-users-on-your-site) using the regular [OAuth flow](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow). Your GitHub App has some credentials that can be used to ask GitHub who the user is:

First, we expose a `/login` route where we redirect the user to GitHub with some special query params:

```js
server.get('/login', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol
  const host = req.headers['x-forwarded-host'] || req.get('host')

  const params = querystring.stringify({
    client_id: process.env.CLIENT_ID,
    redirect_uri: `${protocol}://${host}${opts.callbackURL}`
  })

  const url = `https://github.com/login/oauth/authorize?${params}`
  res.redirect(url)
})
```

After the user goes to GitHub, they'll be presented with an **Authorize** screen. They'll decide to authorize, which will send them back to your app's **Callback URL**. We'll define this as `/login/cb`, but you'll also need to [set it in your GitHub App](https://developer.github.com/apps/building-github-apps/creating-a-github-app/):

```js
server.get('/login/cb', async (req, res) => {
  // Exchange our "code" and credentials for a real token
  const tokenRes = await request.post({
    url: 'https://github.com/login/oauth/access_token',
    json: true,
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code
    }
  })

  // Authenticate our Octokit client with the new token
  const octokit = new GitHubAPI()
  octokit.authenticate({
    type: 'token',
    token: tokenRes.body.access_token
  })

  // Get the currently authenticated user
  const user = await octokit.users.getAuthenticated()
  console.log(user.data.login) // <-- This is what we want!

  // Redirect after login
  res.redirect('/')
})
```

Nothing above looks like your average Probot code, but it can be paired with a regular old Probot App. By allowing users to log in to the browser, there's a whole world of possibilities.

A great example is [**probot-invite**](https://github.com/probot/invite). Once the app is installed in an organization, admins of that org can visit the app in the browser and generate a link to invite other users to that organization:

![Probot Invite](https://user-images.githubusercontent.com/173/44678009-54427500-aa05-11e8-82d8-eb024b9970dc.png)

When used with a library like [`cookie-session`](https://github.com/expressjs/cookie-session), your app can persist user sessions - so users visiting your site will stay logged in. 

```js{3}
// Get the currently authenticated user
const { data } = await octokit.users.getAuthenticated()
req.session.user = data
```

Now you should have the information you need to build a Probot app that both listens to webhooks and exposes a UI for users to interact with. You can still take it further, by using the `access_token` to make [**user-to-server**](https://developer.github.com/apps/building-github-apps/identifying-and-authorizing-users-for-github-apps/#user-to-server-requests) requests on behalf of the user, opening up new possibilities for fetching data that is scoped to the user.

### A concrete example

Here's a realistic example of where we'd want to use this functionality. Let's imagine a data-tracking integration, where we want to store metrics of activity in our GitHub repository. This is just a thought experiment - we won't go too deep into building this, though you certainly could!

We want to store more detailed information than what the GitHub API provides, like the size of each commit or how many times a certain file was changed - so we listen for the `push` event and store that data in our database.

```js
app.on('push', async context => {
  // A function to get more details about the payload by asking GitHub
  const details = await getDetailsFromPayload(context, context.payload)
  return db.Record.create(context.repo({ payload_id: context.payload.id, details }))
})
```

But now that we have this information, we need to show it somewhere! GitHub doesn't currently have really extensible ways to share things into the UI, so we'll build our own 🎨

First, we'll need to create some routes:

```js
const server = app.route()
// A little middleware that will redirect the user
// to the `/login` if they are not already logged in
server.use(forceLogin)
server.get('/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params
  // Check that the user has access to this repo
  if (await userHasAccess(req.session.user, owner, repo))
  // Get some data from the database
  const data = await db.Record.findAll({ where: { owner, repo } })
  // Respond with some JSON data
  return res.json(data)
})
```

You can accomplish the `userHasAccess` check in a couple of different ways - one method is to use a little GraphQL query and, after authenticating using the `access_token`, seeing the "viewer's" permission:

```graphql{2-4}
query (owner: String!, name: String!) {
  repository (owner: $owner, name: $name) {
    viewerPermission
  }
}
```

I don't want this post to become too long, but it can go on for a long time - ultimately, once you get the hang of extracting Probot's Express server, you're building a web app. The possibilities are endless 

If you're interested in learning more on this topic, [let me know](https://twitter.com/JasonEtco)!