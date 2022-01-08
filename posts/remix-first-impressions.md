---
title: Remix first impressions
spoiler: "I was poking around at Remix + PlanetScale + Prisma + TailwindCSS. Sharing some thoughts with y'all, and some random discoveries."
date: 2022-1-8
---
I'm working on an ~extremely complicated, innovative product~ a glorified CMS, and what's the fun in building things if you don't learn something along the way? So I've been trying to use some new projects that seems interesting to me:

* [Remix](https://remix.run/): "...a full stack web framework that lets you focus on the user interface and work back through web fundamentals to deliver a fast, slick, and resilient user experience."
* [PlanetScale](https://planetscale.com/): "The MySQL-compatible serverless database platform."
* [Prisma](https://prisma.io/): "Next-generation Node.js and TypeScript ORM"
* [TailwindCSS](https://tailwindcss.com/) (not new to me, because its awesome and I love using it)

Of these, Remix (partially because of its position as a framework, and partially because of its opininonated design) is the most substantial part of this stack. The other tools mentioned there sort of fall into the background, which is not a bad thing. The interesting parts are where those tools combine, how to get them working well with each other, and the very random niche problems one encounters when trying to use them together.

This isn't a proper "review" of these tools - I firmly believe that tools are both good and bad depending on the context in which you're using them. I just wanted to share some thoughts on my experience so far.

### Remix

Remix is a pretty new open source Node.js framework to hit the interwebz. It leans heavily into web fundamentals (`<form>`s over AJAX, supporting no-JavaScript), and has a focus on making performant experiences by intelligently loading/reloading parts of a page. Your app is "built" and "run", versus something like [Ruby on Rails](https://rubyonrails.org/) that doesn't have a build step at all.

Remix uses that build step to create multiple "bundles", ensuring that routes are only loading the code/dependencies they actually need. Keeps everything nice and snappy.

While Remix is not a "React framework" (it will support more than just React), that's the paved-path for Remix at the moment. It does a _great_ job at server-rendering - I really like the API for loading data. Here's what that looks like:

```tsx
// /app/routes/index.tsx
import { LoaderFunction, useLoaderData } from 'remix'

type LoaderData = Post[]

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const posts = await db.posts.findMany()
  return posts
}

export default function IndexPage() {
  const posts = useLoaderData<LoaderData>()
  return <h1>There are {posts.lenght} posts!</h1>
}
```

The file path is what decides the route - Remix has conventions for how files are named, so you don't need to have in-code route strings to manage. `/app/routes/index.tsx` means that when you `GET /`, the exported `loader` function will automatically be called, and the data will be available in the `IndexPage` component by calling `useLoaderData`. The page is then _server-rendered_ and hydrated on the client in case you need to do anything interactive.

What's neat is that `loader` can do just about anything. It can read local files, call APIs, or talk to a database. This just feels like such a clean API to me, to group basic data lookups with the view itself. And because of React, your "view" doesn't need to be complicated, you can chunk it out nicely into smaller components.

It does data _writes_ similarly, by calling an exported `action` function - I find the `Form` submission behavior a little finicky (more later) but overall I dig the approach.

#### Integration with TailwindCSS



#### ESM fun times

**Extremely niche** but I was trying to use some of the [`unified`](https://unifiedjs.com/) library of Markdown AST-related libraries. These have all been published exclusively as ESM modules; which made for some wonky imports. This is super messy, but its the only way I've figured out how to properly import 

#### Authentication

#### Composing loaders

#### Requests re-render, seemingly always