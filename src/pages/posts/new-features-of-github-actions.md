---
title: New features of GitHub Actions v2
date: '2019-09-01'
spoiler: GitHub Actions got a massive update, with a ton of new features to talk about!
---
You might have read about [a big update to GitHub Actions](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd/) - <abbr title="Too long, didn't read">TLDR</abbr>, a lot is different but the overall concept is the same. It's a thing-doer; it lets you run arbitrary "jobs" in GitHub-orchestrated VMs.

In August, a ton of new functionality and changes were introduced to the platform. These centered around using Actions for CI, but in continuation with my previous blog posts, I want to highlight some features for doing more than just running your tests. Let's goooo ➡️

## Primer on the changes

You should definitely check out [the new documentation](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to get a full look at using Actions, but I'll note some key differences with Actions v1.

* Workflows were written in HCL; now they're written in YAML. [Syntax documentation](https://help.github.com/en/articles/workflow-syntax-for-github-actions) is available! Also check out [these starter workflows](https://github.com/actions/starter-workflows).
* Instead of multiple actions in a workflow, we now have a more granular breakdown of `workflow > jobs > steps`.
* Jobs are run in VMs instead of containers - including MacOS, Windows and Linux 😍🥰
* There's now an [official actions/toolkit](https://github.com/actions/toolkit), that includes some special interactions with the runtime.
* The visual workflow editor is no longer available; I don't know if there are plans to bring it back for the new YAML workflows or not.

---

In the rest of this post I'm going to focus on a few features that I think are an amazing addition to the Actions platform. Some are pure additions (didn't exist in v1), others are adaptations/improvements on features that did exist.

## Multi-line scripts

In v1, you could _kind of_ run arbitrary shell scripts without having to create an actual file:

```hcl
action "My action" {
  uses = "docker://alpine"
  run = "echo"
  args = ["Hello", "World"]
}
```

This would spin up a Docker container from the `alpine` image, and run `echo "Hello world"`. This came in handy in a lot of situations, but had a few limitations; for simple scripts, it meant creating a whole Docker image, and running multiple commands could feel really verbose. In Actions v2, you can just define a `run` property, _and give it a multiline string_, with multiple commands in one step 🤯

```yaml
steps:
  - name: Run this script
    run: |
      echo "Hello world!"
      echo "Wait, a multiline script?!?!"
      echo "That's too good to be true!"
```

This gets run in the already-running VM; so there's no additional setup time, it just runs as part of the workflow!

## Passing data to future steps

While writing a workflow, it's common to want to say "this Action does this, and this next Action does this, using the result of the previous Action". Unfortunately, that was challenging to accomplish in Actions v1 because while actions in a workflow shared a file-system, that was the only form of persistence. With v2, there are two options using the [official actions/toolkit](https://github.com/actions/toolkit):

* `core.setOutput()`, which sets `steps.<step_id>.outputs.<key>`
* `core.exportVariable()`, which sets a variable `$KEY`

Here's how you would use each one:

```js
// get-metadata.js
const core = require('@actions/core')
const { version, name } = require(process.env.GITHUB_WORKSPACE + 'package.json')
core.exportVariable('VERSION', version)
core.exportVariable('NAME', name)
```

```yaml
steps:
  - name: Get metadata
    run: node ./get-metadata.js
  - name: Tweet
    run: |
      curl -X POST \
        -d '{ "message": "Version ${VERSION} of ${NAME} was just published!" }'\
        "https://twitter-example.com/tweet"
```

`core.setOutput` works in a similar way:

```js
// Same code as the above get-metadata.js, except:
core.setOutput('version', version)
core.setOutput('name', name)
```

```yaml
steps:
  - name: Get metadata
    run: node ./get-metadata.js
    id: get_metadata
  - name: Tweet
    run: |
      curl -X POST \
        -d '{ "message": "Version ${{ steps.get_metadata.outputs.version }} of ${{ steps.get_metadata.outputs.name }} was just published!" }'\
        "https://twitter-example.com/tweet"
```

Note that these methods only support passing a string, but you could certainly do `JSON.stringify/parse` dance. Here we can create a standalone action that fetches all issues with the **bug** label, and expose it to future actions:

```js
const core = require('@actions/core')
const { GitHub, context } = require('@actions/github')

// Let's get a list of issues that have a particular label
const github = new GitHub(process.env.GITHUB_TOKEN)
const issues = await github.search.issuesAndPullRequests({
  q: `in:${context.repo.owner}/${context.repo.repo} label:bug`
})

// Expose it to future actions, using JSON.stringify() to pass it
core.setOutput('bugs', JSON.stringify(issues))

// Later, in a future action, you can parse the input:
const issues = JSON.parse(core.getInput('bugs'))
```

This can allow for much more composable actions than ever before, letting them do one thing and then passing that information around in your workflow.

These methods use functionality of the runtime that isn't documented (I had to [read through some code](https://github.com/actions/toolkit/blob/99d3ad0a6473e7e7906681627a450150a772ee1d/packages/core/src/command.ts) to figure out how it was working), so it may feel a little magical. Now, if you're like me, you're thinking "Can this be done without the toolkit or JavaScript?" Turns out, yes!

**Heads up**! This feature is not yet documented and is subject to change! For a more reliable method, use the toolkit methods if you can.

`core.exportVariable` actually prints a special string to `stdout`, and we can do it too!

```yaml
- name: Let's set an environment variable!
  run: |
    FOO=bar
    echo '::set-env name=FOO::$FOO'
- run: |
    echo $FOO
    # outputs "bar"
```

The key here is printing `::set-env name=KEY::value` to `stdout`. Similarly, `core.setOutput` prints `::set-output name=key::value`.

And to reiterate: this isn't documented yet, and the syntax will likely change, so beware! BUT IT'S SO COOL I HAD TO SHARE IT.

## Streaming logs

This was high on my list of missing features in [**Use GitHub Actions for CI**](/posts/use-github-actions-for-ci). Now, when an Actions workflow is running, you can see the output without having to wait until its done. This isn't just a quality of life improvement; the overall development experience when building an action is significantly faster.

## Declarative requirements for Actions

This is one of my favorite additions, not because of what it does today, but because of its potential. Actions can now define a map of `inputs` - configuration for the action itself. Previously, you'd have to set environment variables or use `args`, and that totally worked, but there was no way for an Action to say "hey I need this setting".

```yaml
# action.yml
name: My Action
inputs: 
  name:
    description: The name of the person to say hello to
    default: world
```

You can also mark an input as required via [actions/toolkit's `core.getInput`](https://github.com/actions/toolkit/tree/HEAD/packages/core#inputsoutputs):

```js
core.getInput('name', { required: true })
```

You can read more about [the metadata syntax for `action.yml`](https://help.github.com/en/articles/metadata-syntax-for-github-actions). `inputs` is a particularly interesting addition to me, because it adds a way to signal requirements for an Action. This can be expanded to a rich UI for implementing Actions, and a ton of context/information when using them! I'm excited for the future here.

> A note on the `using` property and JavaScript actions: y'all _know_ I'm excited about the potential there, but I think it's too early to write about it. The development and publishing experience has a lot of pain points (like having to check in `node_modules`), so I don't want to delve in until it's a little more resolved (which it will be)! I'll have a separate post on it soon!

## Matrix builds

This is an especially useful one. You can run multiple jobs by defining one job with a `matrix` strategy:

```yaml
jobs:
  build:
    strategy:
      matrix:
        node-version: [10.x, 12.x]
    steps:
    - uses: actions/checkout@v1
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: npm install, build, and test
      run: npm ci && npm run build && npm test
      env:
        CI: true
```

This effectively creates two jobs, one for `node-version: 10.x`, one for `node-version: 12.x`. This makes testing across versions really easy, but what else can we use it for? Let me spark your imagination with [Jest's `--testPathPattern`](https://jestjs.io/docs/en/cli#testpathpattern-regex)!

```yaml
jobs:
  test:
    strategy:
      matrix:
        testPath: ['./tests/client', './tests/server']
    steps:
      - uses: actions/checkout@v1
      - run: npm ci
      - run: jest --testPathPattern ${{ matrix.testPath }}
```

This example lets us run separate CI jobs for our `client` and `server` tests - effectively parallelizing test suites!

<small>Yes I know that Jest already does parallelization 🤫</small>

## Notable mention lightning round ⚡️

* YAML is going to be more familiar to a lot of people; while I was really starting to like HCL, I think its a good decision for the users of Actions.
* [The `if` property](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idstepsif), conditionally running a job. It's not super powerful, and many workflows will still need some kind of filter script, but for simple checks it's a really great addition. I'll have a separate post on this soon!
* [`branch` filters](https://help.github.com/en/articles/configuring-a-workflow#filtering-for-specific-branches), similar to the previous point but at the workflow level!
* Cloning the repository in an action was separated to [its own action](https://github.com/actions/checkout) - this is an important feature, but it isn't needed for every action, so I'm glad they made it optional!
* Colored log output, it's a quality of life improvement that improves the quality of my life ❤️💚💙
* First-class README badges! Check out [the docs](https://help.github.com/en/articles/configuring-a-workflow#adding-a-workflow-status-badge-to-your-repository), but: `![Status](https://github.com/<owner>/<repo>/workflows/<workflow_name>/badge.svg)`. A really great addition to any CI tool 🛡

This isn't an extensive list, so [check out the docs](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) for all of the available features! If I missed any that you feel are particularly interesting, [let me know](https://twitter.com/jasonetco) or [open a PR adding it](https://github.com/jasonetco/jasonet.co)!
