---
title: Start using GitHub Actions for CI
date: '2019-03-07'
spoiler: GitHub Actions can do a lot, including CI. Let's look at how to do it right!
---

GitHub Actions can do a whole lot of things - [delete branches](https://github.com/jessfraz/branch-cleanup-action), [compose tweets via pull requests](https://github.com/gr2m/twitter-together); it's kind of a general "thing do-er." However, when people hear about Actions, they often ask "is GitHub Actions a replacement for CI providers?" It's a great platform to have CI built into your workflow with minimal setup but a lot of control, so its a totally reasonable question.

I get to use everyone's favorite answer: **it depends**! In this post, I'll share a workflow that I've been using for my Node.js projects, as well as some extensions to it for additional functionality. We'll also take a look at features of popular CI tools and see how they map to GitHub Actions.

## Some pre-reading

I'll be delving into the nitty-gritty of writing a workflow file, including some lesser-known functionality. I'd encourage you to read [my previous blog post on GitHub Actions workflows](./what-are-github-workflows), where I talk a bit about workflows as a whole.

You may also want to familiarize yourself with the [actions/bin repo](https://github.com/actions/bin), a collection of actions that are highly scoped and useful for composing a workflow without writing any custom code (especially [actions/bin/filter](https://github.com/actions/bin/blob/master/filter)).

## But I love `{{ ci_provider }}` - why should I care?

You'll see the benefits soon, but I'm not saying that existing projects migrate their CI to Actions; rather, new projects benefit from the minimal setup of a CI workflow if you know what you're doing. Are GitHub Actions the _best_ CI platform? I'd say it really depends on your needs; if you're just running test, you can get a lot of functionality with very little effort (I know, the dream :heart_eyes:).


## A typical Node.js workflow

This is a `main.workflow` file that I've been using for a couple of projects and it's been a great experience. With most CI providers, I need to follow these steps:

1. Push a configuration file to my repo
2. Go to their site and find my repo
3. Hit a checkbox/toggle to enable that CI provider to build my repo
4. Push again to trigger CI

Nowadays, I create my `.github/main.workflow` file and this is my whole process:

1. Push a configuration file to my repo

75% efficiency improvement! Because most of my projects follow the exact same CI patterns and have the exact same requirements, it really is repetitive. So, here's the `main.workflow` file in its entirety:

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

Instead of pointing to an action that has a Dockerfile, you can tell it to use a particular Docker image. It's like declaring `FROM node:alpine`, but without needing a Dockerfile :tada:

Another question you may be asking:

> Jason, why didn't you use the [`actions/npm` action](https://github.com/actions/npm), isn't this what it's for? 

Great question! Let's step back for a second and remember that GitHub Actions builds and runs Docker images. The smaller the image, the faster your action will run - less download time, less build time, means less overall running time.

[actions/npm uses the `node` Docker base image](https://github.com/actions/npm/blob/59b64a598378f31e49cb76f27d6f3312b582f680/Dockerfile#L1), which isn't quite as small as `node:alpine`. You can [read up on the differences](https://derickbailey.com/2017/03/09/selecting-a-node-js-image-for-docker/) to see what's right for your project. So far, the biggest practical difference that I've found is that `node:alpine` doesn't ship with Git, so if your project uses dependencies [installed from a Git repository](https://docs.npmjs.com/cli/install#description) you'll need to use `node`.

We then define a `runs` property to use the `npm` CLI that ships with Node.js. This one file gets us two individual Docker containers that run `npm ci` to install our app's dependencies and `npm test` to run our automated tests. Actions in the same workflow can access a shared filesystem, despite each action running in a separate container.

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

That's pretty much all there is to it. We've got two trees of actions (based on their `needs` properties) that will run in separate containers on separate versions of Node.js. Here's how GitHub renders the workflow in the visual editor:

<img width="509" alt="Rendering of the dual-version workflow" style="display: block; margin-right: auto; margin-left: auto" src="https://user-images.githubusercontent.com/10660468/54003860-97527300-4121-11e9-8b6d-f13065aeed0e.png">

You could also choose to do two separate `workflow`s, to have two distinct statuses:s

```hcl
workflow "Test my code in node@10" {
  on = "push"
  resolves = ["npm test (10)"]
}
workflow "Test my code in node@latest" {
  on = "push"
  resolves = ["npm test (latest)"]
}
 ```

## Converting a CI provider's config file to a workflow

We're going to convert the `.travis.yml` file in the [facebook/jest]([https://github.com/facebook/jest/blob/master/.travis.yml](https://github.com/facebook/jest/blob/130547baaca44171464c9e1b5bc8dec6b26565ff/.travis.yml)) repository (one of my favorite libraries) over to a `main.workflow` file. At the time of writing, here's what it looks like:

```yaml
# https://github.com/facebook/jest/blob/master/.travis.yml
language: node_js
node_js:
  - '10'
before_install:
  - curl -o- -L https://yarnpkg.com/install.sh | bash
  - export PATH="$HOME/.yarn/bin:$PATH"
install: yarn --frozen-lockfile
cache:
  yarn: true
  directories:
    - '.eslintcache'
    - 'node_modules'
script:
- yarn run test-ci-partial
```

Some parts of this don't map perfectly to Actions. The `cache` property doesn't have an equivalent - instead, GitHub caches Docker images. There's lots still to do in this space to make action runs fast, so let's skip it for now. 

That leaves us with the following information: we're using `node@10`, `yarn`, and running the `test-ci-partial` script after installing our dependencies. For these actions, we'll use [nuxt/actions-yarn](https://github.com/nuxt/actions-yarn) which handily supports [different versions of Node.js](https://github.com/nuxt/actions-yarn#node-versions). Here's what that might look like:

```hcl
workflow "Test my code" {
  on = "push"
  resolves = ["test-ci-partial"]
}

action "Install dependencies" {
  uses = "nuxt/actions-yarn@node-10"
  args = "--frozen-lockfile"
}

action "test-ci-partial" {
  needs = "Install dependencies"
  uses = "nuxt/actions-yarn@node-10"
  args = "run test-ci-partial"
}
```

That should do it! By using an external action, we can keep our workflow nice and clean :nail_care:. One thing to note is that `nuxt/actions-yarn` uses the full `FROM node` image - for the sake of optimization, you might consider forking the action and using a smaller base image.

Here's a similar exercise with proven results in [JasonEtco/create-an-issue](https://github.com/JasonEtco/create-an-issue) of [replacing a basic `.travis.yml` file with a workflow](https://github.com/JasonEtco/create-an-issue/compare/d10d7bc2a567fa4288ead6b91f307aa4b44fb9f7...3b32e1e16d13ce431cc2ad4031eda7ba1396096a). Performance is important for CI, we want our tests to run quickly - so let's look at the difference in execution time:

| Provider       | Execution time |
|----------------|----------------|
| Travis CI      | 36 seconds     |
| GitHub Actions | 34 seconds     |

They're basically the same! The functionality stays exactly the same; not additional features of either platform are in use, it just runs our tests. We haven't taken into account any of the speed improvements available to us in TravisCI, this is just the default behavior. Comparatively, I think that execution speed will only improve with GitHub Actions, and I'm really curious to see what kind of improvements users will get without any additional effort.

## README Badges

A beloved feature of most CI providers is their ability to show a badge on a repository's README, depicting the status of the build (whether its passing, failing, etc). I'm so used to the badges that if they aren't present my eyes get confused. Unfortunately, there's no first-class badge support with Actions. I built [JasonEtco/action-badges](https://github.com/JasonEtco/action-badges) for this purpose; it works by [querying for the repository's Check Suites](https://developer.github.com/v3/checks/suites/#list-check-suites-for-a-specific-ref) and deriving a status by looking for the GitHub Action app's activity.

```markdown
![Build Status](https://action-badges.now.sh/JasonEtco/example)
```

## Running CI on pull requests from forks

GitHub Actions and forked repositories are currently in a weird state. I expect this to improve quickly, but right now when a pull request is opened from a fork to the upstream, there are a few oddities. The first is that it will only trigger the `pull_request` event - that makes sense because the associated `push` isn't happening on the upstream repo. However, this leads to the actual issues: the tests are run against the master branch, and the status isn't reflected back to the pull request.

[@gr2m](https://twitter.com/gr2m) created [git-checkout-pull-request-action](https://github.com/gr2m/git-checkout-pull-request-action) to checkout the fork's branch before running tests - it'll intercept the workflow and, if necessary, make sure the tests are running against the appropriate code. This solves the first of those two problems, but not the second - the PR isn't updated with the status of the checks :disappointed:. The only way to check that status is to open the `Actions` tab and find try to find the correct run.

I fully expect that behavior to change for the better before GitHub Actions leaves beta status (the Actions team is full of real smart people), so I hope to update this post when it does!

## Where Actions isn't perfect

This post isn't intended to somehow prove that independent CI tools are made redundant by Actions - just that for _some_ use-cases, you can choose between the two.

For example, a project I use and love, [matchai/spacefish](https://github.com/matchai/spacefish), can't use Actions for CI because Docker doesn't support macOS images. Some projects need to be tested in environments that Docker just doesn't support. And that workflow with multiple versions of Node.js? With more versions/variations it'd become even more verbose.

And that's ok - GitHub Actions is awesome, but it's not a silver bullet. It can do a lot, but in the case of Actions, like most things, GitHub promotes a platform approach. It's a tool for integrating with GitHub and doing some things, but leaving room for more powerful robust integrations can't be built by one company trying to do it all.
