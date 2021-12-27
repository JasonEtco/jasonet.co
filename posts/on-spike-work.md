---
title: On "Spike work"
spoiler: >-
  Quickly getting to something that works, then chunk it into reviewable/shippable pieces. The why and the how of it!
date: '2021-12-27'
---

Spike work is a tool I use to make meaningful progress on medium-sized projects, to be efficient with my time and get to the hard parts as quickly as possible. In practice, it looks like this:

1. Understand the feature proposal - this can mean reading the issue, talking to people, reading code to list out the integration points, or just getting a handle on what will need to change. We're not looking to enumerate the actual steps, just get a vague idea of what areas of the codebase you'll need to touch.
1. Get it working - this is, of course, the meat of it. Start a new feature branch and _just go for it_. Doesn't matter if you create bugs. Don't bother writing tests. Don't worry about the code quality. The goal now is to just get it working.
1. From there, you should have an idea of "the hard parts." Do you need to talk to other teams/people? Are there obvious performance concerns? Should you be looping in Security early on? Those are quesitons that you can better answer after you've done that initial sweep of work.
1. Once you've got that, you can start to chunk out the work into smaller pieces. More on that later.

## Why you'd do it

What's the point of spike work if you don't have a clear plan? The whole point is to create a plan.

I firmly believe that too much process before engineers can hit the ground running is a bad thing. It hinders exploration and slows understanding. There's a balance for sure, but when you have the opportunity to jump into a problem and _just figure it out_, that's way more fun _and_ often more productive.

How does spike work make your whole team better?

**More, smaller PRs are easier to ship**

Have you ever reviewed your teammates pull request, with 92 changed files and a diff looking like <code><span class="text-green-500">+7,830</span>, <span class="text-red-500">−24,766</span></code>? How is anyone supposed to give a meaninful review of a PR that large?

If you can be the person that fully understands how to build a feature, the best way you can communicate that to your team is by showing them the pieces one-by-one. Show them the spike work, but ask them to review individual parts.

For example, lets take GitHub's new [Star Lists feature](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars#organizing-starred-repositories-with-lists). There are three distinct parts to shipping a feature like that:

* Database changes - adding a new table to store lists
* Backend changes - API endpoints, model changes, tests, etc.
* Frontend changes - views for lists, UI changes to enable adding repos to lists

The real-world breakdown is usually even smaller, with each step being further broken down into scoped pull requests. The idea is to have a single spike PR that covers all of the work, and then have the team review the individual parts.

**Feature flags enable iterative development**

All of this assumes that your project has some way of shipping changes without users hitting them yet. [At GitHub, we use feature flags heavily](https://github.blog/2021-04-27-ship-code-faster-safer-feature-flags/) - it lets us ship small parts of a larger feature, review them safely and easily, then enable the feature when we're ready. 

> Feature flags are the cure to giant PRs.

<caption>

[- Mike Coutermarsh, 2021](https://twitter.com/mscccc/status/1474500548615450634)
</caption>

## How to do it

When it comes time to actually chunk out your PRs, here are some tips that may help.

### Atomic(ish) commits

It starts with making many, small commits. There's a concept of **Atomic commits**:

> the commit should only have changes pertaining to one fix or feature (or whatever you were working on). Don’t have commits where you “fixed that bug and also implemented the feature and then also refactored some class”.

<caption>

[- Pauline Vos](https://dev.to/paulinevos/atomic-commits-will-help-you-git-legit-35i7)
</caption>

Truely atomic commits are always passing, and one feature at a time. For spike work, this is a really useful concept - you want to commit bits at a time that are easily cherry-pick-able.

The only difference is that with spike work it really doesn't matter if you're breaking the build. In fact, it can be useful to **send your changes to CI and see what breaks**, especially on large projects where running the entire CI suite locally is prohibitively slow (or just impossible).

### `git cherry-pick`

If you've organized your spike PR well, you'll have a list of commits that you want to cherry-pick. These are some example commits of a spike PR I've worked on: 

* `0c2a240`: Create database migration
* `360591a`: Run migration to generate schema file
* `17be1bb`: Model changes
* `e1ffdee`: Add controller/action and route
* `9a71a8f`: Add view
* `624747a`: Make it not horrible

