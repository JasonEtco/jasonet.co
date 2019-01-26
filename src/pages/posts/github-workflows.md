---
title: GitHub Workflows
date: '2019-01-24'
spoiler: Let's look at Workflows, a vital part of using GitHub Actions.
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

In non-code, this workflow says:

> Anytime someone `push`es to this repo, run the `npm` action with the argument `install` (so, `npm install`). Then, when that's done, run the `npm` action with the argument `test` (so, `npm test`).

## The `workflow` object

```hcl
workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}
```

Here's where we define the workflow's metadata. This [only takes two fields](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#workflow-attributes); `on` and `resolves`.

`on` is the [webhook event name](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files) that will trigger your workflow. Note that not all webhook events you might be used to using are available to Actions - you'll want to double check [in the docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files).

`resolves` is the name of the action that should be run first. An important note is that **actions can have "dependencies" by defining a `needs` property**. GitHub will consider those `needs` properties before going to run your actions.

## `action` objects

Each `action` object defines what action is run, what arguments you can pass, even what command is run inside of the action. Some key notes:

- You can have up to 100 `action` objects in a workflow
- The `needs` property will define a dependency tree - actions will be run according to whatever actions it needs

The individual fields here are a lot more complicated, because there are different ways to use each one. Let's dig in!

### `uses`

Arguably the most important field, `uses` defines what action you want to run. This can be any of the following:

- `owner/repo@ref`
- `./<filepath>`
- `docker://image`

The first option is pretty straightforward - it points to a repository on GitHub at the given ref. This can be a SHA, a tag or a branch - a common one might be `JasonEtco/lights-camera-action@v1.0.0`. A handy trick to know with this method is that \*\*it's actually `owner/repo[/path]@ref` - so you can point to a subdirectory of your repository.

This can be handy if you have one repo with a bunch of actions in it - however, **I wouldn't recommend doing that**. It's sort of like the whole "Are mono-repos good" debate, but GitHub has all kinds of discoverability hints for actions that are their own repos.

One important note - **any path must have a valid `Dockerfile`**; otherwise, the action will fail.

Now, you can also point your workflow to a folder in the same repository; so given a file tree like this:

```
├── .github
│   └── main.workflow
└── my-action
    ├── Dockerfile
    └── entrypoint
```

You can point your workflow to the `my-action` directory. Your `uses` key **must start with a `./`**, to specify that you want to use a file in this repo:

```hcl{2}
action "My action" {
  uses = "./my-action"
}
```

Lastly, and this is a really awesome feature, you can just use an abritrary Docker image. This is _amazing_, because if all you want to do is run a command you don't even need a whole action:

```hcl{2}
action "My action" {
  uses = "docker://alpine"
  run = "echo"
  args = ["Hello", "World"]
}
```

Like with most things I talk about, you should [check out the GitHub Action docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#using-a-dockerfile-image-in-an-action) for more details!
