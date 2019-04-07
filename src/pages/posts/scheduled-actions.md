---
title: Run your GitHub Actions workflow on a schedule
date: '2019-04-07'
spoiler: With a recent addition to the Actions trigger lineup, we can now tell GitHub to run our workflow on a schedule. Let's see how!
---

When I first heard about Actions in its current form, I was excited about the possibilities. Coming the world of Probot and integrations, I knew that so many problems would be solved. Well, [now there's a whole new feature of Actions](https://developer.github.com/actions/changes/2019-04-05-scheduling-workflows/) and I am _pumped_.

The `schedule` event lets you define a schedule for your workflow to run on. Using the [cron](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07) syntax, you basically tell GitHub "run this workflow, independant of any activity on the repo - just run it on my schedule."

## The cron syntax

It's spooky, if you've never used it before (I haven't) it looks different from other things. Let's dive in!

```hcl{2}
workflow "Do things every 5 minutes" {
  on = "schedule(*/5 * * * *)
}
```

This says to run the workflow every five minutes. Cron syntax is separated into five pieces; from [the GitHub Docs](https://developer.github.com/actions/managing-workflows/creating-and-cancelling-a-workflow/#scheduling-a-workflow):

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6)
│ │ │ │ │                                   
│ │ │ │ │
│ │ │ │ │
* * * * *
```

An asterisk (`*`) means that the field is considered "any time" - so `* * * * *` means every minute of every day. Note that, at least on GitHub, times are based in UTC so you may have to do some timezone conversion!

### Some helpful patterns

```shell
# Every Monday at 9AM EST
* 13 * * 1

# At the end of every day
* 23 * * *

# Every 10 minutes
*/10 * * * *
```

You can [read up on the cron syntax](https://www.netiq.com/documentation/cloud-manager-2-5/ncm-reference/data/bexyssf.html) for all the ins-and-outs (goodness knows I'm no expert). I've found [crontab.guru](https://crontab.guru) to be a really helpful resource for visualizing an expression as I write it!

## What you can use it for

Who cares about how it works, what can we do with it? It's still brand new, but there are already a few really cool Actions designed to work on a schedule.

### probot/stale-action

You may already know about [probot/stale](https://github.com/probot/stale), a popular Probot App that comments on and closes issues that have become inactive. Well, we designed [a hack](https://github.com/probot/scheduler) for it to run on some sort of schedule. [@tcbyrd](https://github.com/tcbyrd) has been working on [rewriting Stale as a GitHub Action](https://github.com/probot/stale-action). Now, we can leverage the `schedule` event to properly run it every so often:

```hcl
workflow "Mark issues/PRs as stale" {
  on = "schedule(0 * * * *)" # Every hour
  resolves = ["Stale"]
}

action "Stale" {
  uses = "probot/stale-action@master"
  secrets = ["GITHUB_TOKEN"]
}
```

### electron/unreleased

Every Monday, [this brand new Action](https://github.com/electron/unreleased) pings a team in the Electron Slack workspace with information about the commits that have been merged to master but are not in a release yet.

This will help them keep track of new features & bug fixes that folks are waiting for, but have yet to be released in a new version of Electron. I do this all the time with projects way, way smaller - this kind of automation is super exciting :sparkles:

### JasonEtco/create-an-issue

An Action made by one brilliant blog author, [`create-an-issue`](https://github.com/JasonEtco/create-an-issue) does what it says on the box. When I first made it many moons ago, I had a feeling that scheduled Actions would be a thing one day, so I built in support for dates. This lets us create an issue on a schedule, with helpful date stamps. Here's a workflow that I made for my team's weekly meeting notes:

```workflow
workflow "Weekly Meeting notes" {
  on = "schedule(* 13 * * 1)"
  resolves = ["Create an issue"]
}

action "Create an issue" {
  uses = "JasonEtco/create-an-issue@v1.1.4"
  args = ".github/ISSUE_TEMPLATE/meeting-notes.md"
  secrets = ["GITHUB_TOKEN"]
}
```

And the `meeting-notes.md` issue template:

```markdown
---
name: Weekly Meeting Notes
about: Used for taking notes in our daily standups, with a new issue every week.
title: "Weekly Meeting Notes: {{ date | date('MMMM Do') }} - {{ date | date('add', 5, 'days') | date('Do') }}"
labels:
  - "Meeting 💬"
---
### Monday, {{ date | date('MMM Do') }}
```

I've done some real fanciness with the title by having the dates at the start and end of the week - here's what the generated issue looks like:

<img width="1011" alt="image" src="https://user-images.githubusercontent.com/10660468/55686035-9aac6a80-592a-11e9-9657-f0c44c8b1957.png">

This is a small but helpful piece of automation that takes one task off of my todo list :tada:

## Thinking ahead

So the `schedule` trigger is awesome, but it doesn't need to stop here. GitHub has [a list of webhook event types](), and `schedule` isn't on that list - that means that GitHub Actions has the ability to register and act upon **custom events**. Going even further, the event isn't static - it's parsed:

```shell
schedule(* * * * *)
function(arguments)
```

This opens up a whole new world of possibilities for more granular events:

```shell
# Matches @-mentions in an issue comment
mention('JasonEtco')

# Matches slash commands, like `/deploy` in an issue comment
command('deploy')
```

Who knows if any of those will be implemented, or if they're even a good idea! The point here is that `schedule` proves that Actions has an opportunity to do even more than the already huge list of webhook events allows for!
