---
title: Just enough Docker to get by
date: '2019-01-23'
spoiler: You don't need to be a Docker pro to build things with it.
---

I've written a [couple] of [times] about GitHub Actions, and a key component of that ecosystem is [Docker](). It's kind of a big topic, as its a powerful tool that can do a lot, or be as complicated as you need it to be - but ultimately, not everyone needs to learn Docker's ins-and-outs.

This post will focus on the basics of Docker, with a nod to creating Docker containers for [GitHub Actions]() - but the fundamentals can be used for any project.

## What is Docker?

That's an important question, isn't it? Docker is a tool for **running applications in isolated containers**. You declare, by writing a `Dockerfile`, what your container needs to run and what code its running. Docker [has great documentation](), and I highly suggest you poke around there; my goal here is to give you some practical advice, but the docs are there to fill in areas that I intentionally skim over.

Here's an example. I'm building my Node.js application, and I want it to run on a Ubuntu machine (because I know that's where I'm deploying it). I have two options: install Ubuntu on my Macbook (no thanks) or use Docker to run the application inside of a Ubuntu **container**.

### Containers

For the sake of clarity, I want to call out this word. It's used often in the Docker ecosystem.

> A **container** is an isolated environment in which your code can be run.

You can have a thousand containers, and unless instructed otherwise they will not be able to interact with each other.

### Host

This one's fairly straightforward. Docker is some software you can install on your machine - if I'm running Docker from my Macbook and I spin up some containers, my Macbook is the **host**.

### Image

An image is sort of like a snapshot of a system. Remember, even operating systems are just stacks of code - you start with a blank slate, and install software, libraries and tools. Docker operates in the same way, just automated. So when I say "I want a Ubuntu container," what I really mean is that I want a container that uses a Ubuntu **image**.

Images are **built** - so you'll instruct Docker to build your image by following a set of instructions, and then you'll tell Docker "Hey I want a new container, using that image!"

## Dockerfiles

Docker operates by reading the instructions you give it from a special `Dockerfile`. The [reference docs]() do a great job of explaining each keyword in depth, but I'll share the more common ones. Let's break down this `Dockerfile`:

```docker
FROM node:slim

LABEL "maintainer"="Jason Etcovitch <jasonetco@github.com>"

# Copy over project files
COPY . .

# Install dependencies
RUN npm install

# This is what GitHub will run
ENTRYPOINT ["node", "/index.js"]
```

### `FROM`

This tells Docker where the _base_ image is. Docker works in layers, so we're starting off with an existing image and building a new image on top of it. When you build your image, Docker will download the `node:slim` image and use it to build yours.

We've specified the `node:slim` image - this is actually `node`, with the `slim` tag. Tags are like specific versions - you might say you want `node:10.15.0`, or even `node:latest`.

`slim` is a special one - its a Docker image that is smaller and has less functionality out of the box. This means that the image it builds will have a smaller file size, and be faster to download. There are lots of other options for smaller images - `alpine` is about the smallest Linux distribution you can get, but the more stripped-down your base image, the more work you'll have to do to ensure that your application has everything it needs to run.
