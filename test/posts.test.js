// This test suite validates all of the post
// markdown files contained in `/src/pages/posts/*.md`.
const fs = require('fs')
const fm = require('front-matter')
const path = require('path')
const Joi = require('joi')
const pathToPosts = path.join(__dirname, '..', 'src', 'pages', 'posts')

const schema = Joi.object({
  attributes: Joi.object({
    title: Joi.string().required(),
    date: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    spoiler: Joi.string().required(),
    related: Joi.array().items(Joi.string())
  }),
  body: Joi.string().required(),
  frontmatter: Joi.string().required()
})

describe('posts', () => {
  const dir = fs.readdirSync(pathToPosts).filter(file => file.endsWith('.md'))

  const posts = dir.map(file => {
    const contents = fs.readFileSync(path.join(pathToPosts, file), 'utf8')
    return [file, fm(contents)]
  })

  describe.each(posts)('%s', (key, value) => {
    it('has valid front matter', async () => {
      const validated = await schema.validate(value)
      expect(validated).toEqual(value)
    })
  })
})
