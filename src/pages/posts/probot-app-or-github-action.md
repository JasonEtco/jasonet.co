---
title: Probot App or GitHub Action?
date: '2019-01-20'
spoiler: Should your next automation tool be built in GitHub Actions, or as a separate service with Probot?
---

_There is a newer version of this post that is more up-to-date with changes to GitHub Actions. [Check it out!](/posts/probot-app-or-github-action-v2)_

**Spoiler: it depends.**

Since GitHub announced the beta release of [GitHub Actions](https://github.com/features/actions) in October 2018, there's been a new excitement around building automation - and that's awesome! But I wanted to take a look at the various pros and cons of GitHub Actions and Probot, where each excels and where each might not be the best tool for the job.

## GitHub Actions

I won't go too deep into what Actions are - [@jessfraz](https://twitter.com/jessfraz) [has got you covered](https://blog.jessfraz.com/post/the-life-of-a-github-action/). The important notes for right now are:

1. Run code to respond to an event on GitHub
2. GitHub will run _anything_ in a Docker container

The key point is that GitHub runs your Actions in an ephemeral container - there's no hosting, server costs or deployment to worry about. It's sort of like a scoped serverless function that's triggered by events in a GitHub repository.

## Probot

[Probot](https://probot.github.io) is an [open-source](https://github.com/probot/probot) framework for building [GitHub Apps](https://developer.github.com/apps/) in [Node.js](https://nodejs.org). It handles boilerplate things like authentication, and provides a straightforward [`EventEmitter`-like API](https://probot.github.io/docs/hello-world/).

We were working on Probot for about 2 years before GitHub Actions - I like to think that it inspired parts of Actions, but I have no idea if that's true.

It's been enabling developers to build automation and workflow tools that whole time. That's something I really want to stress - Actions is _amazing_, but it's not the only way to build automation; sometimes it's not even the best way.

## What's best for you?

Let's start by talking about GitHub Actions' sweet spot. It's the kind of automation tool that I'd never want to build using Probot: something long-running.

At the time of writing, Actions has a timeout of ~59 minutes. That means that (and this isn't an exaggeration) you can run whatever code you want in a Docker container so long as it doesn't take longer than an hour - _and GitHub will run it for you_ 😍.

It's got another trick up its sleeve: **every Docker container comes with a clone of your repo**.

So to me, the best use for Actions is something that makes use of your codebase. Things like deployment or publishing tools, formatters, CLI tools - things that need access to your code. These are also all use-cases that aren't required to be really fast - if your NPM package takes a few minutes to publish, that's slow but not the end of the world.

That brings me to Actions' major weakness: they can be slow. We've got super smart folks working on Actions, and I know that speed is on their mind - but there will always be some latency while your Action starts up. It needs to build the Docker container and then run it.

Here's an example: an Action that comments on any newly created issue. Here's the code we'll use:

```docker
# Every Action needs a Dockerfile
FROM alpine
RUN	apk add --no-cache bash curl jq
COPY comment /usr/bin/comment
ENTRYPOINT ["comment"]
```

```bash
# comment - a Bash script to make a single API call
number=$(jq --raw-output .issue.number "$GITHUB_EVENT_PATH")
owner=$(jq --raw-output .repository.owner.login "$GITHUB_EVENT_PATH")
repo=$(jq --raw-output .repository.name "$GITHUB_EVENT_PATH")
curl -XPOST -sSL \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -d "{ body: 'Hello!' }"
  "https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments"
```

In my testing, this Action took about **20 seconds** to complete. Keep in mind that this is from an `alpine` base image; a larger image would significantly impact the build time. Your mileage may vary, and that may not sound like a lot - but with a running Probot App, it'd be about **3 seconds**.

It's not because Probot is better - in fact, in a lot of ways it's less powerful. It's just faster.

**Most workflow tools need to be fast.** But that's not what Actions are for; to me, they're for powerful, do-whatever-you-need-to-do automation tools, while Probot Apps are better suited for reacting to events and making quick, _small_ API requests.

### Probot Apps are just Express servers

GitHub Actions are ephemeral, so when their job is done they disappear. Probot on the other hand is, at its core, an [Express server](https://expressjs.com/) - so your app can build a UI for its users to interact with. [GitHub Learning Lab](https://lab.github.com) is a great example of a Probot App that does a lot more than just reacting to events on GitHub.

### When Probot is distinctly not right

Let's look at a GitHub Action I built that is just not suited for being a Probot App.

[**JasonEtco/upload-to-release**](https://github.com/JasonEtco/upload-to-release) uploads a file to a release. It makes a large API request, and is best paired with tools that generate some kind of archive (like [`docker save`](https://docs.docker.com/engine/reference/commandline/save/)).

To build this in a Probot App, you'd need to ensure that wherever you deploy the thing has enough resources and installed packages to build the file, then upload it. Actions let me decide whats installed by just defining dependencies in my `Dockerfile`, and it's got all the juice and time it needs.

#### Secret keys

This has been something the Probot Community (and I) have been thinking about for a while - how do users of an automation tool pass secret keys to the tool? With GitHub Actions, its as simple as adding your key through the GitHub UI, and passing it along to your action:

```hcl
action "Some action" {
  uses = "actions/npm@master"
  secrets = [ "NPM_TOKEN" ]
}
```

This enables your automation tools to talk to third-party services without needing to store users' credentials. Pretty rad ⚡

### Run Probot Apps... in GitHub Actions

Well, you _can_ use Probot Apps in GitHub Actions. It's just... weird. The best part of Probot, in my opinion, is its `EventEmitter`-like API:

```js
app.on('event', handler)
```

With GitHub Actions, you define your event and point it the "handler" or Action in the workflow file:

```hcl
workflow "My Workflow" {
  on = "event"
  resolves = ["Some action"]
}

action "Some action" {
  uses = "actions/npm@master"
}
```

You can [run Probot Apps in Actions](https://probot.github.io/docs/deployment#github-actions), but it means duplicating the defined event in the workflow and in the Probot App. You'll still have the benefit of writing your Action in Node.js, all the patterns of a regular Probot App, and free deployment through Actions - but it's like putting a spoiler on a bus, it'll still be slower than a racecar 🏎️

## So... what should you use?

Here's a table to give you a place to start, but **it aaaaaalways depends**:

| Probot                               | GitHub Actions                              |
| ------------------------------------ | ------------------------------------------- |
| Making a few API calls               | Running command line tools                  |
| Love Node.js and JavaScript          | Allergic to JavaScript                      |
| You can deploy a Node.js app         | GitHub take the wheel                       |
| Needs to be fast                     | Time is but a construct of your imagination |
| Acts entirely through the GitHub API | Needs your repo's codebase                  |
| Needs a UI                           | Requires the user's credentials             |
| Needs persistence                    | -                                           |
