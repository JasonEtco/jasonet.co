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
  app.use(
    '/probot/static/',
    express.static(path.join(__dirname, '..', 'static'))
  )
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

This method is a great way to grab the Express server and start doing stuff with it. You can add middleware, routes - it really is a regular Express server! The one "gotcha" is that Probot's internal routes are registered _before_ your Probot App's code is run, so middleware won't apply retroactively.

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
