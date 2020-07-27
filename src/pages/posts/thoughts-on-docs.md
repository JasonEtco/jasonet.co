---
title: Assorted thoughts on documentation
date: '2020-07-26'
spoiler: Been thinking about documentation a lot recently and wanted to write down what I've seen and learned.
---

Documentation is a fundamental part of software, both open source and proprietary. There are lots of methods for building great docs, and lots of examples of fantastic software with docs that just don't help their users. There have been studies that show that documentation is ["is highly valued, but often overlooked"](https://opensourcesurvey.org/2017/#insights) and my own experience lines up with those findings. So I wanted to share what I know and how I think about documentation, and some recommendations for you (and me).

One note before we get into it: documentation for software is by and large very different from documentation for a product. With the latter, there is a fixed number of actions a user can take. Even something as complex and dynamic as [Figma](https://www.figma.com/) has a limit to what a user can do (more on plugin systems and SDKs later on). But when writing docs for software, like a reusable open source library, you need to expect the unexpected - how will consumers of that library use the code? It's not about having that answer, but about giving them the tools to use the code however they want.

## What makes good documentation

This is the big question, and I'm going to separate it into three parts: content, tooling and discoverability.

Ultimately, we write documentation to remove the barrier of entry for people who may want to use our code. There can be some branding and marketing involved, but I'd like to focus solely on the actual documentation.

I'll also include some examples, but I'm not an authority on what makes docs good - so I'd love to [hear from you](https://twitter.com/JasonEtco).

## Content

I want to start here, because you can have the most features, the best tooling, all the bells and whistles - but if your content isn't helpful, your docs just aren't going to be good. So what makes content "good"? I think it comes down to focusing on what users **want to accomplish**. Most people don't want to see the entire API surface - they have a goal in mind with your library and want to get there with as little friction and ambiguity as possible.

### Prioritize use-case-driven examples

This is tricky in practice, because it extends into API design - documenting something complex in nature is going to make for complex documentation. So when you're writing down documentation, try to take the perspective of someone who doesn't know anything about your library, why it exists or how it works - only what it _does_.

For example, let's say we have a library called `math`. It exposes four methods: `add`, `subtract`, `divide`, and `validate`. That last one, `validate`, is used in the first three to validate the arguments passed to each method. We can assume that _most_ users don't need to see that method right away when looking at the docs. They have a problem, like "math is hard" and want to solve that problem, not absorb the complexity of your library.

One library that does this particularly well is 

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

That's a great place to start from. Start simple, lean on default values of your library, then go more and more complex. Ending with the API details can be really helpful, because you don't know _exactly_ what users want from your library. It _is_ important to share examples of each of those methods though.

I think about [Sequelize's documentation](https://sequelize.org) a lot, specifically their [API reference](https://sequelize.org/v5/identifiers.html). It's an <abbr title="Object-relational mapping">ORM</abbr>, so it is fairly complex and will have a lot to document. Their docs suffer from a really common problem: auto-generated documentation simply isn't helpful enough. They document _everything_, focusing on very little. Here's an example of what I mean ([source](https://sequelize.org/v5/class/lib/query-interface.js~QueryInterface.html#instance-method-dropAllTables)):

<img width="1153" alt="image" src="https://user-images.githubusercontent.com/10660468/88492040-bdc2b980-cf75-11ea-85f1-05e5313e04b5.png">

Because there's no example code here, I have to follow the table of options while making guesses about where and how this method should be used.

There are lots of cases where Sequelize does this really well, outside of the API reference - but when I'm looking at a method's documentation trying to understand what an option does, I need to know what it's for and why I would use it. If you're asking users to read 3 pages, ask yourself if you can condense that or provide links in between.

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

### Keep the naming to a minimum

There are micro-ecosystems that have a lot of concepts to wrap your head around. For example, [`unifiedjs`](https://github.com/unifiedjs/unified) - a super powerful and customizable toolchain for manipulating markdown.

I find their documentation really confusing because they reference so many repositories that are built to work within this grouping of plugins. You look at one of those plugins (ex: [`remark-toc`](https://github.com/remarkjs/remark-toc), [`remark-slug`](https://github.com/remarkjs/remark-slug)) and it's really difficult to see how it all comes together. The best resource I found was [an entire tutorial](https://unifiedjs.com/learn/guide/introduction-to-unified/) dedicated to putting those pieces together. 

This isn't meant to point fingers at `unifiedjs` - they have a distributed ecosystem of plugins and pulling everything together is tough. But as a clueless user, finding the best entrypoint is difficult when you have one specific goal. You can help users avoid a rabbit hole of links and jargon by repeating information and bringing context to specific sections of your docs.

## Tooling

Building your own tooling for documentation is silly, and I can say that because I've done it and it was silly. There are plenty of great tools out there, and while none of them are perfect, they are largely good and bad at the same things.

Remember, the point of documentation tooling is to help you write good docs for your users, and to help them find what they're looking for. If you're spending more time building a website than writing example code or usage content, then you're building a website, not writing docs (which is totally fine, but not everyone wants to do that).

### Features of good docs

When evaluating a "place to put your content", here's a list of table-stakes features that I think every docs site should have:

* Syntax highlighted code blocks - every once in a while I come across some docs that miss this. It's surprisingly jarring and confusing.
* Navigation, table of contents, etc - ways to find what you're looking for.
* Search - users often have an idea of what they want, but either can't verbalize it or can't find it. Search is vital here.
* Localization - even if your project doesn't have the capacity for building all the translations you'd want, the tools you use should still support it. Don't choose a documentation tool that can't expand past one language.

Those first two are quite common, but I see a variety of good, bad or non-existent search features and very rarely localized docs. Actually translation the content aside, the tools we use need to support that capability.

### Just write markdown

Most (not all) projects should just have markdown for their documentation. If you're writing HTML and styling your docs, you're adding complexity to what should be a simple toolchain.

There are exceptions - projects that deal heavily in visuals like [TailwindCSS](https://tailwindcss.com/) or [Bootstrap](https://getbootstrap.com/) will need some customized designs. That's fine, but for the projects that are entirely code-for-other-code, markdown is more than enough. Of couse

### Auto-generated documentation

I've never gotten a good result from tools that purport to generate great documentation from your code. I've tried [TypeDoc](https://github.com/TypeStrong/typedoc/), [JSDoc](https://jsdoc.app/), [GoDoc](https://godoc.org/), written my own nonsense, and probably some other ones I'm forgetting. Thhe value in those tools is that they make it easier to document the API - but they don't help to write _good_ docs. Simply documenting your whole API is _not_ going to be helpful for your users. That doesn't mean these tools aren't useful, but they aren't enough on their own, and I've struggled getting them to work together with other tooling.

### Where the files live

You write markdown files. Now where do you put 'em? You basically have two options: in the repository with your source code, or in a separate repository called something like `<project>-docs`. I've done both, and there are pros & cons - but **keeping docs co-located with your code can be really, really useful**. It's easier to manage changes to docs and code together, and having one repository is generally simpler for both maintainers and contributors.

It can be a pain to include docs site code, like HTML/CSS files or static site generator configuration files. When you start talking about entire websites, I hesitate to call that "documentation" tooling though - you're designing and building a whole site that happens to have docs content. That's fine, but it is inherently more complicated than "just writing markdown."

### Jason's favorite tools

Firstly, I think that "documentation tooling" is one of the development world's biggest mistakes. It simply shouldn't be necessary to "build" your docs, or spend hours setting up the perfect docs site. Writing code shouldn't require design or web dev skills just to have great docs.

[GitBook](https://www.gitbook.com/)'s GitHub integration is the closest I've seen to a workflow that is sort-of-toolless and still pretty good. That said, here are some of the tools I've tried and liked:

* [Vuepress](https://vuepress.vuejs.org/) makes for a pretty site. It has features like search (via [Algolia](https://www.algolia.com/)) and localization built-in. It takes some work to configure the way you want it though.
* [Docusaurus](https://docusaurus.io/) is pretty similar, it calls out Crowdin in its docs.
* Just regular old markdown files in a GitHub repository. Missing all the features I mentioned above, but hey, at least it's simple.

## Discoverability

TODO

### Reduce context switching

TODO: External websites are interesting.

### More on localization

I am far from an expert here, but the one thing I've learned is that localization, or internationilzation, is _hard_. Use tools that make it easier.

[Crowdin](https://crowdin.com/) is a great tool for letting contributors write translations. Their pricing page includes a callout for open source projects, though you do [have to request approval](https://crowdin.com/page/open-source-project-setup-request).

Crowdin integrates with GitHub, so if your docs are markdown files in your repository, that's a great start.

### Discovery in reverse: source code

TODO

## Bonus: contribution workflow

TODO

## Inspiration

This is a not-at-all extensive list of docs that I, in my subjective opinion, think are good. I won't go in-depth, some of these are quite large, but let me know if you're interested in more of a deep-dive.

### [Nunjucks](https://mozilla.github.io/nunjucks/)

<img class="shadow-md rounded-sm" src="https://user-images.githubusercontent.com/10660468/88499014-ae9e3480-cf92-11ea-8b6e-405a9928af33.png" alt="Nunjucks' homepage" />

It's simple and concise. Navigation is clear and well organized. Their [Getting Started guide](https://mozilla.github.io/nunjucks/getting-started.html) is similarly distraction-free - clear headings for Browser vs. Node, and then under **Usage** they literally have this:

> This is the simplest way to use nunjucks.

It's beautiful. Show me the simple stuff, then build on that.

One nit though - there's no search. There are only a few pages so you _can_ use the browser's "find in page", but searching by natural language like "cache a template" would be a really nice addition.

### [Lodash](https://lodash.com/)

<img class="shadow-md rounded-sm" src="https://user-images.githubusercontent.com/10660468/88499091-e907d180-cf92-11ea-9551-a70bf2bc889d.png" alt="Lodash's homepage" />

I mentioned this one earlier, but it's super clean and straight to the point. Their code examples are realistic, show inputs and outputs, and even have a **Try in REPL** button that opens a [Runkit](https://runkit.com/) embed. This is _awesome_, and we should have something similar everywhere that docs exist (cough cough GitHub). Being able to try and experiment with a library before you install it is incredibly powerful.

### [Tailwind CSS](https://tailwindcss.com/)

<img class="shadow-md rounded-sm" src="https://user-images.githubusercontent.com/10660468/88499728-b9f25f80-cf94-11ea-9930-672b36e69d69.png" alt="Tailwind CSS' homepage" />

It's gorgeous, but it _is_ for a design system. What I really love about it is how well-considered search is. You'll see this in the header:

<img width="980" alt="Header of Tailwind CSS' website, showing a hotkey to focus search input" src="https://user-images.githubusercontent.com/10660468/88499524-186b0e00-cf94-11ea-8098-1bf9310cba59.png" />

And search works really well, using [Algolia](https://www.algolia.com/) (who also [has a free-for-open-source plan](https://www.algolia.com/for-open-source/)):

<img width="971" alt="Search results" src="https://user-images.githubusercontent.com/10660468/88499569-3f294480-cf94-11ea-8683-4ff72b8f0175.png" />

There's more though - they start with the fundamentals of Tailwind before going into each utility class. First is installation, and then they include a section about **Using with Preprocessors**. I think this is really smart, because while you don't _need_ a preprocessor to use Tailwind, most of their users _want_ to (I'm guessing). It's about meeting your users where they are, not where you want them to be.

### [Stripe](https://stripe.com/docs)

<img class="shadow-md rounded-sm" src="https://user-images.githubusercontent.com/10660468/88501012-320e5480-cf98-11ea-8272-0850cb47271d.png" alt="Stripe's docs homepage" />

Stripe's docs are awesome. There's _so much_, but they do a good job of organizing the content into reasonable and understandable categories. One (of oh so many) nice touches is the little `API` labels beside links that point to a Stripe API:

<img width="569" alt="image" src="https://user-images.githubusercontent.com/10660468/88500798-b7453980-cf97-11ea-981e-4629758420f2.png">

It helps readers understand context, find more information if they need to, and provide a holistic experience without distracting from the content they're actively reading.

### [Starship](https://starship.rs/)

<img class="shadow-md rounded-sm" src="https://user-images.githubusercontent.com/10660468/88499833-0c338080-cf95-11ea-9fb5-3dbec4ab0314.png" alt="Starship's homepage" />

<small>Hey [@matchai](https://twitter.com/matchai) 😗</small>

I love this one and it makes me sad. It's a pretty standard [Vuepress](https://vuepress.vuejs.org/) site, so it has search and localizaton built-in (Yay!). If you were to scroll down in the above screenshot, you'd see a great little GIF that shows Starship, a command prompt, in action. The homepage goes right into installation, which is great. Each configuration option comes with a little TOML example.

But this is a perfect example of great software that has to have a dedicated website for documentation. Unlike the previous examples, Starship isn't part of the web ecosystem. What if the Starship developers weren't web devs? Would they have the know-how to set up a site like this? They seem smart, they can figure it out - but why should they have to?

## Docs for a product's SDK or API

This is a bit of a gray area - earlier I noted that documenting a product is different from software, but there are platforms that have to do a bit of both. Take GitHub for example - it has a robust API that intersects with many of the same product areas as the UI on GitHub.com.
