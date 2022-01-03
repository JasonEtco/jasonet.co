---
title: On "Spike work"
spoiler: >-
  Quickly getting to something that works, then chunk it into reviewable/shippable pieces. The why and the how of it!
date: '2022-01-02'
reviewers:
  - name: "@matchai"
    link: https://twitter.com/matchai
    avatarUrl: https://github.com/matchai.png
  - name: "@jasonlaster11"
    link: https://twitter.com/jasonlaster11
    avatarUrl: https://github.com/jasonlaster.png
---

Spike work is a tool I use to make meaningful progress on medium-sized projects to be efficient with my time and to get to the hard parts as quickly as possible.

**Get a feature working with as little work as possible (but still correctly) in one branch. Then, move those changes into small, scoped pull requests to ship them iteratively.**

In practice, it looks like this:

1. Understand the feature proposal - this can mean reading the issue, talking to people, reading code to list out the integration points, or just getting a handle on what will need to change. We're not looking to enumerate the actual steps, just to get a vague idea of what areas of the codebase you'll need to touch.
1. Get it working - this is, of course, the meat of it. Start a new feature branch and _just go for it_. Doesn't matter if you create bugs. Don't bother writing tests. Don't worry about the code quality. The goal now is to just get it working.
1. From there, you should have an idea of "the hard parts." Do you need to talk to other teams/people? Are there obvious performance concerns? Should you be looping in Security early on? Those are questions that you can better answer after you've done that initial sweep of work.
1. Once you've got that, you can start to chunk out the work into smaller pieces. More on that later.

## Why you'd do it

What's the point of spike work if you don't have a clear plan? Well, the whole point is to _create_ a plan. It's a method for figuring out what you don't know.

Too much process and planning before engineers hit the ground running can be a bad thing. It hinders exploration and slows understanding. There's a balance for sure, but when you have the opportunity to jump into a problem and _just figure it out_, that's way more fun _and_ often more productive.

How does spike work make your whole team better?

### Build consensus, early

Show, don't tell. It's easier to communicate your plan by showing the actual changes, even if they're imperfect. Share that with your team to build consensus and understanding early in the process, to avoid hours-long Zoom calls postulating about the implementation before even writing any code. I guarantee you that having something tangible to talk about will be more productive than aetherial, vague hypotheses. 

<small>Inspired by <a href="https://twitter.com/jasonlaster11/status/1477736511617613824?s=20">this Tweet</a> from <a href="https://twitter.com/jasonlaster11">@jasonlaster11</a></small>

### More, smaller PRs are easier to ship

Have you ever reviewed your teammate's pull request, with 92 changed files and a diff looking like <code><span class="text-green-500">+24,766</span>, <span class="text-red-500">−7,830</span></code>? How is anyone supposed to give a meaningful review of a PR that large?

If you're the person that fully understands how to build a feature, the best way you can communicate that to your team is by showing them the pieces one-by-one. Ask them to review individual parts, and have the "look it works" spike work available for even more context.

For example, let's take GitHub's new [Starred Repository Lists feature](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars#organizing-starred-repositories-with-lists). There are three distinct parts to shipping a feature like that:

* Database changes - adding a new table to store lists
* Backend changes - API endpoints, model changes, tests, etc.
* Frontend changes - views for lists, UI changes to enable adding repos to lists

The real-world breakdown is usually even smaller, with each step being further broken down into tightly scoped pull requests. The idea is to have a single spike PR that covers all of the foundational work, and then have the team review the individual parts.

### Feature flags enable iterative development

> Feature flags are the cure to giant PRs.

<caption>

[- Mike Coutermarsh, 2021](https://twitter.com/mscccc/status/1474500548615450634)
</caption>

All of this assumes that your project has some way of shipping changes without users hitting them yet. [At GitHub, we use feature flags heavily](https://github.blog/2021-04-27-ship-code-faster-safer-feature-flags/) - it lets us ship small parts of a larger feature, review them safely and easily, then enable the feature when we're ready. It's a larger topic, but in essence, you'd have a simple `if` statement in your app like this:

```js
if (await user.featureEnabled("star-lists")) {
  // do stuff
}
```

`featureEnabled` would check a database record of some kind, created either automatically or through some admin panel, or staff-only API. [LaunchDarkly](https://launchdarkly.com/) is a feature-flags-as-a-service tool if you'd rather just pay for the service.

## How to do it

When it comes time to actually chunk out your pull requests, here are some tips that may help. Remember that once you've figured out how to get the thing working, your goal is to best communicate those changes to your team and to the people that are going to review the PR.

### Atomic(ish) commits

It starts with making many, small commits into a spike branch. There's a concept of **Atomic commits**:

> the commit should only have changes pertaining to one fix or feature (or whatever you were working on). Don’t have commits where you “fixed that bug and also implemented the feature and then also refactored some class”.

<caption>

[- Pauline Vos](https://dev.to/paulinevos/atomic-commits-will-help-you-git-legit-35i7)
</caption>

Truly atomic commits always pass CI, and change one feature at a time. For spike work, this is a really useful concept - you want to commit bits at a time that are easily cherry-pick-able. This comes in handy later when deciding which changes belong in which PR.

The only difference is that with spike work, it really doesn't matter if you're breaking the build. In fact, it can be useful to **send your changes to CI and see what breaks**, especially on large projects where running the entire CI suite locally is prohibitively slow (or just impossible).

### `git cherry-pick`

Git's [`cherry-pick` command](https://git-scm.com/docs/git-cherry-pick) allows you to effectively[^1] copy commits from one branch to another, using their SHA (unique identifier for each commit).

If you've organized your spike PR well, you'll have a list of commits that you want to cherry-pick. These are some example commits of a spike PR I've worked on: 

* `0c2a240`: Create database migration
* `360591a`: Run migration to generate schema file
* `17be1bb`: Model changes
* `e1ffdee`: Add controller/action and route
* `9a71a8f`: Add view
* `624747a`: Make it not horrible

In those 6 commits, there's probably about 20-30 files changed between migration files, controllers, configs, UI stuff, partials/components, etc. It sounds like a lot, because it is - but let's see what it looks like to separate them out:

{% capture openPR %}<span class="text-green-500">{% octicon "git-pull-request" %}</span>{% endcapture %}

* {{ openPR }} **[1/3] Create `repository_lists` table**
* {{ openPR }} **[2/3] Create `RepositoryList` model**
* {{ openPR }} **[3/3] Create `RepositoryListController` and view**

Those don't sound quite as scary as a single PR called **Do everything, all at once**. Now to actually create those PRs, here's how we would use `cherry-pick`:

```bash
# Checkout to a new feature branch from `main`:
git checkout main && git checkout -b lists/create-table
# cherry-pick the relevant commits:
git cherry-pick 0c2a240 360591a
# Open the PR (ex: with the gh cli):
gh pr create -b lists/create-table -t "Create `repository_lists` table"
```

Do that for each of the chunks, switching out the commits you're cherry-picking, and 💥 you have a bunch of reviewable PRs instead of one giant one.

### PRs that change base

When you open a pull request (or after you've opened it), you can choose a _base branch_. This is the branch your PR is going to change when merged - if you're working on a feature branch, that's usually going to be `main`. When doing spike work, it can be really helpful to organize your smaller PRs by setting the base branch to the preceding "step":

![Screenshot of GitHub UI showing pull request base branch option](https://user-images.githubusercontent.com/10660468/147856698-9726a7fe-00fa-44ab-989e-bb8287fd5a60.png)

In this example, when `feature/step-one` is merged and the branch is deleted, any PR that has it set as the base branch will automatically be retargeted to `main`:

![Screenshot of GitHub UI showing pull request timeline event that base branch was automatically retargeted from feature/step-one to main](https://user-images.githubusercontent.com/10660468/147856756-9f94213f-ff9a-45ff-8b80-fd7175486fdd.png)

This enables you to open all the PRs together without waiting for each one to be merged.

### Polish

If you did it right, each of those spike PRs will be missing some things. Tests, known bugs, performance questions - but now, you can focus on the right areas in each of the PRs, instead of doing all the _hard_ stuff at once. Now is the time to get the PRs into a reviewable state, which means getting ahead of comments like "what about a test here?" or "could this be slow in production?".

That's it - spike work isn't some magical tool. It's just a way of approaching feature development in a way that's fun for you, efficient, and can be a real help to the team's understanding of the change.

---

[^1]: It's not an _actual_ copy - the changes are copied over, but a new commit is created with a new SHA.