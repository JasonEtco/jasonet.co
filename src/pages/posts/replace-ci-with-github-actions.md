---
title: Replace <CI Provider> with GitHub Actions
date: '2019-03-07'
spoiler: GitHub Actions can do a lot, including CI. Let's look at how to do it right!
---

GitHub Actions can do a whole of things - [delete branches], [compose tweets via pull requests]; it's kind of a general "thing do-er." However, when people hear about Actions, they often ask "is GitHub Actions a replacement for CI providers?" It's a great platform to have CI built into your workflow with minimal setup but a lot of control, so its a totally reasonable question.

I'm here to tell you: **sometimes**! In this post, I'll share a workflow that I've been using for my Node.js projects, as well as some extensions to it for additional functionality. We'll also take a look at features of popular CI tools and see how they map to GitHub Actions.

## Some pre-reading

I'll be delving into the nitty gritty of writing a workflow file, including some lesser-known functionality. I'd encourage you to read [my previous blog post on GitHub Actions workflows](./what-are-github-workflows), where I talk a bit about workflows as a whole.

You may also want to familiarize yourself with the [actions/bin repo](https://github.com/actions/bin), a collection of actions that are highly scoped and useful for composing a workflow without writing any custom code (especially [actions/bin/filter](https://github.com/actions/bin/blob/master/filter)).

## Why

Why is this a conversation? Are GitHub Actions the _best_ platform on which to run your tests? I'd say it really depends on your needs. If all you need to is to run your tests, I think it's a great tool to do so. It's simple to setup, is just another file in your repo, and doesn't rely on an additional service. 

## A typical Node.js workflow

This is a `main.workflow` file that I've been using for a couple of projects and it's been a great experience. With most CI providers, I need to follow these steps:

1. Push a configuration file to my repo
2. Go to their site and find my repo
3. Hit a checkbox/toggle to enable that CI provider to build my repo
4. Push again to trigger CI

Nowadays, I create my `.github/main.workflow` file and this is my whole process:

1. Push a configuration file to my repo

75% efficiency improvement! Because most of my projects follow the exact same CI patterns and have the exact same requirements, it really is repetitive. So, here's the `main.workflow` file in it's entirety:

```hcl
workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "docker://node:alpine"
  runs = "npm"
  args = "ci"
}

action "npm test" {
  needs = "npm ci"
  uses = "docker://node:alpine"
  runs = "npm"
  args = "test"
}
```

Let's break this down. There are some decisions I've made here that may not be perfect for every project, but that's okay - it's just a starting point.

The first thing that may look new to you is this `docker://` line:

```hcl{2}
action "npm ci" {
  uses = "docker://node:alpine"
  runs = "npm"
  args = "ci"
}
```

Instead of pointing to an action the has a Dockerfile, you can tell it to use a particular Docker image. It's like declaring `FROM node:alpine`, but without needing a Dockerfile :tada:

Another question you may be asking: "Jason, why didn't you use the `actions/npm` action, isn't this what it's for?" Great question! Let's step back for a second and remind ourselves that actions works by building and running Docker images. The smaller the image, the faster your action will run - less download time, less build time, means less overall running time.

[actions/npm uses the `node:slim` Docker base image](), which isn't quite as small as `node:alpine`. You can [read up on the differences](https://derickbailey.com/2017/03/09/selecting-a-node-js-image-for-docker/) to see what's right for your project. So far, the biggest difference that I've found is that `node:alpine` doesn't ship with Git, so if your project uses dependencies [installed from a Git repository]() you'll need to use `node`.

We then define a `runs` property to use the `npm` CLI that ships with Node.js. This one file gets us two individual Docker images that run `npm ci` to install our app's dependencies and `npm test` to run our automated tests.

### Code coverage

In a subset of my projects, I use [Codecov](https://codecov.io) to track how much of my code is covered by my tests. It's a great tool and has a CLI - if it has a CLI, we can use it in Actions :sunglasses:. So here's an addition we can make:

```hcl
# An action that uses `npx` and the `codecov` CLI
action "codecov" {
  needs = "npm test"
  uses = "docker://node"
  runs = "npx"
  args = "codecov"
  secrets = ["CODECOV_TOKEN"]
}
```

We also need to update the `resolves` property of our workflow to ensure that our actions' ordering is correct:

```diff
 workflow "Test my code" {
   on = "push"
-  resolves = ["npm test"]
+  resolves = ["codecov"]
 }
```

And after adding the `CODECOV_TOKEN` secret in the GitHub UI, we're done! Using `npx` we download and run the `codecov` package, and the CLI does the rest :sparkles:

### Testing multiple version of Node.js

This is a really interesting task that we can tackle without too much complication. We basically want to define two (or multiple) trees; one for each version. Let's have our workflow run our tests in the newest version of Node.js and version `10.x.x` (which at the time of writing is LTS).

First, let's prepare our `resolves` property to wait for two distinct actions before marking the workflow as completed:

```diff
 workflow "Test my code" {
   on = "push"
-  resolves = ["npm test"]
+  resolves = ["npm test (10)", "npm test (latest)"]
 }
```

Next, we'll duplicate our actions but specify a version in our `uses`:

```hcl
# node@10
action "npm ci (10)" {
  uses = "docker://node:10-alpine"
  runs = "npm"
  args = "ci"
}

action "npm test (10)" {
  needs = ["npm ci (10)"]
  uses = "docker://node:10-alpine"
  runs = "npm"
  args = "test"
}

# node@latest
action "npm ci (latest)" {
  uses = "docker://node:alpine"
  runs = "npm"
  args = "ci"
}

action "npm test (latest)" {
  needs = ["npm ci (latest)"]
  uses = "docker://node:alpine"
  runs = "npm"
  args = "test"
}
```

That's pretty much all there is to it. We've got two trees of actions (based on their `needs` properties) that will run in separate containers on separate versions of Node.js.
