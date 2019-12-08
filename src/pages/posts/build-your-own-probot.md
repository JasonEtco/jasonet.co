---
title: Build your own Probot
date: '2019-12-08'
spoiler: Let's see what makes Probot tick; the API design, the authentication mechanisms, and the little helpers that make it easy to use.
---

A lot of people look at Probot and wonder how they can extend it - add custom routes, integrate it with other platforms, control it's startup. I firmly believe that too many features and options can make a framework unweildy, so rather than show where all of those things can fit in Probot itself, we're going to take a look at building our own Probot.

Interestingly, the API design (started by @bkeepers) looks and feels a lot like a chatbot. I'm hoping that from this post, you (yes you!) will get an understanding of how Probot integrates with GitHub and _why_ it feels easy to use, and then you'll be able to bring those patterns to your own projects.

I'm going to leave the [**Why we built Probot**](#why-we-built-probot) until the end, because while it is interesting and enlightening, we want to build stuff!

A couple of important notes:

* Unless specifically stated, all code is pseudo-code
* Many parts of Probot have been extracted into smaller modules (shoutout [@gr2m](https://twitter.com/gr2m)). We'll talk about how they work, but you'll probably just want to use them directly.

## Probot is an opinionated Express server

At its core, Probot uses [Express](https://expressjs.com/) to run a Node.js HTTP server. When an event happens on GitHub that your Probot app is configured to care about, GitHub sends HTTP POST requests (webhooks) to a special "webhook endpoint," containing information in a JSON payload about what event was triggered. You can imagine code like this being a central part of the Probot framework (I'll link to actual code shortly):

```js
const express = require('express')
const app = express()

app.post('/', (req, res) => {
  // We got a webhook! Now run the Probot app's code.
})
```

When a Probot server receives a Webhook, it does a few things before actually running your code:

First, it verifies the webhook signature; along with the JSON payload, GitHub sends an `X-GitHub-Secret` header. The value of the header is a combination of a secret key and the contents of the payload itself. GitHub and your Probot app both have the secret key (Probot uses the `WEBHOOK_SECRET` environment variable), so when the two services generate the header they should match exactly. If they don't, Probot ignores the request.

This is a security measure to ensure that random POST requests aren't acted upon - only GitHub can trigger your app. This logic is now abstracted in a separate module that Probot uses, [`@octokit/webhooks`](https://github.com/octokit/webhooks.js), for convenience and reusability.

Once the webhook verification is complete, Probot emits an event through its internal [`EventEmitter`]():

```js
const express = require('express')
const EventEmitter = require('events')
const app = express()

const events = new EventEmitter()

app.post('/', (req, res) => {
  // Verify the webhook payload
  const isValidWebhook = verifyWebhookPayload(req)
  // The name of the GitHub event is sent in a header
  const eventName = req.get('X-GitHub-Event')
  // It's valid, we emit an event
  if (isValidWebhook) events.emit(eventName, req.body)
})
```

Somewhere behind the scenes, Probot has registered the event handlers of your Probot app. A standard app looks like this:

```js
module.exports = app => {
  app.on('event', handler)
}
```

Where `app` is (sort of) an extension of our `EventEmitter`! There are still a things that Probot does before running your code, but first...

### Why an EventEmitter API?

To me, it's the inherent simplicity of "something happened, so now run this code." When an issue is opened on GitHub, run this code. 

Next, Probot looks for a particular value in the JSON payload, `installation.id`. Along with your App's credentials (a Private Key and App ID), it uses that installation ID to create a temporary API token.

## A very simple Probot

Using all the information above, I wanted to take a crack at a simplified version of Probot that, asidie from the GitHub authentication mechanisms, has nothing to do with GitHub. You can take this framework and apply it to any other service that sends webhooks.

```js
const express = require('express')
const EventEmitter = require('events')
const { Octokit } = require('@octokit/rest')
const OctokitApp = require('@octokit/app').App
const app = express()

// Get the `index.js` file of wherever you're running this server
const yourAppCode = require(path.join(process.cwd(), 'index.js'))

// Define our Application class, which handles the authentication logic
class Application extends EventEmitter {
  constructor () {
    this.app = new OctokitApp({
      id: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY
    })
  }

  async auth (installationId) {
    // Get an installation access token for the given ID
    const accessToken = await this.app.getInstallationAccessToken({ installationId })
    // Return an Octokit client using the token
    return new Octokit({ auth: `token ${accessToken}` })
  }
}

// Create and use our Application instance
const application = new Application()
yourAppCode(app)

// Create our internal EventEmitter
const events = new EventEmitter()

events.on('github-event', ({ event, payload }) => {
  // Before running the code, we create an authenticated client
  const github = await application.auth(payload.installation.id)
  // Prepare our context object
  const context = { github, payload }
  // Emit the event
  return application.emit(event, context)
})

app.post('/', (req, res) => {
  // Verify the webhook payload. You'd probably want to use `@octokit/webhooks` instead!
  const isValidWebhook = verifyWebhookPayload(req)
  // The name of the GitHub event is sent in a header
  const eventName = req.get('X-GitHub-Event')
  // It's valid, we emit an event
  if (isValidWebhook) {
    events.emit('github-event', { event: eventName, payload: req.body })
    return res.send(200)
  } else {
    return res.send(401)
  }
})

app.listen(3000)
```

Some immediate ways that Probot improves upon the above code:

* Installation tokens are cached, to avoid make a ton of requests for the same thing.
* `Context` is a real class with helper methods.
* Probot uses [`promise-events`](https://npmjs.com/package/promise-events) for clearer, Promise-based event handling.
* Grabbing the `PRIVATE_KEY` is a little more robust - Probot will look for a `/*.pem` file, use the `PRIVATE_KEY_PATH` variable, and the `PRIVATE_KEY` environment variable.

## Why we built Probot

...

---

## Outline

- Probot is an opinionated Express server
- How GitHub Apps authenticate
  - Authenticating as the App
  - Authenticating as the Installation
- Probot's EventEmitter-like API
  - What happens when it "gets a Webhook"
    - Elaborate that GitHub POSTs to your app
    - Probot checks `WEBHOOK_SECRET`
    - For local dev we built Smee - separate post if you're interested Tweet me
  - `payload.installation.id` -> `app.auth()`
  - Exchange installation ID and App credentials for installation token
- Helpers (`context.config()`, `context.repo()`)
  - Note that `{ ...rest }` wasn't a thing back then - so the method was helpful
  - `probot run` and programmatic starts
- Why we built Probot