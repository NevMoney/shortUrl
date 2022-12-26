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

// const db = monk(process.env.MONGO_URI)
// const urls = db.get('urls')
// urls.createIndex({ slug: 1 }, { unique: true })

const app = express()
app.enable('trust proxy')

app.use(cors())
app.use(helmet())
app.use(morgan('common'))
app.use(express.json())
app.use(express.static('./public'))

const notFoundPath = path.join(__dirname, 'public/404.html')

// app.get('/:id', async (req, res, next) => {
//   // Redirect to URL
//   const { id: slug } = req.params
//   try {
//     // const url = await urls.findOne({ slug })
//     if (url) {
//       return res.redirect(url.url)
//     }
//     res.status(404).sendFile(notFoundPath)
//   } catch (error) {
//     res.status(404).sendFile(notFoundPath)
//   }
// })

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
})

// app.get('/url/:id', (req, res) => {
//   // TODO: Get short URL by ID
// })

// Generate short URL
app.post(
  '/shorten',
  slowDown({
    windowMs: 30 * 1000, // 30 seconds
    delayAfter: 1, // allow 1 requests per 30 seconds, then...
    delayMs: 500, // begin adding 500ms of delay per request above 1:
  }),
  rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 1, // limit each IP to 1 requests per windowMs
    handler: (req, res, next) => {
      res.status(429).json({ message: 'Too Many Requests' })
    },
  }),
  async (req, res, next) => {
    // grab the url and slug from the request body
    let { slug, url } = req.body
    try {
      // validate the request body
      await schema.validate({
        slug,
        url,
      })
      // if the slug is not provided, generate one
      if (!slug) {
        //   slug = nanoid.nanoid(5)
        slug = nanoid(5) //cj did not pass a number to nanoid, but i think this limits the length of the slug to 5 characters
      }
      // else {
      //   // check if the slug is already in use
      //   const existing = await db.get('urls').find({ slug }).value()
      //   if (existing) {
      //     throw new Error('Slug in use')
      //   }
      // }
      // store the url and slug in the database
      const newUrl = {
        slug,
        url,
      }
      // await db.get('urls').push(newUrl).write()
      // return the new url to the client
      res.json(newUrl)
    } catch (error) {
      next(error) //cj had this
    }
  },
)

app.use((req, res, next) => {
  res.status(404).sendFile(notFoundPath)
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

const port = process.env.PORT || 1337
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
