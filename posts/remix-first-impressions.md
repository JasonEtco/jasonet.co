---
title: Remix first impressions
spoiler: "In poking around at Remix (and PlanetScale, Prisma, TailwindCSS), I have some thoughts on Remix that I wanted to share!"
date: '2022-01-09'
reviewers:
  - name: "@Neurotic"
    url: "https://twitter.com/Neurotic"
    avatarUrl: https://pbs.twimg.com/profile_images/1388582832449101825/aA9ULpyf_400x400.jpg
  - name: "@directxman12"
    url: "https://twitter.com/directxman12"
    avatarUrl: https://pbs.twimg.com/profile_images/1231749389548314625/VJCgwT6n_400x400.jpg
---
I'm working on a ~~complicated, innovative product~~ glorified CMS, and what's the fun in building things if you don't learn something along the way? So I've been trying to use some new-ish tools that seem interesting to me. Descriptions yoinked from their respective websites:

* [Remix](https://remix.run/): "...a full stack web framework that lets you focus on the user interface and work back through web fundamentals to deliver a fast, slick, and resilient user experience."
* [PlanetScale](https://planetscale.com/): "The MySQL-compatible serverless database platform."
* [Prisma](https://prisma.io/): "Next-generation Node.js and TypeScript ORM"
* [TailwindCSS](https://tailwindcss.com/) (not new to me, because it's awesome and I love using it)

Of these, Remix (partially because of its position as a framework, and partially because of its opinionated design) is the most prominent part of this stack. It's interesting to see where and how those tools combine. Getting them working well with each other, and discovering the very random niche problems one encounters when trying to use them together, is a great way to understand the limitations and benefits of each tool.

This isn't a proper "review" of these tools; I firmly believe that tools are both good and bad depending on the context in which you're using them. This is more of a brain-dump of my experience of using these tools so far.

Also, and this is important: **I'm very new to Remix** so it's totally possible that I write "gee whiz I wish this existed" and it actually does, is well documented, and I haven't found it. [Please tell me!](https://twitter.com/JasonEtco)

## Remix

Remix is a fairly new open source Node.js framework to hit the interwebz. It leans heavily into web fundamentals (`<form>`s over AJAX, supporting no-JavaScript), and has a focus on making performant experiences by intelligently loading/reloading parts of a page. Your app is "built" and "run", versus something like [Ruby on Rails](https://rubyonrails.org/) that does most of its work at runtime.

Remix uses that build step to create multiple "bundles", ensuring that routes are only loading the code/dependencies they actually need. Keeps everything nice and snappy.

### Reading/rendering data

While Remix is not a "React framework" (it will support more than just React), that's the paved path for Remix at the moment. It does a _great_ job at server-rendering—I really like [the API for loading data](https://remix.run/docs/en/v1/api/conventions#loader).

Routes can export a `loader` function that runs only on the server. You can then call Remix's `useLoaderData` within the route to load whatever is returned from that `loader`. Here's what that looks like:

```tsx
// /app/routes/index.tsx
import { useLoaderData, LoaderFunction } from 'remix'

export const loader: LoaderFunction = async () => {
  // Query your database (ex: via Prisma). `loader` is only called on
  // the server so it can include credentials and sensitive information
  return db.posts.findMany()
}

export default function IndexPage() {
  const posts = useLoaderData<Posts[]>()
  return <h1>There are {posts.length} posts!</h1>
}
```

#### Organize data lookups with the view itself

That `loader` can fetch and return just about anything. It can read local files, call APIs, or talk to a database. This just feels like such a clean API to me; seeing the data-fetching next to the view feels clear, and requires less jumping around between files. And because of React, your "view" doesn't need to be complicated and you can chunk it out nicely into smaller components.

#### File paths as routes

The file path is what decides the route. Remix has [conventions for how files are named](https://remix.run/docs/en/v1/api/conventions#route-file-conventions), so you don't need to have in-code route strings to manage.

A file named `/app/routes/index.tsx` means that when you `GET /`, the exported `loader` function will automatically be called, and the data will be available in the `IndexPage` component by calling `useLoaderData`. The page is then _server-rendered_ and hydrated on the client in case you need to do anything interactive.

### Writing data

That's _reading_ data and rendering it, but what if you want to _write_ data? Well, there's a similarly designed API for that. Routes can export an `action` function:

```tsx/0-5
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  return db.posts.create({
    data: { title: formData.title }
  })
}
```

Similar to `loader`s, `action` functions are automatically called when a request is made—except with `action`, it responds to things like `POST` or `PATCH` requests. You can trigger those using [Remix's `<Form />` component](https://remix.run/docs/en/v1/api/remix#form):

```tsx/6-8
export default function IndexPage() {
  const posts = useLoaderData<LoaderData>()
  return (
    <div>
      <h1>There are {posts.length} posts!</h1>
      <Form method="post">
        New post: <input name="title" />
        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}
```

Remix is smart enough to re-render _this whole component_, including re-calling the `loader` in the same file, after the `<Form />` is submitted. So in this very simple example, "adding a post" will _also_ update the UI to show an updated number of posts—without having to fully refresh the page. What's impressive is that it's all being done server-side, but re-rendered on the client transparently and without any work from me.

I think that **seeing the `<Form />` and the "endpoint" (AKA `action`) right next to each other** is a clear way to see the lifecycle of that endpoint.

One part of this API that irks me is that `Form` always sends an instance of `FormData` (and encodes it to transport over HTTP). To serialize a form's submission, you call `request.formData()`:

```ts/1-3
const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  // formData is a FormData object
  // console.log(formData.get('title'))
}
```

`FormData` is more powerful than plain JSON objects, with methods like [`getAll`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/getAll) (representing multiple values for the same key)—but it plays poorly with strictly typed libraries like Prisma. You can't easily just pass user-submitted values to the Prisma client without fudging the types a bit:

```ts
const formData = await request.formData()
return db.posts.create({
  // will throw a TypeScript error, because `title` might be `null`
  // but is required for every new Post
  data: { title: formData.get('title') }
})
```

Now of course, we should be validating the input and thereby inferring the right type—but from an ease-of-pluggability perspective, I find converting the `FormData` to a plain object to be kind of a pain.

### Composing loaders

This is probably my biggest gripe with Remix, and it took me some time to understand why composing loaders isn't a thing. Basically, what I'd like to do is share data between different "routes" on the same page. Let's say we have a [Layout Route](https://remix.run/docs/en/v1/api/conventions#layout-routes) and a regular route route:

```
app/
├── routes/
│   ├── $projectSlug.tsx (Layout Route)
│   └── $projectSlug/
│       └── index.tsx    (Regular Route)
└── root.tsx
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
}
```

Any route under `/$projectSlug/*.tsx` will use this layout, and those routes' exported components will be injected via Remix's special `<Outlet />` component—like a _magical child component_ 🌈

#### Layouts + child `loader`s

Now let's talk about how that interacts with the `loader` function. Both the layout and the route will be rendered, each with their own loader. They'll be called in parallel, but independent of one another. There's not a way to "share" data easily between those two loaders. Consider this:

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

The argument there is that by loading each route's `loader` separately, they can be re-queried to only update parts of the UI that need updating. That's great and all, but for the initial server-render where we're getting it all, it's just purely duplicative.

### Integration with TailwindCSS

There's nothing special here—Remix doesn't have any opinionated Tailwind integration, and recommends having a separate `npm` script to produce your CSS bundle(s). Totally reasonable, and [their docs on this](https://remix.run/docs/en/v1/guides/styling#tailwind) are quite helpful.

### ESM fun times

**Extremely niche** but I was trying to use some of the [`unified`](https://unifiedjs.com/) library of Markdown AST-related libraries. These have all been [published exclusively as ESM modules](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#pure-esm-package), which made for some wonky imports. I find this to be ugly, but it's the only way I've figured out how to properly import them:

```ts
export async function renderMarkdown(md: string) {
  const { unified } = await import('unified')
  const { default: markdown } = await import('remark-parse')

  const processor = unified().use(markdown)
  return processor.process(md)
}
```

All of those dynamic imports makes me extremely sad 😭 but it's the best I've come up with. I've read various issues/discussions that suggest better ESM support might be coming for Remix, so I'm still hopeful!

### Authentication

The [`remix-auth` library](https://github.com/sergiodxa/remix-auth) has popped up as the go-to way to handle authentication in Remix. Setting it up is easy, it gives all the info necessary and pairs really nicely with Remix's "server-run only `loader`s" behavior. My experience with it has overall been pretty good, but I find myself wishing for a more deeply integrated approach. Because there's no way to compose loaders, I end up writing the same boilerplate code to either get the authenticated user or ensure that there is one:

```ts
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request)
  // Do other stuff...
}
```

It's a small thing, but it'd be great to have some kind of "middleware loader" so that I could, for example, populate the `request` object with something like `request.user.id` to save some steps down the line.

## Other tools

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

Pretty cool. I can't say that I've used it fully still, but being able to connect to an external dev database via their CLI, without having to deal with credentials or connection strings, is nifty. I've used it to clear my dev database while messing with seed data. Other than that, it's kind of just chilling in the background, which is exactly what I want from a database.

Being able to view schema changes in a UI is awesome. There are some minor performance nits (creating a branch takes a couple seconds, so you can't create a branch and then immediately connect to it) but as the platform matures, I think it'll be even more compelling.

~~The integration with Prisma is really confusing though. Both PlantScale and Prisma have [documentation](https://docs.planetscale.com/tutorials/automatic-prisma-migrations) about that pairing, but it's out of date and doesn't cover every use case. The best resource for understanding the necessary changes is [this GitHub issue](https://github.com/prisma/prisma/issues/7292), which is _not_ easy to read. The right info is all in there, it's just all so recent and in flux that it hasn't yet been well documented~~.

Nevermind! The doc was recently update to be way more clear about best practices when connecting the two systems. Once I got it to connect properly and push schema changes, everything was ✨

## Wrap-up

All in all, I'm pretty happy with Remix. Although it makes compromises and tradeoffs (what tool doesn't?), the decisions the developers have made for it feel really nice to use. None of the above nitpicks are blockers, and I haven't found anything that feels really horrible to do using Remix. I think that with some more time, we'll find the right balance of abstractions and Remix-related libraries to knock out most of those nitpicks anyway.

Their docs are "good not great", with some stuff undocumented (like supporting ESM) and some stuff just stubbed out. What _is_ there is detailed, specific and helpful when actually building things.

I'd suggest reading [their Technical Explanation doc](https://remix.run/docs/en/v1/pages/technical-explanation); it's well written, and helped me understand why things like `loader`s work the way they do. Remix is also still pretty new, so it can (probably) only get better 🚀
