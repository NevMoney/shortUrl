const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const yup = require('yup')
const monk = require('monk')
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const nanoid = require('nanoid')

require('dotenv').config()

const db = monk(process.env.MONGO_URI)
const urls = db.get('urls')
urls.createIndex('slug')

const app = express()
app.enable('trust proxy')

app.use(cors())
app.use(helmet())
app.use(morgan('common'))
app.use(express.json())
app.use(express.static('./public'))

const notFoundPath = path.join(__dirname, 'public/404.html')

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
})

// create url
app.post('/url', async (req, res, next) => {
  let { slug, url } = req.body
  try {
    await schema.validate({
      slug,
      url,
    })
    if (!slug) {
      slug = nanoid.nanoid(5)
    } else {
      // check if slug is in use
      const existing = await urls.findOne({ slug })
      if (existing) {
        throw new Error('Slug in use. 🍔')
      }
    }
    slug = slug.toLowerCase()
    const newUrl = {
      slug,
      url,
    }
    console.log('newUrl', newUrl)
    // res.json(newUrl)
    const created = await urls.insert(newUrl)
    console.log('created', created)
    res.json(created)
  } catch (error) {
    next(error)
  }
})

// url redirect
app.get('/:id', async (req, res) => {
  const { id: slug } = req.params
  try {
    const url = await urls.findOne({ slug })
    if (url) {
      res.redirect(url.url)
    }
    return res.status(404).sendFile(notFoundPath)
    // another option:
    // res.redirect('/404') OR res.redirect(`/?error=${slug} not found`)
  } catch (error) {
    return res.status(404).sendFile(notFoundPath)
  }
})

app.get('/url/:id', (req, res, next) => {
  // todo: retrieve information about short url
})

// function to handle errors
app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status)
  } else {
    res.status(500)
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  })
})

// port
const port = process.env.PORT || 1337
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
