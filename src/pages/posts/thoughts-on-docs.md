---
title: Assorted thoughts on documentation
date: '2020-08-24'
spoiler: I've been thinking a lot about documentation recently, and wanted to share some thoughts and hot takes.
---

Documentation is a fundamental part of software, both open source and proprietary. There are lots of methods for building great docs, and lots of examples of fantastic software with docs that just don't help their users. Still, we know that documentation is ["is highly valued, but often overlooked"](https://opensourcesurvey.org/2017/#insights). So I wanted to share what I know and how I think about documentation, and some recommendations for you (and me).

One note before we get into it: documentation for software is very different from documentation for a product. 

When writing docs for software, like a reusable open source library, we need to think about how consumers of that library will use the code. It's not about having that answer, but about giving them the tools to use the code however they want.

## What makes good documentation

This is the big question, and I'm going to separate it into three parts: content, tooling and discoverability.

Ultimately, we write documentation to remove the barrier of entry for people who may want to use our code. Ignoring the benefits of marketing or branding, the goal for docs is to help people use the thing.

I'm not an authority on what makes docs good, but I'll be sharing some pretty clear opinions. Feel free to disagree 😗

## Content

I want to start here, because you can have the most features, the best tooling, all the bells and whistles - but if your content isn't helpful, your docs just aren't going to be good. So what makes content "good"? I think it comes down to focusing on what users **want to accomplish**. Most people don't need to see the entire API surface - they have a goal in mind with your library and want to get there with as little friction and ambiguity as possible.

### Prioritize use-case-driven examples

Users approach your library with a problem they're looking to solve. Put the clear "here's how to do the thing" information first.

This is tricky in practice, because it extends into API design - documenting something complex in nature is going to make for complex documentation. So when you're writing docs, try to take the perspective of someone who doesn't know anything about your library, why it exists or how it works - only what it _does_.

For example, let's say we have a library called `math`. It exposes four methods: `add`, `subtract`, `divide`, and `validate`. That last one, `validate`, is used in the first three to validate the arguments passed to each method. We can assume that _most_ users don't need to see that method right away when looking at the docs. They have a problem, like "math is hard" and want to solve that problem, not absorb the complexity of your library.

### Include reference information

That's not to say that `validate` shouldn't be documented, but it should be less of a priority than use-case-driven examples. You'll see READMEs with a structure like this:

```markdown
# Name of library

Short description

## Installation

## Usage

**Basic example**

**More complex example**

## API reference
```

Start simple, lean on default values of your library, then go more and more complex. Ending with the API details can be really helpful, because you don't know _exactly_ what users want from your library. It _is_ important to share examples of each of those methods though.

I think about [Sequelize's documentation](https://sequelize.org) a lot, specifically their [API reference](https://sequelize.org/v5/identifiers.html). Sequelize is an <abbr title="Object-relational mapping">ORM</abbr>, so it's fairly complex and will have a lot to document. Their docs suffer from a common problem: auto-generated content simply isn't helpful enough. They document _everything_, focusing on very little. Here's an example of what I mean ([source](https://sequelize.org/v5/class/lib/query-interface.js~QueryInterface.html#instance-method-dropAllTables)):

<img width="1153" alt="image" src="https://user-images.githubusercontent.com/10660468/88492040-bdc2b980-cf75-11ea-85f1-05e5313e04b5.png">

Because there's no example code here, I have to follow the table of options while making guesses about where and how this method should be used.

There are lots of cases where Sequelize does this really well, outside of the API reference - but when I'm looking at a method's documentation trying to understand what an option does, I need to know what it's for and why I would use it.

But my _favorite_ docs site to dunk on is [Discord.js](https://discord.js.org/). It's a really well designed library, but is unnecessarily difficult to learn.

It relies too heavily on auto-generated docs, to the point where the docs are written for robots, not humans. There is very little example code and each method has a bajillion options without clear descriptions or use-cases. They've documented everything the library can do, but each method/option needs way more detail and context.

In contrast, `lodash` [does this really well](https://lodash.com/docs/4.17.15) - each method has what I assume is autogenerated content, paired with real code examples.

I won't pretend that documenting an ORM is as easy as something like `lodash`, but the principles are the same. This gets more and more challenging the larger the API surface, I'll get into that later on.

### foo/bar/nope

This is a quick win - wherever possible, use real words and real scenarios when showing example code. This comes back to use-case driven content; the typical `foo/bar/baz` wording is ambiguous.

```js
❌ const foo = math.add(1, 2)
   const bar = math.subtract(2, 1)
```

```js
✅ const sum = math.add(1, 2)
   const difference = math.subtract(1, 2)
```

Treat your examples like real code and they'll end up more clear and more helpful.

### Technical writing is a skill

This should go without saying but I'll say it anyway. We're not all experts at building useful content, and helping users understand our work. Experts in that field do exist, and their contributions are massively important.

## Tooling

Building your own tooling for documentation is silly, and I can say that because I've done it and it was silly. There are plenty of great tools out there, and while none of them are perfect, they are largely good and bad at the same things.

Remember, the point of documentation tooling is to help you write good docs for your users, and to help them find what they're looking for. If you're spending more time building a website than writing example code or usage content, then you're building a website, not writing docs (which is totally fine, but not everyone wants to do that).

### Features of good docs

When evaluating a "place to put your content", here's a list of table-stakes features that I think every docs site should have:

* Syntax highlighted code blocks - every once in a while I come across some docs that miss this. It's surprisingly jarring and confusing.
* Navigation, table of contents, etc - ways to find what you're looking for.
* Search - users often have an idea of what they want, but either can't verbalize it or can't find it. Search is vital here.
* Localization - even if your project doesn't have the capacity for building all the translations you'd want, the tools you use should still support it. Don't choose a documentation tool that can't expand past one language.
* Docs should be fast. Sounds obvious, but tacking on JavaScript frameworks and gigantic images just prevents people from reading the information, and that's what your docs need to focus on.

Those first two are quite common, but I see a variety of good, bad or non-existent search features and very rarely localized docs. Actually translating the content aside, the tools we use need to support that capability.

### Just write markdown

Markdown is an approachable way to format text. It's easy to contribute to and there's a ton of tooling around it.

Most (not all) projects should just have markdown for their documentation. If you're writing HTML and styling your docs, you're adding complexity to what should be a simple toolchain.

There are exceptions - projects that deal heavily in visuals like [TailwindCSS](https://tailwindcss.com/) or [Bootstrap](https://getbootstrap.com/) will need some customized designs. That's fine, but for the projects that are entirely code-for-other-code, markdown is more than enough.

### Auto-generated documentation

I've never gotten a good result from tools that purport to generate great documentation from your code. I've tried [TypeDoc](https://github.com/TypeStrong/typedoc/), [JSDoc](https://jsdoc.app/), [GoDoc](https://godoc.org/), written my own nonsense, and many others.

The value in those tools is that they make it easier to document the API - but they don't help to write _good_ docs. Simply **documenting your whole API is not going to be helpful** for your users. That doesn't mean these tools aren't useful, but they aren't enough on their own. Consider how auto-generated content will fit in with hand-written docs.

### Where the files live

You write markdown files. Now where do you put 'em? You basically have two options: in the repository with your source code, or in a separate repository called something like `<project>-docs`. I've done both, and there are pros & cons - but **keeping docs co-located with your code can be really, really useful**. It's easier to manage changes to docs and code together, and having one repository is generally simpler for both maintainers and contributors.

Checking in docs site code to git, like HTML/CSS files or static site generator configuration files, is a bit annoying. When you start talking about entire websites, I hesitate to call that "documentation" tooling though - you're designing and building a whole site that happens to have docs content. That's fine, but it is inherently more complicated than "just writing markdown." I'll talk more about why some projects really want a website later on.

### Jason's favorite tools

Firstly, I think that "documentation tooling" is one of the development world's most unfortunate necessities. It simply shouldn't be necessary to "build" your docs, or spend hours setting up the perfect docs site. Writing code shouldn't require design or web dev skills just to have great docs.

[GitBook](https://www.gitbook.com/)'s GitHub integration is the closest I've seen to a workflow that is sort-of-toolless and still pretty good. That said, here are some of the tools I've tried and liked:

* [Vuepress](https://vuepress.vuejs.org/) makes for a pretty site. It has features like search (via [Algolia](https://www.algolia.com/)) and localization built-in. It takes some work to configure the way you want it though.
* [Docusaurus](https://docusaurus.io/) is pretty similar, it calls out Crowdin in its docs.
* Just regular old markdown files in a GitHub repository. Missing all the features I mentioned above, but hey, at least it's simple.

## Discoverability

The best docs in the world don't mean anything if your users can't find 'em. Think about where they come from and what's important to them.

### Reduce context switching

Communities that have a thriving repository and a set of docs often decide to build a website. I think there are two reasons:

* Branding and marketing
* Where else would you put the docs?

The first one is super interesting. Projects like [Babel](https://babeljs.io/), [Webpack](https://webpack.js.org/), and [Formik](https://formik.org/) all have websites that show great designs, really productizing it. That's awesome, and it can contribute to a project's success by making it seem polished and high quality, while communicating the functionality in ways that are more expressive than static text (animations, demos, <abbr title="Read-Eval-Print Loop">REPLs</abbr>, etc).

However, there are so many projects that build, design and host a separate website - because if they didn't, where would they put their docs? That's what tools like Vuepress try to simplify. As good as those tools are, asking a user to go to yet another docs site isn't awesome. You're separating them from their regular workflows, adding more of a burden to their attempt at learning, and introducing opportunity for inconsistency between your docs and everyone else's.

### Keep the naming to a minimum

There are micro-ecosystems that have a lot of concepts to wrap your head around. For example, [`unifiedjs`](https://github.com/unifiedjs/unified) - a super powerful and customizable toolchain for manipulating markdown.

I find their documentation confusing because they reference so many repositories that are built to work within this grouping of plugins. You look at one of those plugins (ex: [`remark-toc`](https://github.com/remarkjs/remark-toc), [`remark-slug`](https://github.com/remarkjs/remark-slug)) and it's difficult to see how it all comes together. The best resource I found was [an entire tutorial](https://unifiedjs.com/learn/guide/introduction-to-unified/) and I really had to dig around to get there.

This isn't meant to point fingers at `unifiedjs` - they have a distributed ecosystem of plugins and pulling everything together is tough. But as a clueless user, finding the best entrypoint is difficult when you have one specific goal. You can help users avoid a rabbit hole of links and jargon by repeating information and bringing context to specific sections of your docs.

### More on localization

I am far from an expert here, but the one thing I've learned is that localization, or internationalization, is _hard_. Use tools that make it easier.

[Crowdin](https://crowdin.com/) is a great tool for letting contributors write translations. Their pricing page includes a callout for open source projects, though you do [have to request approval](https://crowdin.com/page/open-source-project-setup-request).

Crowdin integrates with GitHub, so if your docs are markdown files in your repository, that's a great start.

### Discovery in reverse: source code

Docs aren't _only_ for telling users about the public APIs. They offer a way to onboard contributors into the codebase, and teach them how it works. Source code and docs are interconnected - when you're writing out some example code, think about linking to the underlying source code. You can give your users an opportunity to go deeper, and come away having learned something more than just how to apply your code.

## Bonus: contribution workflow

Encouraging people to contribute to documentation is a great way to improve your docs, and to get them involved in the project. Contributing to open source is hard, contributing to docs should be easy. Keep that in mind when choosing tooling. Asking contributors to clone the repo, download dependencies and build a site just to change and verify some wording change can be a barrier for folks to get involved in the project.

It is important, however, to optimize for the right things. More people will read your docs than contribute to them. It's really easy to organize your content in a way that makes sense for your tooling, but doesn't support users' expectations or needs.

## Docs for a product's SDK or API

This is a bit of a gray area - earlier I noted that documenting a product is different from software, but there are platforms that have to do a bit of both. Take GitHub for example - it has a robust API that intersects with many of the same product areas as the UI on GitHub.com.

Documenting that much information, keeping it all up-to-date, and ensuring consistency and clarity across it all is really, really difficult. 

## Jason's hot take

Open source projects shouldn't **need** separate websites. [This tweet](https://twitter.com/bitandbang/status/1285358078511251456?s=20) was an interesting point of reflection:

> the number of high-impact open-source projects that could really use some help building a good website is mind bogglingly high

I asked myself: **what do these projects need a website for?**

The answer is, by and large, documentation - because there's not a better place to put it. You may see what I'm getting at, but I think the tools we already use should do more here.

### Closing thoughts

In an earlier iteration of this post, I included a number of examples of open source documentation. I removed them for the sake of brevity, but the list included [Tailwind CSS](https://tailwindcss.com/), [Stripe](https://stripe.com/docs) and [Lodash](https://lodash.com/). I'll be doing some deep dives into these in the future, I think they merit a more focused look.

I would [love to hear](https://twitter.com/JasonEtco) what y'all are doing for docs right now, and what you wish was easier.
