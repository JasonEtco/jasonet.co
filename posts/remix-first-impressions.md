---
title: Remix first impressions
spoiler: "I was poking around at Remix + PlanetScale + Prisma + TailwindCSS. Sharing some thoughts with y'all, and some random discoveries."
date: 2022-1-8
---
I'm working on an ~extremely complicated, innovative product~ a glorified CMS, and what's the fun in building things if you don't learn something along the way? So I've been trying to use some new-ish tools that seems interesting to me:

* [Remix](https://remix.run/): "...a full stack web framework that lets you focus on the user interface and work back through web fundamentals to deliver a fast, slick, and resilient user experience."
* [PlanetScale](https://planetscale.com/): "The MySQL-compatible serverless database platform."
* [Prisma](https://prisma.io/): "Next-generation Node.js and TypeScript ORM"
* [TailwindCSS](https://tailwindcss.com/) (not new to me, because its awesome and I love using it)

Of these, Remix (partially because of its position as a framework, and partially because of its opinionated design) is the most substantial part of this stack. The other tools mentioned there sort of fall into the background. The interesting parts are where those tools combine, how to get them working well with each other, and the very random niche problems one encounters when trying to use them together.

This isn't a proper "review" of these tools - I firmly believe that tools are both good and bad depending on the context in which you're using them. I just wanted to share some thoughts on my experience so far.

Also, and this is important: **I'm very new to Remix** so its totally possible that I write "gee whiz I wish this existed" and it actually does, is well documented, and I haven't found it. Please tell me!

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
  return <h1>There are {posts.length} posts!</h1>
}
```

The file path is what decides the route - Remix has conventions for how files are named, so you don't need to have in-code route strings to manage. `/app/routes/index.tsx` means that when you `GET /`, the exported `loader` function will automatically be called, and the data will be available in the `IndexPage` component by calling `useLoaderData`. The page is then _server-rendered_ and hydrated on the client in case you need to do anything interactive.

What's neat is that `loader` can do just about anything. It can read local files, call APIs, or talk to a database. This just feels like such a clean API to me, to group basic data lookups with the view itself. And because of React, your "view" doesn't need to be complicated, you can chunk it out nicely into smaller components.

It does data _writes_ similarly, by calling an exported `action` function - I find the `Form` submission behavior a little finicky (more later) but overall I dig the approach.

#### Composing loaders

This is probably my biggest gripe with Remix, and it took me some time to understand why composing loaders isn't a thing. Basically, what I'd like to do is share data between different "routes" on the same page. Let's say we have a "layout" and a "route":

```sh
/app/routes/$projectSlug /index.tsx # Available at GET /$projectSlug
/app/routes/$projectSlug  # Automatically a "Layout Route" based on naming
```

```tsx
// /app/routes/$projectSlug.tsx
import { Outlet } from 'remix'
export default function ProjectLayout() {
  return (
    <div>
      <h1>Project Layout</h1>
      <Outlet />
    </div>
  )
```

Any route under `/$projectSlug/*.tsx` will use this layout, and those routes' exported components will be injected via `<Outlet />`.

Now let's talk about how that interacts with the `loader` function. Both the layout and the route will be rendered, each with their owner loader - the layout's loader will be called first, and the route's loader will be called second. There's not a way to "share" data easily between those two loaders. Consider this:

```tsx
// /app/routes/$projectSlug.tsx
export const loader: LoaderFunction = async ({ params }) => {
  return {
    project: await db.projects.findFirst({ where: { slug: params.projectSlug } })
  }
}

// /app/routes/$projectSlug/index.tsx
export const loader: LoaderFunction = async ({ params }) => {
  // We want to find all posts for the project that we queried for in the layout loader
  // but... where's `project`?
  return {
    posts: await db.posts.findMany({ where: { projectId: project.id } })
  }
}
```

In the second loader within the route, there's no way for us to access the data from the layout loader. **Routes (including Layout Routes) are treated as distinct API endpoints**, so that they can be re-rendered and re-fetched independently. That's great, but it means repetition and duplicate database queries. In that example, in the `$projectSlug/index.tsx` loader we'd have to query for the project _again_, which is just wasteful.

#### Integration with TailwindCSS

There's nothing special here - Remix doesn't have any opinionated Tailwind integration, and recommends having a separate `npm` script to produce your CSS bundle(s). Totally reasonable, and [their docs on this](https://remix.run/docs/en/v1/guides/styling#tailwind) are quite helpful.

#### ESM fun times

**Extremely niche** but I was trying to use some of the [`unified`](https://unifiedjs.com/) library of Markdown AST-related libraries. These have all been published exclusively as ESM modules; which made for some wonky imports. This is super messy, but its the only way I've figured out how to properly import them:

```ts
export async function renderMarkdown(md: string) {
  const { unified } = await import('unified')
  const { default: markdown } = await import('remark-parse')
  const { default: remark2rehype } = await import('remark-rehype')
  const { default: html } = await import('rehype-stringify')

  const processor = unified()
    .use(markdown)
    .use(remark2rehype)
    .use(html)

  const processed = await processor.process(md)
  return processed.toString()
}
```

All of those dynamic imports makes me extremely sad 😭 but that's the best I've come up with. I've read various issues/discussions that suggest better ESM support might be coming for Remix, so I'm still hopeful!

#### Authentication

The [`remix-auth` library](https://github.com/sergiodxa/remix-auth) has popped up as a go-to way to handle authentication in Remix. Setting it up is easy, it gives all the info necessary and pairs really nicely with Remix's "server-run only `loader`s" behavior. My experience with it has overall been pretty good, but I find myself wishing for a more deeply integrated approach - because there's no way to compose loaders, I end up writing the same boilerplate code to either get the authenticated user or ensure that there is one:

```ts
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = authenticator.isAuthenticated(request)
  // Do other stuff...
}
```

It's a small thing, but it'd be great to have some kind of "middleware loader" so that I could, for example, populate the `request` object with something like `request.user.id` to save some steps down the line.

### Prisma

Prisma is just great. I'm using TypeScript, and having a typed ORM is just magical. I do end up writing "helper functions" to abstract complex queries, which has me wishing I could extend the generated client more programatically, but this works just fine:

```ts
import { Project } from '@prisma/client'
import { db } from '../utils/db.server'
export default class ProjectHelper {
  static async findByFullName({ slug, login, }: { slug: string login: string }) {
    return db.project.findFirst({
      where: {
        slug,
        owner: { login: { equals: login } }
      }
    })
  }
}
```

### PlanetScale

Pretty cool. I can't say that I've used it fully still, but being able to connect to an external dev database via a CLI is nifty, I've used it to clear my dev database while messing with seed data. Other than that, its kind of just chilling in the background, which is exactly what one wants from a database (IMO).
