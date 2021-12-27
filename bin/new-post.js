#!/usr/bin/env node

const prompts = require('prompts')
const slugify = require('slugify')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const PATH_TO_POSTS = path.join(__dirname, '../posts')

async function main () {
  const answers = await prompts([{
    type: 'text',
    name: 'title',
    message: 'Title'
  }, {
    type: 'text',
    name: 'spoiler',
    message: 'Spoiler'
  }, {
    type: 'text',
    name: 'slug',
    message: 'Slug',
    initial(_, values) {
      return slugify(values.title, {
        lower: true,
        strict: true,
        remove: /[']/g
      })
    }
  }])

  const d = new Date()
  const date = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')

  const fm = yaml.dump({
    title: answers.title,
    spoiler: answers.spoiler,
    date
  })
  
  const content = ['---', fm.trim(), '---', '\n'].join('\n')
  const filepath = path.join(PATH_TO_POSTS, `${answers.slug}.md`)
  await fs.promises.writeFile(filepath, content)
  console.log(`📝 ${filepath} was created - have fun writing!`)
}

main()
