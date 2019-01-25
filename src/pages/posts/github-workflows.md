---
title: GitHub Workflows
date: '2019-01-24'
spoiler: Let's look at Workflows, a vital part of GitHub Actions.
---

I've written about GitHub Actions [a couple](./posts/probot-app-or-github-action) of [times](./posts/building-github-actions-in-node) (because they're rad), but I haven't talked much about **workflows**. They're a vital part of actually using Actions, so let's take a look at what they are, how to write them, and some 🔥 tips I've picked up from lurking in the Actions team's Slack channel.

## The heck is a workflow?

Hopefully you're familiar with Actions - if not, [check out this article](). Workflows are what define when and how an Action should be run. You can think of it as the **plan of Actions** (pun 1000% intended).

GitHub will look for files with the `.workflow` extension in your repository's `.github` folder. Let's take a look at an example `.github/main.workflow` file:

```hcl
workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm install" {
  uses = "actions/npm"
  args = ["install"]
}

action "npm test" {
  uses = "actions/npm"
  args = ["test"]
  needs = ["npm install"]
}
```

In English, this workflow says:

> Anytime someone `push`es to this repo, run the `npm` action with the argument `install` (so, `npm install`). Then, when that's done, run the `npm` action with the argument `test` (so, `npm test`).

Here's where we define the workflow's metadata. This [only takes two fields](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#workflow-attributes); `on` and `resolves`.

`on` is the [webhook event name](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files) that will trigger your workflow. Note that not all webhook events you might be used to using are available to Actions - you'll want to double check [in the docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files).

`resolves` is the name of the action that should be run first. An important note is that **actions can have "dependencies" by defining a `needs` property**. GitHub will consider those `needs` properties before going to run your actions.
