---
title: Build your own Probot
date: '2019-12-08'
spoiler: Let's see what makes Probot tick; the API design, the authentication mechanisms, and the little helpers that make it easy to use.
---

A lot of people look at Probot and wonder how they can extend it - add custom routes, integrate it with other platforms, control it's startup. I firmly believe that too many features and options can make a framework unweildy, so rather than show where all of those things can fit in Probot itself, we're going to take a look at building our own Probot.

Interestingly, the API design (started by @bkeepers) looks and feels a lot like a chatbot. I'm hoping that from this post, you (yes you!) will get an understanding of how Probot integrates with GitHub and _why_ it feels easy to use, and then you'll be able to bring those patterns to your own projects.

I'm going to leave the [**Why we built Probot**](#why-we-built-probot) until the end, because while it is interesting and enlightening, we want to build stuff!

A couple of important notes:

* Unless specifically stated, all code is pseudo-code, not copied directly from Probot. I'll be oversimplifying some code so that we don't have to think about edge-cases and complications.
* Many parts of Probot have been extracted into smaller modules (shoutout [@gr2m](https://twitter.com/gr2m)). We'll talk about how they work, but you'll probably just want to use them directly.
* There's a lot of code here - if you're looking at something and wanting for some more explanation, please [tell me](https://twitter.com/JasonEtco)!

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

![Probot webhook handling flow](/images/probot-flow.png)

First, it verifies the webhook signature; along with the JSON payload, GitHub sends an `X-GitHub-Secret` header. The value of the header is a combination of a secret key and the contents of the payload itself. GitHub and your Probot app both have the secret key (Probot uses the `WEBHOOK_SECRET` environment variable), so when the two services generate the header they should match exactly. If they don't, Probot ignores the request.

This is a security measure to ensure that random POST requests aren't acted upon - only GitHub can trigger your app. This logic is now abstracted in a separate module that Probot uses, [`@octokit/webhooks`](https://github.com/octokit/webhooks.js), for convenience and reusability.

Once the webhook verification is complete, Probot emits an event through its internal [`EventEmitter`](https://nodejs.org/api/events.html):

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
  if (isValidWebhook) {
    events.emit('github-event', {
      event: eventName,
      payload: req.body
    })
    // We tell GitHub that everything worked great!
    return res.send(200)
  } else {
    // Couldn't validate the webhook, so we send an "Unauthorized" code
    return res.send(401)
  }
})
```

Somewhere behind the scenes, Probot has registered the event handlers of your Probot app. A standard app looks like this:

```js
module.exports = app => {
  app.on('event', handler)
}
```

Where `app` is an instance of the `Application` class, which is (sort of) an extension of `EventEmitter! We'll look at that shortly - there are still a things that Probot does before running your code, but first...

### Why an EventEmitter API?

To me, it's the inherent simplicity of "something happened, so now run this code." When an issue is opened on GitHub, run this code. This let's you focus on your app code, and not care what Probot is doing under the hood. Similar to something like Express's `app.get()`, but this let's you register multiple event handlers for the same event, and have an infinite list of events (since they're just strings).

## Authentication

Next, Probot looks for a particular value in the JSON payload, `installation.id`. Along with your App's credentials (a Private Key and App ID), it uses that installation ID to create a temporary API token.

This was the most complicated part of Probot for a long time, until [@gr2m](https://twitter.com/gr2m) pulled it out into its own repository, [`@octokit/app.js`](https://github.com/octokit/app.js). I'll talk about what it does, then show some code using it!

### Two ways for GitHub Apps to authenticate

If you're here, I'll guess that you're familiar with what GitHub Apps are. They're an "actor" on GitHub, and can authenticate in two distinct ways:

* As itself, as an app
* As an installation. When you install an app on an account (a user or an organization), that creates an installation. Each installation has a unique `id` (the aforementioned payload value), and we can use that to create an API access token.

Usually, when your Probot app calls `context.github...`, `github` is an authenticated `Octokit` client that uses an **installation token**. We can get one of those by creating an access token as the app and then using that to create an access token for an installation, given its ID.

Authenticating as the app is done by combining the `APP_ID` and `PRIVATE_KEY`, using JWTs:

```js
const jsonwebtoken = require('jsonwebtoken')
// A helper function for generated an access token using the App ID and Private Key
function getSignedJsonWebToken({ app_id, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now, // Issued at time
    exp: now + 60 * 10 - 30, // JWT expiration time (10 minute maximum, 30 seconds of leeway)
    iss: app_id
  }
  const token = jsonwebtoken.sign(payload, privateKey, { algorithm: 'RS256' })
  return token
}
```

We can then use that token to send a POST request to GitHub, creating an installation access token:

```js
// Get an installation token
async function getInstallationAccessToken ({
  app_id,
  privateKey,
  installation_id
}) {
  // Create our token for making requests as the app
  const signedJWT = getSignedJsonWebToken({ app_id, privateKey })

  // Compose our API endpoint URL using the `installation_id`
  const url = `https://api.github.com/app/installations/${installation_id}/access_tokens`

  // Note: I'd recommend using `@octokit/request` here, but you don't 
  // need to. It's just an HTTP request!
  const response = await request({
    method: 'POST',
    url,
    installation_id,
    headers: {
      authorization: `bearer ${signedJWT}`
    }
  })

  return response.data.token
}
```

Code mostly copied from [`@octokit/app.js](https://github.com/octokit/app.js) which abstracts it all, through a handy method called `getInstallationAccessToken`! In practice, we want to say:

> When we receive an event from GitHub, create an authenticated GitHub client and emit an event

## The Application class

Let's talk about this line here:

```js{1}
module.exports = app => {
  app.on('event', handler)
}
```

Probot apps export a function, where `app` is the only argument. Probot calls that function on startup with an instance of a class called [`Application`](https://github.com/probot/probot/blob/master/src/application.ts). It has an API similar to the `EventEmitter`, with important methods on it for handling the lifecycle of an event, the most important of which is [`Application#auth`](https://github.com/probot/probot/blob/61c05ea76e9ea31fbdea15c99f7c1cc613321db5/src/application.ts#L485).

Here's what it looks like (this isn't exactly Probot's code - I took some liberties to simplify the code and remove some edge-case handling):

```ts
import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'

class Application extends EventEmitter {
  app: App

  async auth (installationId?: number): Promise<Octokit> {
    // If installation ID passed, instantiate and authenticate Octokit, then cache the instance
    // so that it can be used across received webhook events.
    if (installationId) {
      const accessToken = await this.app.getInstallationAccessToken({ installationId })
      const authString = `token ${accessToken}`
      return new Octokit({ auth: authString })
    }
  
    // Otherwise, authenticate as the app using a JWT
    const token = this.githubToken || this.app.getSignedJsonWebToken()
    return new Octokit({ auth: `Bearer ${token}` })
  }
}
```

Along with some of the earlier code we looked at, we would use the `Application` class in code like this:

```js
const events = new EventEmitter()
const application = new Application()

// This is code similar to what you'd find in your Probot app's code
application.on('issues', async context => {
  return context.github.issues.createComment({ ... })
})

// We register an event in our internal EventEmitter, as a sort of middleware
// for our `Application` event emitter. When thats triggered, we create an
// authenticated GitHub client, and then emit an event using the webhook's event
// name, but on the Application instance.
events.on('github-event', ({ event, payload }) => {
  const github = await application.auth(payload.installation.id)
  const context = { github, payload }
  return application.emit(event, context)
})

app.post('/', ...)
```

A common question I hear is "how do I access `context` outside of an event handler?" - hopefully, this has helped explain how `context` is created, and is dependant on the `installation.id` value of the payload. If you have another way to get an installation ID (possibly through [API endpoints for finding an ID](https://developer.github.com/v3/apps/#get-a-repository-installation)), then you can totally do that!

## Loading your App's code

This is a fun part of Probot - you write code that exports a function, but then Probot magically runs that function. Most Probot apps use a CLI the Probot provides, called `probot run`. For example, [`JasonEtco/todo`'s](https://github.com/JasonEtco/todo) `npm start` command is this:

```json
"scripts": {
  "start": "probot run ./index.js"
}
```

This tells Probot to `require()` the `./index.js` file, and run the exported function with an instance of `Application`. That's done through [`Probot#load`](https://github.com/probot/probot/blob/61c05ea76e9ea31fbdea15c99f7c1cc613321db5/src/index.ts#L179), and somewhere down the line we have code like this:

```ts
// From https://github.com/probot/probot/blob/master/src/resolver.ts
import { sync } from 'resolve'

export function resolve (appFnId: string) {
  // appFnId would be `./index.js`
  return require(sync(appFnId, { basedir: process.cwd() }))
}
```

We're loading the code via Node.js's `require()` functionality. Then, once we've got the function loaded up, we simply call it:

```js
const application = new Application()
const yourApp = probot.load('./index.js')
yourApp(application)
```

Calling the function then calls `application.on()`, which registers the event handlers!

While this obviously isn't all of Probot, it really is the core of it. We get an event through the `POST` endpoint, use information from it to create an authenticated GitHub client, and run your app's code.

## A very simple Probot framework

Using all of the above information, I wanted to take a crack at a simplified version of Probot that, asidie from the GitHub authentication mechanisms, has nothing to do with GitHub. You can take this framework and apply it to any other service that sends webhooks.

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

This is a mostly functional Probot framework, but some immediate ways that Probot improves upon the above code:

* Probot loads multiple `Application` instances, with some "internal" apps. For example, there's [a special Sentry integration](https://github.com/probot/probot/tree/master/src/apps/sentry.ts) that Probot loads as a Probot app itself!
* Installation tokens are cached, to avoid make a ton of requests for the same thing.
* `Context` is a real class with helper methods.
* Probot uses [`promise-events`](https://npmjs.com/package/promise-events) for clearer, Promise-based event handling.
* Grabbing the `PRIVATE_KEY` is a little more robust - Probot will look for a `/*.pem` file, use the `PRIVATE_KEY_PATH` variable, and the `PRIVATE_KEY` environment variable.
* Loading your app's code is done in a smarter way - `index.js` is the default, but you can provide a specific path.

With that, I want to talk a bit about why I think Probot is, overall, a well-built project and what I've learned from it so far.

## What makes Probot "good"

TODO:

* Documentation
* `create-probot-app`
* `probot run`
* Helper methods for common patterns

## Why we built Probot

...

---

## Outline

- [x] Probot is an opinionated Express server
- [x] Probot's EventEmitter-like API
  - [x] What happens when it "gets a Webhook"
    - [x] Elaborate that GitHub POSTs to your app
    - [x] Probot checks `WEBHOOK_SECRET`
    - [ ] For local dev we built Smee - separate post if you're interested Tweet me
- [x] `probot run` and programmatic starts
- [x] How GitHub Apps authenticate
  - [x] Authenticating as the App
  - [x] Authenticating as the Installation
  - [x] `payload.installation.id` -> `app.auth()`
  - [x] Exchange installation ID and App credentials for installation token
- Helpers (`context.config()`, `context.repo()`)
  - Note that `{ ...rest }` wasn't a thing back then - so the method was helpful
- Why we built Probot