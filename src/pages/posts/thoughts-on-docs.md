---
title: Assorted thoughts on documentation
date: '2020-07-26'
spoiler: Been thinking about documentation a lot recently and wanted to write down what I've seen and learned.
---

Documentation is a fundamental part of software, both open source and proprietary. There are lots of methods for building great docs, and lots of examples of fantastic software with docs that just don't help their users. There have been studies that show that documentation is ["is highly valued, but often overlooked"](https://opensourcesurvey.org/2017/#insights) and my own experience lines up with those findings. So I wanted to share what I know and how I think about documentation, and some recommendations for you (and me).

One note before we get into it: documentation for software is by and large very different from documentation for a product. With the latter, there is a fixed number of actions they can take. Even something as complex and dynamic as [Figma](https://www.figma.com/) has a limit to what a user can do (more on plugin systems and SDKs later on). But when writing docs for software, like a reusable open source library, you need to expect the unexpected - how will consumers of that library use the code? It's not about having that answer, but about giving them the tools to use the code however they want.

## What makes good documentation

This is the big question, and I'm going to separate it into three parts: content, tooling and discoverability. I'll also include some examples, but I'm not an authority on what makes docs good - so I'd love to [hear from you](https://twitter.com/JasonEtco).

### Content

I want to start here, because you can have the most features, the best tooling, all the bells and whistles - but if your content isn't helpful, your docs just aren't going to be good. So what makes content "good"? I think it comes down to focusing on what users **want to accomplish**. Most people don't want to see the entire API surface - they have a goal in mind with your library and want to get there with as little friction and ambiguity as possible.

#### Prioritize use-case-driven examples

This is tricky in practice, because it extends into API design - documenting something complex in nature is going to make for complex documentation. So when you're writing down documentation, try to take the perspective of someone who doesn't know anything about your library, why it exists or how it works - only what it _does_.

For example, let's say we have a library called `math`. It exposes four methods: `add`, `subtract`, `divide`, and `validate`. That last one, `validate`, is used in the first three to validate the arguments passed to each method. We can assume that _most_ users don't need to see that method right away when looking at the docs. They have a problem, like "math is hard" and want to solve that problem, not absorb the complexity of your library.

That's not to say that `validate` shouldn't be documented, far from it. But prioritize use-case-driven examples, _then_ expose reference content.

### Tooling

### Discoverability

#### Bonus: contribution workflow

## Docs for a product's SDK or API

This is a bit of a gray area - earlier I noted that documenting a product is different from software, but there are platforms that have to do a bit of both. Take GitHub for example - it has a robust API that intersects with many of the same product areas as the UI on GitHub.com.