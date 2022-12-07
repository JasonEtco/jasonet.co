---
title: On working with PMs
spoiler: >-
  I'm told that PMs like working with me, so I wanted to chronicle why I think
  that is, to share with folks.
date: 2022-12-7
---

From a wonderful co-worker:

> You got a shoutout [in a] meeting, which I heartily +1 :hugging_face:
> you work well with PMs, giving them options, and DEMOS and spikes

They asked me if I'd written or giving a talk about this topic, and how I work with PMs, and I hadn't - so here that is.

First things first though: Product managers (PMs) are not some magical thing. They're people who have a set of skills, priorities, focuses and perspectives. That's true for everyone that you work with - different roles aren't better or worse, more powerful or less powerful, they're just different. People are people, and the best way to work with people is to communicate.

That's really the core theme here: knowing that your teammates (be they engineers, PMs, a manager, a designer, whoever else) are people that simply have different focuses. Once you realize that, it's less about working with a particular role and more about helping them to be successful, which in turn helps you be successful. I shall elaborate.

## Why do PMs exist?

This part is actually very simple: I see product managers as the backbone of a team. They're not the ones implementing the ideas, but often they're the ones collecting, detailing and researching ideas. They help to prioritize work by seeing a larger picture than whats in the code. They're responsible for communicating user-facing product changes, and as a result are often the most visible part of a feature. There's even more to it, but that's enough for now.

So how can we as <abbr title="Individual Contributors">ICs</abbr>/engineers set them up for success, and vice-versa?

## How to work with PMs

There are a couple of core tenets that I think about:

- [Sharing technical details](#sharing-technical-details)
- [Guessing, making an educated guess, and then knowing for sure](#guessing-making-an-educated-guess-and-then-knowing-for-sure)
- [Giving options, detailing tradeoffs and explaining why](#giving-options-detailing-tradeoffs-and-explaining-why)
- [Being helpful](#being-helpful)

### Sharing technical details

It's out job as engineers to manage the technical details - to write the code, build the solutions, make the technical tradeoffs that it takes to get to a working product. That's squarely on us, and is not someone else's job. _However_, when we share the technical details with PMs (and designers, and anyone else) we're arming them with information they need to understand how things work. Remember that PMs just have different focuses and skills - they will build up more and more technical knowledge of the product over time, and even if they're not ready to suddenly be a working engineer, it's amazing what a little bit of context can do.

A common example is describing the tradeoffs between performance and features. It's easy to just keep adding stuff, but every new query or every bit of rendering takes a tiny bit more work that impacts the overall performance of your application. Sharing those details, the nitty gritty, with PMs can help them understand the tradeoffs and make better decisions.

### Guessing, making an educated guess, and then knowing for sure

I've written about this before in [On Spike Work](/posts/on-spike-work), and it's an especially useful tool for sharing progress on a feature with your team. It can be broken down into a 3 step process:

1. Make a gut-level guess about how hard something is, how long it will take, and how you might approach it
2. Try that by spiking out an approach, and tweak your initial guess using what you learned
3. Actually go do the thing for realsies

Between steps 1 and 2, yours and your PM's understanding of the issue will can change drastically. Something hard can turn out to be really easy, and vice-versa. The earlier you can share those learnings with your PM, the sooner they can make a decision about how to proceed.

When it comes time for step 3, everyone has a better understanding of the difficulty and the expected duration.

On GitHub's Special Projects team (in which we worked on small-to-medium sized features & improvements, in a short time frame), I had a practice of spending ~30 minutes poking around the code to share enough details for step 1. I'd leave a message in the issue like this:

<img width="939" alt="image" src="https://user-images.githubusercontent.com/10660468/206308183-f136784a-8877-48ce-8af2-5acb46d282c8.png">

```
I gave this the **effort low** label - the actual engineering work feels very straightforward and "not hard ™️". The potential slow down in shipping is any Security concerns with ingesting the RSS feed, so we should just be sure to engage AppSec early when starting this work.
```

That issue turned out to be [a quick ship](https://github.blog/changelog/2022-05-11-changelog-summarized-on-user-dashboards/). My gut-feeling was that it wouldn't be tough to just render some content, so I poked around to understand our options. I shared that message, and our PMs agreed that it was a quick win, so we should stop talkin' about it and just do it.

We ended up going back and forth on some design tweaks, but it wasn't a difficult one - so the intial gut-check was accurate. That's the case more often than not - sure we get it wrong sometimes, but thats what step 2 is for. Validating your gut check, and explaining why to your team.

### Giving options, detailing tradeoffs and explaining why

This is sort of a combination of the previous two points: when you come up against a challenging bit, you have a decision to make: do you do something the easy, fast way? Or do you take the extra `N` weeks to do it the "right" way? That's not a decision you should make alone. Your PMs are the best people to talk to, to weigh the pros and cons. I love pinging someone in Slack and saying "Hey I'm waffling between these two directions, and I need a second opinion". The best PMs I've worked with will happily talk through it, and I always walk away with a clearer direction.

### Being helpful

Yes, duh, we should all be helpful. But there's a long-tail after a feature ships where you as an engineer will have rotated onto something else, but your PMs are still thinking about that feature. Maybe they're writing the docs, or preparing a changelog post, or talking to Sales people about it. Maybe its already shipped and they want to pull some data a month later to understand real-world usage.

It's their job to be responsible for those things, but that doesn't mean you can't help. ICs will often understand the feature more than anyone, so giving a <abbr title="Too long, didn't read">TL;DR</abbr> of the feature, or a quick overview of how it works can be immensely helpful. It's also a great way to validate that you and your PM agree with how it _should_ work.

With fetching usage data, sometimes that can mean writing literal SQL queries to pull the data out of the database. I've done that before, and it's a great way to help out your PMs. It can arm them with the data that they'd otherwise have to wait a long time to get, or struggle through it (because a smart PM will probably figure out a way to get to it, but it's not always easy).

## Why this matters

I've worked with some of the best PMs in the game (I'd bet). When we're on the same page, and when we can trust each other to do the things we're focused on, it feels like our velocity just quadruples. We're all working towards the same goal, and relying on one another means we can do the things we're best at.

There's also a level of respect that you need to have when you're working with other humans. That's a lot of the communication aspect to me. Sure, some of your teammates may not have the same level of technical knowledge as you, but that doesn't mean you need to shield them from the details. The details are what helps people grow and become even better.

---

That's it really. To summarize: **different roles just have different focuses**, and its everyones job to make each other more successful, however that may be. Your teammates in different roles are people, and they can't learn if you don't share the details. Spike work helps everyone understand the difficulty of a work item.

Shoutout to Cynthia, Emma, Daniel, and the rest of the PMs I've worked with over the years. You're all amazing, and I'm so grateful to have worked with you.
