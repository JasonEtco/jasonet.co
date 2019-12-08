---
title: Build your own Probot
date: '2019-12-08'
spoiler: Let's see what makes Probot tick; the API design, the authentication mechanisms, and the little helpers that make it easy to use.
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
