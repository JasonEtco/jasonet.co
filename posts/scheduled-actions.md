---
title: Run your GitHub Actions workflow on a schedule
date: '2019-04-15'
spoiler: With a recent addition to the Actions trigger lineup, we can now tell GitHub to run our workflow on a schedule. Let's see how!
---

When I first heard about Actions in its current form, I was excited about the possibilities - well, [now there's a whole new feature of Actions](https://developer.github.com/actions/changes/2019-04-05-scheduling-workflows/) and I am _pumped_.

The `schedule` event lets you **define a schedule for your workflow to run on**. Using the [cron syntax](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07), you basically tell GitHub "run this workflow, independent of any activity on the repo - just run it on my schedule."

<img alt="Screenshot of the GitHub Actions UI while adding a scheduled workflow" src="https://user-images.githubusercontent.com/9831992/55425271-ade4c200-5547-11e9-8245-d37e3305e6ec.png" />
<small>From <a href="https://developer.github.com/actions/changes/2019-04-05-scheduling-workflows/">the GitHub Actions changelog</a>. This UI no longer exists, but it's still a cool image!</small>

## The cron syntax

It's spooky. If you've never used it before (I haven't) it looks different from other things. Let's dive in!

```yaml/3
name: Do things every 5 minutes
on:
  schedule:
    - cron: "*/5 * * * *"
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

An asterisk (`*`) means that the field is considered "any time" - so `* * * * *` means every minute of every day. Note that, at least on GitHub, times are based in UTC so **you may have to do some timezone conversion**!

### Some helpful patterns

```js
// Every Monday at 1PM UTC (9AM EST)
0 13 * * 1

// At the end of every day
0 0 * * *

// Every 10 minutes
*/10 * * * *
```

You can [read up on the cron syntax](https://www.netiq.com/documentation/cloud-manager-2-5/ncm-reference/data/bexyssf.html) for all the ins-and-outs (goodness knows I'm no expert). I've found [crontab.guru](https://crontab.guru) to be a really helpful resource for visualizing an expression as I write it! ⏰

## What you can use it for

Who cares about how it works, **what can we do with it**? It's still brand new, but there are already a few really cool Actions designed to work on a schedule:

### probot/stale-action

You may already know about [probot/stale](https://github.com/probot/stale), a popular Probot App that comments on and closes issues that have become inactive. Well, we designed [a hack](https://github.com/probot/scheduler) for it to run on a timer, because we didn't have anything better. There's now an Actions equivalent, [actions/stale-action](https://github.com/actions/stale).

We can leverage the `schedule` event to properly run it whenever we want:

```yaml
name: "Close stale issues"
on:
  schedule:
  - cron: "0 0 * * *"

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/stale@v1.1.0
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        stale-issue-message: 'Message to comment on stale issues. If none provided, will not mark issues stale'
        stale-pr-message: 'Message to comment on stale PRs. If none provided, will not mark PRs stale'
```

### electron/unreleased

Every Monday, [this brand new Action](https://github.com/electron/unreleased) pings a team in the Electron Slack workspace with information about the commits that have been merged to a release branch but are not in a published release yet.

This will help them keep track of new features & bug fixes that folks are waiting for, but have yet to be released in a new version of Electron. I forget about merged work all the time with projects way, way smaller - this kind of automation is super exciting :sparkles:

### JasonEtco/create-an-issue

An Action made by one brilliant blog author, [`create-an-issue`](https://github.com/JasonEtco/create-an-issue), does what it says on the box. When I first made it many moons ago, I had a feeling that scheduled Actions would be a thing one day, so I built in support for dates. This lets us create an issue on a schedule, with helpful date stamps. Here's a workflow that I made for my team's weekly meeting notes:

```yaml
name: Create our Weekly Meeting notes issue
on:
  schedule:
    - cron: '0 14 * * 1'
jobs:
  issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: JasonEtco/create-an-issue@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          filename: .github/ISSUE_TEMPLATE/meeting-notes.md
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

So the `schedule` trigger is awesome, but **it doesn't need to stop here**. Actions already works with [a list of webhook event types](https://developer.github.com/v3/activity/events/types/), and `schedule` isn't on that list - that means that GitHub Actions has the ability to register and act upon **custom events**. Going even further, the event isn't static - it's parsed with granular information about the event:

```yaml
schedule:
  - cron: "* * * * *"
```

This opens up a whole new world of possibilities for more granular events (these are imaginary):

```yaml
# Matches @-mentions in an issue comment
mention:
  - user: JasonEtco
  - team: github/cool-people

# Matches slash commands, like `/deploy` in an issue comment
command: deploy
```

Who knows if any of those will be implemented, or if they're even a good idea! The point here is that `schedule` proves that Actions has an opportunity to do even more than the already huge list of webhook events allows for!

---

So go forth and make `schedule`d workflows :v: Let me know how it goes!
