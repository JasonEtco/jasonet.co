---
title: GitHub Workflows
date: '2019-01-24'
spoiler: Let's look at Workflows, a vital part of using GitHub Actions.
---

I've written about GitHub Actions [a couple](/posts/probot-app-or-github-action) of [times](/posts/building-github-actions-in-node) (because they're rad), but I haven't talked much about **workflows**. They're a vital part of actually using Actions, so let's take a look at what they are, how to write them, and some 🔥 tips I've picked up from lurking in the Actions team's Slack channel.

## The heck is a workflow?

Hopefully you're familiar with GitHub Actions; if not, [check out this great article](https://css-tricks.com/introducing-github-actions/) by [@sarah_edo](https://twitter.com/sarah_edo). Workflows are what define when and how a series of Actions should be run. You can think of it as the **plan of Actions** (pun 1000% intended).

GitHub will look for files with the `.workflow` extension in your repository's `.github` folder. Let's take a look at an example `.github/main.workflow` file:

```hcl
workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm install" {
  uses = "actions/npm@master"
  args = ["install"]
}

action "npm test" {
  uses = "actions/npm@master"
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

`on` is the [webhook event name](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files) that will trigger your workflow. Note that not all webhook events you might be used to using are available to Actions; you'll want to double check [in the docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files).

`resolves` is the name of the action that should be run first. An important note is that **actions can have "dependencies" by defining a `needs` property**. GitHub will consider those `needs` properties before going to run your actions.

## `action` objects

Each `action` object defines what action is run, what arguments you can pass, even what command is run inside of the action. Some key notes:

- You can have up to 100 `action` objects in a workflow
- The `needs` property will define a dependency tree. Actions will be run according to whatever actions it needs

The individual fields here are a lot more complicated because there are different ways to use each one. Let's dig in!

### uses

Arguably the most important field, `uses` defines what action you want to run. This can be any of the following:

- `owner/repo@ref`
- `./<filepath>`
- `docker://image`

The first option is pretty straightforward. It points to a repository on GitHub at the given ref. This can be a SHA, a tag or a branch; a common one might be `JasonEtco/lights-camera-action@v1.0.0`. A handy trick to know with this method is that **it's actually `owner/repo[/path]@ref`**; so you can point to a subdirectory of your repository.

This can be handy if you have one repo with a bunch of actions in it. However, **I wouldn't recommend doing that**. It's sort of like the whole "are monorepos good" debate, but GitHub has all kinds of discoverability hints for actions that are their own repos.

One important note: **any path must have a valid `Dockerfile`**; otherwise, the action will fail.

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

Lastly, and this is a really awesome feature, you can just use an arbitrary Docker image. This is _amazing_, because if all you want to do is run a command you don't even need a whole action:

```hcl{2}
action "My action" {
  uses = "docker://alpine"
  run = "echo"
  args = ["Hello", "World"]
}
```

Like with most things I talk about, you should [check out the GitHub Action docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#using-a-dockerfile-image-in-an-action) for more details!

### args

This property allows you to pass information to your workflow via command line arguments. So, given a workflow like this:

```hcl{3}
action "npm install" {
  uses = "actions/npm@master"
  args = "install"
}
```

This will use the [`actions/npm`](https://github.com/actions/npm) action, whose [entrypoint command](https://github.com/actions/npm/blob/master/entrypoint.sh#L15) runs `npm $*`. We're passing the argument `install`; so at the end of the day, it'll be `npm install`.

It's a fairly straightforward field, but let's take a look at some practical examples and how you might design an action that depends on user-set `args`.

My action [`JasonEtco/create-an-issue`](https://github.com/JasonEtco/create-an-issue) creates a new issue from a given template. By default, it will read from the `.github/ISSUE_TEMPLATE.md` file&mdash;but you can pass an argument to specify a different file:

```hcl{3}
action "Create issue" {
  uses = "JasonEtco/create-an-issue@master"
  secrets = ["GITHUB_TOKEN"]
  args = ".github/some-other-template.md"
}
```

Doing this makes the action way more extensible; you can have multiple workflows that use this functionality to open different issues.

Another thing I want to call out is that the `args` field is, by design, very barebones. In [a Node.js action](/posts/building-github-actions-in-node) for example, the arguments are passed as an array through `process.argsv`. That's totally standard, but it'd be amazing to give users an even more targeted way of configuring your action. You can use tools like [**actions-toolkit**](https://github.com/JasonEtco/actions-toolkit#toolsarguments) (which uses [**minimist**](https://github.com/substack/minimist) under the hood) to parse arguments into something more declarative, by using `--flag`s.

### secrets

Need to interact with a third party API? Want to make requests directly back to GitHub's API? Well, those things often require secret credentials to be passed. Fortunately, GitHub has a method for passing secrets to actions via the `secrets` field. These can be set in the GitHub UI, and are stored per-repo, which means that **no other repository will be able to read those secrets**.

Let's take a look at a practical example. Here's a workflow that compiles a TypeScript project, then publishes the compiled version to NPM:

```hcl{17-22}
workflow "Publish" {
  on = "release"
  resolves = ["npm publish"]
}

action "npm ci" {
  uses = "actions/npm@master"
  args = "ci"
}

action "npm run build" {
  needs = ["npm ci"]
  uses = "actions/npm@master"
  args = "run build"
}

action "npm publish" {
  needs = ["npm run build"]
  uses = "actions/npm@master"
  args = "publish"
  secrets = ["NPM_TOKEN"]
}
```

You'll see that we're passing an `NPM_TOKEN` to authenticate our publishing step. Without it, we wouldn't have permission to publish our library.

One handy thing to note is that the `GITHUB_TOKEN` is special. Its always set in your repository. You still have to decide if you want to pass it to `secrets`, but it'll let you make API requests and authenticate with GitHub.

---

There are [some more fields you can pass](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#actions-attributes), but these should be all you need for most workflows. [Let me know](https://twitter.com/JasonEtco) what nifty workflows you build :sparkles:
