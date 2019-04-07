---
title: Just enough Docker
date: '2019-03-25'
spoiler: You don't need to be a Docker expert to build things with it.
---

I've written a [couple](../building-github-actions-in-node) of [times](../use-github-actions-for-ci) about GitHub Actions, and a key component of that ecosystem is [Docker](https://docker.com). It's kind of a big topic, as its a powerful tool that can do a lot, or be as complicated as you need it to be—but ultimately, not everyone needs to learn Docker's ins-and-outs.

This post will talk about the basics of Docker, with a focus on configuring Docker containers for [GitHub Actions](https://github.com/features/actions)—but the fundamentals can be used for any project.

One note: I'm intentionally simplifying certain things here. I firmly believe in avoiding information overload, and bombarding people with more knowledge than is necessary is harmful to their learning experience. If you're a Docker expert thinking "well yeah _but_"—remember that building amazing things using a technology does not require one to be a master of it!

## What is Docker?

That's an important question, isn't it? Docker is a tool for **running applications in isolated containers**. You declare, by writing a `Dockerfile`, what your container needs to run and what code it's running. Docker [has great documentation](https://docs.docker.com), and I highly suggest you poke around there; my goal here is to give you some practical advice, but the docs are way better at filling in areas that I intentionally skim over.

Here's an example: I'm building my Node.js application, and I want it to run on a Ubuntu machine (because I know that's where I'm deploying it). I have two options: install Ubuntu on my Macbook (no thanks) or use Docker to run the application inside of a Ubuntu **container**. By using Docker, I get a local development environment that is 100% the same as where I'm deploying my application, despite being on a MacBook (or Windows for that matter).

### Containers

For the sake of clarity, I want to call out this word. It's used often in the Docker ecosystem.

> A **container** is an isolated environment in which your code can be run.

You can have thousands of containers, and unless instructed otherwise they will not be able to interact with each other. They're "run" from an "image" (see below). They can be started, stopped or restarted. They're (often) ephemeral, so if a container dies you can start up a new one and pick up where the last one left off.

Containers can be run on your computer, or on some cloud service (more about this later).

### Host

This one's fairly straightforward. Docker is some software you can install on your machine—if I'm running Docker from my Macbook and I spin up some containers, my MacBook is the **host**. Communication between a container and its host is a common topic of conversation, so we'll get into that later on.

### Image

An image is a sort of snapshot of a system. Remember, even operating systems are just stacks of code—you start with a blank slate and install software, libraries, and tools. Docker operates in the same way, just automated. So when I say "I want a Ubuntu container," what I really mean is that I want a container that uses a Ubuntu **image**.

Images are **built**—so you'll instruct Docker to build your image by following a set of instructions, and then you'll tell Docker "Hey I want a new container, using that image!"

## Dockerfiles

Docker operates by reading the instructions you give it from a special `Dockerfile`. The [reference docs](https://docs.docker.com/engine/reference/builder/) do a great job of explaining each keyword in depth, but I'll share the more common ones. Let's break down this `Dockerfile`:

```docker
FROM node:slim

# Copy over project files
COPY . .

# Install dependencies
RUN npm install

# This is what GitHub will run
ENTRYPOINT ["node", "/index.js"]
```

### `FROM`

This tells Docker where the _base_ image is. Docker works in layers, so we're starting off with an existing image and building a new image on top of it. When you build your image, Docker will download the `node:slim` image and use it to build yours.

We've specified the `node:slim` image—this is actually `node`, with the `slim` tag. Tags are like specific versions—you might say you want `node:10.15.0`, or even `node:latest`.

`slim` is a special one—it's a Docker image that is **smaller and has less functionality out of the box**. This means that the image it builds will have a smaller file size, and be faster to download. There are lots of other options for smaller images—`alpine` is a popular Linux distribution.

The more stripped-down your base image, the more work you'll have to do to ensure that your application has everything it needs to run. [Here's a great article outlining the differences](https://derickbailey.com/2017/03/09/selecting-a-node-js-image-for-docker/) for Node.js images, but the concepts are good to learn for general Docker-ing.

### `RUN`

The `RUN` keyword tells Docker to **run a command while building the image**. This isn't done while your app is running, but rather at build time—just once while creating the "snapshot." A common use-case for this is installing dependencies, or building a production bundle:

```docker
RUN npm install
RUN npm run build
```

### `COPY`

If we think of a Docker container as some ephemeral, invisible box, it's important to remember that unless we tell it to, it won't have access to any of our application's files. `COPY` tells Docker, while building the image, to copy certain files into the image.

Here we're saying "copy everything from the current directory of the host to the current directory of the image:

```docker
# COPY <host> <image>
COPY . .
```

### `ENTRYPOINT`

After building an image from this Dockerfile, we need to tell Docker what to run when we create and run a container. `ENTRYPOINT` does just that—it tells Docker:

> Hey, when you run a container with this image, run `node /index.js`!

## Caching

Building Docker images can be quite slow, but there are ways to make it a lot faster. Aside from using a small base image, there are a few tricks that you can use.

### Layers

Docker operates on layers—each line in a Dockerfile is its own "layer." Docker will cache those individual layers:

```docker
# Cache this:
RUN npm install
# Cached!

# Cache this:
RUN npm run build
# Cached!
```

To invalidate the cache and force it to re-build a layer, you need to change the line. We can use this to our advantage:

```docker
# Copy just this file
COPY package.json .
# Install dependencies
RUN npm install
# Copy the rest of our files
COPY . .
```

Here, we're copying over the `package.json` file and installing dependencies _before_ copying the rest of our files. This tells Docker to only run `npm install` when `package.json` changes! It's smart enough to not copy the file twice for each `COPY` declaration.

## Building and running your containers

You can, of course, build and run containers locally, using the [Docker desktop apps](https://docs.docker.com/install/). I won't cover all of the [available CLI commands](https://docs.docker.com/engine/reference/run/), but you can get by pretty well with the following two commands:

```shell
# Build my image, `.` is the current directory that includes a Dockerfile
docker build . --tag my-image
# Run, or create a container, from the image
docker run my-image
```

## Where to deploy your containers

Just like there are hundreds of options for deploying a web server, many cloud deployment tools have support for running Docker containers. You may already know that [GitHub Actions run in Docker containers](https://developer.github.com/actions/creating-github-actions/creating-a-docker-container/) that GitHub deploys for you. [Azure Container Instances](https://azure.microsoft.com/en-ca/services/container-instances/), [Heroku](https://devcenter.heroku.com/categories/deploying-with-docker), [Amazon ECS](https://aws.amazon.com/getting-started/tutorials/deploy-docker-containers/) are all options for other projects.

---

## More things

Remember when I said that I'd be simplifying certain areas? Well, here are some additional resources that don't fit into this post, but would be a good next stop on your Docker journey.

* [docker-compose](https://docs.docker.com/compose/), a tool for building and running **multiple containers** at once.
* [Multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/), a strategy for minimizing image size by creating temporary sub-images.
* [Volumes](https://docs.docker.com/storage/volumes/), a way to persist data to the host, but still read and write to it from within your containers.