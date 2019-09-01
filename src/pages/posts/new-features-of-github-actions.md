---
title: New features of GitHub Actions v2
date: '2019-09-01'
spoiler: GitHub Actions got a massive update, with a ton of new features to talk about!
---
You might have read about [a big update to GitHub Actions](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd/) - <abbr title="Too long, didn't read">TLDR</abbr>, a lot is different but the overall concept is the same. It's a thing-doer; it lets you run arbitrary "jobs" in GitHub-orchestrated VMs.

In August, a ton of new functionality and changes were introduced to the platform. These centered around using Actions for CI, but in continuation with my previous blog posts, I want to highlight some features for doing more than just running your tests. Let's goooo ➡️

## Primer on the changes

You should definitely check out [the new documentation](https://help.github.com/en/categories/automating-your-workflow-with-github-actions) to get a full look at using Actions, but I'll note some key differences with Actions v1.

* Workflows were written in HCL; now they're written in YAML. [Syntax documentation](https://help.github.com/en/articles/workflow-syntax-for-github-actions) is available!
* Instead of multiple actions in a workflow, we now have a more granular breakdown of `workflow > jobs > steps`.
* Jobs are run in VMs instead of containers - including MacOS, Windows and Linux 😍🥰

## Feature focus

In the rest of this post I'm going to focus on a few features that I think are an amazing addition to the Actions platform. Some are pure additions (didn't exist in v1), others are adaptations/improvements on features that did exist.

### Multi-line scripts

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

### Passing data to future steps

While writing a workflow, it's common to want to say "this Action does this, and this next Action does this, using the result of the previous Action". Unfortunately, that was challenging to accomplish in Actions v1 because while actions in a workflow shared a file-system, that was the only form of persistence. With v2, there are two options:

* `core.setOutput()`, which sets `steps.<step_id>.outputs.<key>`
* `core.exportVariable()`, which sets a variable `$KEY`

Here's how you would use each one:

```yaml
steps:
  - name: An action that runs `core.setOutput('foo', 'bar')`
    # Set an ID for this step to reference it later
    id: my_step
  - name: Let's use it
    run: echo "Foo? ${{ steps.my_step.outputs.foo }}!"

  - name: An action that runs `core.exportVariable('FOO', 'baz')`
  - name: Let's use it
    run: echo "Foo? $FOO!"
```

I built a proof-of-concept for this functionality in [JasonEtco/actions-toolkit](https://github.com/jasonetco/actions-toolkit#toolsstore), but it relied on too many factors (both the output and recipient actions needed to use the same code).

Now, if you're like me, you're thinking "Can this be done without the toolkit or JavaScript?" Turns out, yes!

> **Heads up**! This feature is not documented and is subject to change! For a more reliable method, use the toolkit methods if you can.

`core.exportVariable` actually prints a special string to `stdout`, and we can do it too!

```yaml
- name: Let's set an output!
  run: |
    FOO=bar
    echo '##[set-env name=FOO;]$FOO'
- run: echo $FOO
```

Similarly, `core.setOutput` prints `##[set-output name=key]value`. And to reiterate: this isn't documented yet, and the syntax will likely change, so beware! BUT IT'S SO COOL I HAD TO SHARE IT.

### Streaming logs

This was high on my list of missing features in [**Use GitHub Actions for CI**](/posts/use-github-actions-for-ci); now, when an Actions workflow is running, you can see the output without having to wait until its done. This isn't just a quality of life improvement - now, when building a workflow or action, the development experience is significantly faster.

### Declarative requirements for Actions

This is one of my favorite additions, not because of what it does today, but because of its potential. Actions can now define a map of `inputs` - configuration for the action itself. Previously, you'd have to set environment variables or use `args`, and that totally worked, but there was no way for an Action to say "hey I need this setting".

```yaml
# action.yml
name: My Action
inputs: 
  name:
    description: The name of the person to say hello to
    default: world
```

You can read more about [the metadata syntax for `action.yml`](https://help.github.com/en/articles/metadata-syntax-for-github-actions). `inputs` is a particularly interesting addition to me, because it adds a way to signal requirements for an Action. This can be expanded to a rich UI for implementing Actions, and a ton of context/information when using them! I'm excited for the future here.

> A note on the `using` property and JavaScript actions: y'all _know_ I'm excited about the potential there, but I think it's too early to write about it. The development and publishing experience has a lot of pain points, so I don't want to delve in until it's a little more resolved (which it will be)! That shouldn't prevent you from trying it out anyway.

### Notable mention lightning round ⚡️

* [The `if` property](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idstepsif), conditionally running a job. It's not super powerful, and many workflows will still need some kind of filter script, but for simple checks it's a really great addition.
* [`branch` filters](https://help.github.com/en/articles/configuring-a-workflow#filtering-for-specific-branches), similar to the previous point but at the workflow level!
* * [Matrix builds](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix) - this is _immensely_ powerful. I didn't include it above because its more of a CI thing, but it is awesome.
