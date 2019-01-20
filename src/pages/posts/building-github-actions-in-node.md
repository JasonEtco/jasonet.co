---
title: Building GitHub Actions in Node.js
date: '2019-01-23'
spoiler: GitHub Actions are an awesome automation tool - let's look at how to build one in everyone's favorite interpreted language.
---

Hey! You there! Heard all about these new fandangled [GitHub Actions](https://github.com/features/actions), and want to go out and build one? Well then let's do it!

This post will serve as a guide to building a run-of-the-mill GitHub Action in Node.js. You can build Actions in whatever language/runtime you want - I'm choosing Node.js because [JavaScript is the largest language on GitHub](https://octoverse.github.com/projects#languages) and because Node.js is bae 😍

### Before we dive in

I'll assume that you've built some things in Node before - this post won't cover Node.js fundamentals, just the things specific to Actions.

If you aren't at all familiar with Actions, check out @jessfraz's [excellent post on the life of an Action](https://blog.jessfraz.com/post/the-life-of-a-github-action/) - it should help you wrap your head around the concept, because this post is really about building the thing.

## What we're building

As a thought experiment, let's build @jessfraz's [`branch-cleanup-action`](https://github.com/jessfraz/branch-cleanup-action) Action. It deletes branches whose pull requests have been merged. If you just want to use the thing, you should use hers - we're just going to port it to Node for fun!

## Let's do it

We'll start by preparing our `Dockerfile`. **Every Action runs in a Docker container**, so we need to describe that container. The below code should suffice for most (but not all) Node.js GitHub Actions. Docker is an amazing technology, but if your goal is just to build your Action you shouldn't need to learn it all.

```docker
FROM node:slim

# A bunch of `LABEL` fields for GitHub to index
LABEL "com.github.actions.name"="Delete merged branches"
LABEL "com.github.actions.description"="Cleans up merged branches."
LABEL "com.github.actions.icon"="gear"
LABEL "com.github.actions.color"="red"
LABEL "repository"="http://github.com/JasonEtco/node-branch-cleanup-action"
LABEL "homepage"="http://github.com/JasonEtco/node-branch-cleanup-action"
LABEL "maintainer"="Jason Etcovitch <jasonetco@github.com>"

# Copy over project files
COPY . .

# Install dependencies
RUN npm install

# This is what GitHub will run
ENTRYPOINT ["node", "/index.js"]
```

> We're using `node:slim` to have a small, but still functional Docker image. You can use whatever image you want, but **a smaller image will make for a faster Action**.

Are there ways to make that `Dockerfile` better? [Sure](https://hub.docker.com/_/node/#nodeversion-alpine)! But we're going for clarity over performance for now.

Let's go ahead and create our `index.js` file:

```js
// index.js
console.log('Hi GitHub!')
```

Now, when GitHub runs this Action, it will build the Docker container from the [`node:slim`](https://hub.docker.com/_/node/#nodeversion-slim) tag and run `node /index.js` - which will print `Hi GitHub!` to the Action logs:

```
Step 11/11 : ENTRYPOINT ["node", "/index.js"]
 ---> Using cache
 ---> 539689e6c5b6
Successfully built 539689e6c5b6
Successfully tagged gcr.io/gct-12-...
Already have image (with digest): gcr.io/github-actions-images/action-runner:latest
Hi GitHub!
```

Honestly, now you can build whatever you want. You've "set up your environment," and all that's left is writing your code. There are some special things in Actions that I'd like to talk about though; hang tight, because we'll finish our Action before this post is over.

### Environment variables

The container in which your `index.js` file is being run has a few things injected as environment variables - I'll cover the main ones below, but you can [see the full list](https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#environment-variables) in the GitHub Action documentation.

- `GITHUB_TOKEN`: An authentication token used to make API requests to GitHub.
- `GITHUB_EVENT_PAYLOAD`: A path to a `.json` file containing the event that triggered the action. This is where you'll find things like the resource that triggered it (like an opened PR, or a commit).

## But I depend on dependencies!

Cool, me too! I'll share some libraries that are particularly useful for GitHub Actions, as well as [**actions-toolkit**](https://github.com/JasonEtco/actions-toolkit), a library I'm working on designed specifically for Actions.

#### [@octokit/rest](https://npmjs.org/package/@octokit/rest) & [@octokit/graphql](https://npmjs.org/package/@octokit/graphql)

These are part of the official family of GitHub API SDKs called **Octokit**. If you're making requests to the GitHub API (REST or GraphQL), these are great libraries to look at.

#### [minimist](https://npmjs.org/package/minimist)

A really interesting part of GitHub Actions is the ability to pass arguments by defining them in your workflow. `minimist` is a handy tool for parsing a string of arguments:

```hcl
args = "some-arg --flag true
```

```js
minimist(process.argsv)
// -> { _: ['some-arg'], flag: true }
```

#### [Probot](https://probot.github.io)

I'd be remiss if I didn't mention [Probot](https://probot.github.io), a framework for building GitHub Apps. We've taken a lot of care into building testing patterns and helpful extensions. You can [deploy your Probot Apps to GitHub Actions](https://probot.github.io/docs/deployment#github-actions), but it [comes with some tradeoffs](/posts/probot-apps-or-github-actions#run-probot-apps-in-github-actions).

That said, if all you care about is the syntactic sugar that Probot provides, go right ahead!

### [actions-toolkit](https://github.com/JasonEtco/actions-toolkit)

**actions-toolkit** is a wrapper around some fantastic open source libraries, and provides some helper methods for dealing with GitHub Actions. It some of the above libraries, and bases its paradigms on our experience building and using Probot. Check out the repo for [the full API documentation](https://github.com/JasonEtco/actions-toolkit#readme).

I'm looking for feedback on its use, as well as potential new features - [let me know if you have any thoughts](https://github.com/JasonEtco/actions-toolkit/issues/new)!

I don't want this to be a "use this library, its the definitive way to build Actions" kind of post - that's why I'm leaving it to the end. **You can absolutely build all this functionality yourself but... now you don't have to** 🙌

## Back at it

Ok, back to our Action. Using `actions-toolkit` (you'll need to `npm install` it), here's the whole `.js` file:

```js
// index.js
const { Toolkit } = require('actions-toolkit')
const tools = new Toolkit()

const { event, payload } = tools.context
if (
  event === 'pull_request' &&
  payload.action === 'closed' &&
  payload.pull_request.merged
) {
  // An authenticated `@octokit/rest` instance
  const octokit = tools.createOctokit()

  // Delete the branch
  octokit.gitdata.deleteRef(tools.context.repo({
    ref: `heads/${payload.pull_request.head.ref}`
  })).then(() => {
    console.log('Branch deleted!')
  })
}
```

<img width="775" alt="image" src="https://user-images.githubusercontent.com/10660468/51445322-aeecae00-1cd1-11e9-865b-0ef53ae44a5a.png">


And that's it! Hopefully this will give you an idea on how to build your own GitHub Actions in Node.js. [Tweet me](https://twitter.com/JasonEtco) with whatever you build ✨
