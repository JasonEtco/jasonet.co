---
title: Probot App or GitHub Action? (Updated)
date: '2020-04-13'
spoiler: Should your next automation tool be built in GitHub Actions, or as a separate service with Probot?
---

_This is a second post on the same topic - the first was published before [GitHub Actions v2 was introduced](/posts/probot-app-or-github-action)._

**Spoiler: it (still) depends.**

GitHub Actions and Probot are two totally separate projects with the same end goal: to enable and empower developers to extend their workflows, and make GitHub work exactly how they want it to. I get questions about when I'd use either one, and while a lot of [the original version of this post is still true](/posts/probot-app-or-github-action), Actions has evolved since then. A quick primer on each tool:

## GitHub Actions

I won't go too deep into what Actions are - you can check out [the official docs](https://help.github.com/en/actions) to learn more. The important notes for right now are:

1. Run code to respond to an event on GitHub
2. GitHub will run _anything_ in a virtual machine

The key point is that GitHub runs your Actions in an ephemeral virtual machine - there's no hosting, server costs or deployment to worry about. It's sort of like a scoped serverless function that's triggered by events in a GitHub repository. These can be either Container actions (code that runs in a Docker container) or a JavaScript action, where the JS code is run immediately inside the virtual machine.

## Probot

[Probot](https://probot.github.io) is an [open-source](https://github.com/probot/probot) framework for building [GitHub Apps](https://developer.github.com/apps/) in [Node.js](https://nodejs.org). It handles boilerplate things like authentication, and provides a straightforward [`EventEmitter`-like API](https://probot.github.io/docs/hello-world/).

It's been enabling developers to build automation and workflow tools for a while - I like to think of it as an inspiration for Actions!

## What's best for you?

Let's start by talking about GitHub Actions' sweet spot. It's the kind of automation tool that I'd never want to build using Probot: something long-running.

At the time of writing, Actions has a timeout of 6 hours. That means that (and this isn't an exaggeration) you can run whatever code you want in a virtual machine so long as it doesn't take longer than that time - _and GitHub will run it for you_ 😍.

Actions are intended to be reused across workflows - you can "import" an action and use it, even if the code lives outside of your repository, sort of like a dependency. One vitally important Action is [actions/checkout](https://github.com/actions/checkout) - it clones the repository that the workflow is running in, and allows your workflow to interact directly with the repo's code.

So to me, the best use for Actions is something that makes use of your codebase. Things like deployment or publishing tools, formatters, CLI tools - things that need access to your code. One concrete example - let's say you want to simply log all instances of a string in your codebase, maybe for auditing reasons:

```yaml
- uses: actions/checkout@v2
- runs: grep "GitHub Actions" -r .
```

This will log all instance of `GitHub Actions` - no muss, no fuss, that's all you'd need to do (plus the other workflow file boilerplate).

### Speed

In v1 of this post, I cited performance as one of Actions' major downsides. In the time since, Actions have become _way_ faster - and while they won't match the immediacy of a Probot app, they're more than fast enough for most automation tools.

This is still a point of interest though - if you need your automation tool to act immediately after something happens on GitHub, Actions will need to spin up a virtual machine and start running code. A Probot app will always be running, and will immediately receive a webhook payload and begin executing the relevant handler.

### Actions are scoped to repositories

Currently, GitHub Actions only act within repositories, and only on repository-focused events. For example, if you create an issue within a repository, you can kick off an Actions workflow from that trigger. You won't be able to trigger an Actions workflow when something happens at the organization level - like a new member being added, or a repository being created. I've seen a ton of feature requests around this functionality, so I'm optimistic that there's more coming down the line.

#### Actions' logs show up in the repository

This is a really great feature - your automation tool can write logs that are accessible directly in the GitHub UI. Compared to a separate service with its own logging system, this can really bring the context of workflow activity to the right people, without a ton of effort or context-switching.

### Probot Apps are just Express servers

I've [written a whole article on this](/posts/build-your-own-probot), but GitHub Actions are ephemeral, so when their job is done they disappear. Probot on the other hand is, at its core, an [Express server](https://expressjs.com/) - so your app can build a UI for its users to interact with. [GitHub Learning Lab](https://lab.github.com) is a great example of a Probot App that does a lot more than just reacting to events on GitHub. It stores data, has a UI - it does all the things that a real web app can do.

### Metrics/usage data

There aren't any ways to see how frequently an Action is used, or how many workflows include it. There's no error reporting or observability - Actions run in the end-user's repository, and there's no way for the Action author to get insights into its usage. I would expect this to change in the future, so this is an observation of the current state. Probot, as a regular old Express app, can hook into whatever metrics tooling you're interested in using.

### Composability

Actions are designed to be composed into different workflows. They can live as separate repos, and can be imported into a workflow by just pointing to the Actions' repo:

```yaml
- uses: owner/repo@ref
```

This can save a ton of time, when an Action already exists that fits your need.

### When Probot is distinctly not right

Let's look at a GitHub Action I built that is just not suited for being a Probot App.

[**JasonEtco/upload-to-release**](https://github.com/JasonEtco/upload-to-release) uploads a file to a release. It makes a large API request, and is best paired with tools that generate some kind of archive (like [`docker save`](https://docs.docker.com/engine/reference/commandline/save/)).

To build this in a Probot App, you'd need to ensure that wherever you deploy the thing has enough resources and installed packages to build the file, then upload it. Actions let me decide whats installed by just defining dependencies in my `Dockerfile`, and it's got all the juice and time it needs.

### Secret keys

This has been something the Probot Community (and I) have been thinking about for a while - how do users of an automation tool pass secret keys to the tool? With GitHub Actions, its as simple as adding your key through the GitHub UI, and passing it along to your action:

```yaml
- uses: JasonEtco/create-an-issue@master
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
```

This enables your automation tools to talk to third-party services without needing to store users' credentials. Pretty rad ⚡

**But** I'd be remiss if I didn't share my wish for the repository secrets feature to be available to all integrations. Currently, only GitHub Actions can _read_ the value of secrets, while all integrations can set them [via the Actions API](https://developer.github.com/v3/actions/secrets/). While that is likely done for security reasons, it limits other integrations' potential to use the feature. In other words - I wish this weren't an _Actions_ API, but just a regular API.

## So... what should you use?

Here's a table to give you a place to start, but **it aaaaaalways depends**:

| Probot                               | GitHub Actions                              |
| ------------------------------------ | ------------------------------------------- |
| Does "organization" things           | Scoped to a repository                      |
| Love Node.js and JavaScript          | Allergic to JavaScript                      |
| You can deploy a Node.js app         | GitHub take the wheel                       |
| Needs to be immediate                | Time is but a construct of your imagination |
| Acts entirely through the GitHub API | Needs your repo's codebase                  |
| Needs a UI                           | Requires secret credentials                 |
| Operations happen quickly            | Jobs can take a while (up to 6 hours)       |
| Moar metrics                         | Set it and forget it                        |
| Needs persistence                    | -                                           |
