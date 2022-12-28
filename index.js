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
const ip = require('ip')
const bcrypt = require('bcrypt')

require('dotenv').config()

const db = monk(process.env.MONGO_URI)

const urls = db.get('urls')
urls.createIndex('slug')

const users = db.get('users')
users.createIndex({ email: 1 }, { unique: true })

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
  visits: yup.number().integer().default(0),
  visitors: yup.array().default([]),
  uniqueVisitors: yup.number().integer().default(0),
})

// need a schema for users
const userSchema = yup.object().shape({
  email: yup.string().trim().email().required(),
  password: yup.string().trim().required(),
})

// allow for /links page to be loaded without error
app.get('/links', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/links.html'))
})

// register new user
app.post('/register', async (req, res, next) => {
  const { email, password } = req.body
  console.log('email', email, 'password', password)
  try {
    // use crypto to encrypt the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10)
    await userSchema.validate({
      email,
      password,
    })
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      res.status(409)
      throw new Error('User already exists. Please login.')
    }
    const user = await users.insert({
      email,
      password: hashedPassword,
    })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// login
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  try {
    await userSchema.validate({
      email,
      password,
    })
    const user = await users.findOne({ email })
    if (!user) {
      res.status(401)
      throw new Error('Invalid email')
    }
    if (user.password !== password) {
      res.status(401)
      throw new Error('Invalid password')
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// get user by id
app.get('/user/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await users.findOne({ _id: id })
    if (!user) {
      res.status(404)
      throw new Error('User not found 🤷‍♂️')
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// get all urls
app.get('/urls', async (req, res, next) => {
  try {
    const items = await urls.find({})
    res.json(items)
  } catch (error) {
    next(error)
  }
})

/**
 * ********************************************************************************************************
 * *****    *****  **********     *****
 * *****    *****  *****   ****   *****
 * *****    *****  *****   ****   *****
 * *****    *****  *****  ****    *****
 * *****    *****  ***** ****     *****
 * *****    *****  *****  ****    *****
 * **************  *****   ****   **************
 *  ************   *****     **** **************
 * ********************************************************************************************************
 *  */
// create url
app.post(
  '/url',
  slowDown({
    windowMs: 30 * 1000, // 30 seconds
    delayAfter: 1, // allow 1 request per 30 seconds, then...
    delayMs: 500, // begin adding 500ms of delay per request above 1: 1*500ms, 2*500ms, 3*500ms, etc.
  }),
  rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 1, // start blocking after 1 request
    handler: (req, res) => {
      res.status(429).json({ message: 'Too Many Requests. Slow down! 🐌' })
    },
  }),
  async (req, res, next) => {
    let { slug, url } = req.body
    try {
      await schema.validate({
        slug,
        url,
      })
      // if (url.includes('cdg.sh')) {
      //   throw new Error('Stop it. 🛑');
      // }
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
        visits: 0,
        visitors: [],
        uniqueVisitors: 0,
      }
      const created = await urls.insert(newUrl)
      console.log('created', created)
      res.json(created)
    } catch (error) {
      next(error)
    }
  },
)

// url redirect & track visits
app.get('/:id', async (req, res) => {
  const { id: slug } = req.params
  // get IP address of visitor
  const visitorIP = ip.address()
  console.log('visitorIP', visitorIP)
  // get url from database
  const url = await urls.findOne({ slug })
  if (!url) {
    return res.status(404).sendFile(notFoundPath)
  }
  // check if IP address exists in visitors array
  const visitor = url.visitors.find((visitor) => visitor === visitorIP)
  console.log('visitor', visitor)
  const visitors = url.visitors
  console.log('visitors', visitors)
  // if visitor is not inside the array, push the IP address into the array
  if (!visitor) {
    visitors.push(visitorIP)
    await urls.update(
      { slug },
      {
        $set: { visitors },
      },
    )
    await urls.update(
      { slug },
      {
        $set: { uniqueVisitors: url.uniqueVisitors + 1 },
      },
    )
  }
  console.log('visitors now', visitors)

  try {
    if (url) {
      if (visitors.includes(visitorIP)) {
        console.log('IP address already exists')
        await urls.update(
          { slug },
          {
            $set: { visits: url.visits + 1 },
          },
        )
      }
      res.redirect(url.url)
    }
    return res.status(404).sendFile(notFoundPath)
    // another option:
    // res.redirect('/404') OR res.redirect(`/?error=${slug} not found`)
  } catch (error) {
    return res.status(404).sendFile(notFoundPath)
  }
})

// retrieve information about short url
app.get('/url/:id', async (req, res, next) => {
  const { id: slug } = req.params
  try {
    const url = await urls.findOne({ slug })
    if (url) {
      console.log('url', url)
      res.json(url)
    }
    return res.status(404).sendFile(notFoundPath)
  } catch (error) {
    next(error)
  }
})

// track visits
app.get('/url/:id/visits', async (req, res, next) => {
  const { id: slug } = req.params
  try {
    const url = await urls.findOne({ slug })
    if (url) {
      console.log('url', url)
      console.log('url.visits', url.visits)
      res.json(url.visits)
    }
    return res.status(404).sendFile(notFoundPath)
  } catch (error) {
    next(error)
  }
})

// track IP address of visitors
app.get('/url/:id/visitors', async (req, res, next) => {
  const { id: slug } = req.params
  try {
    const url = await urls.findOne({ slug })
    if (url) {
      res.json(url.visitors)
    }
    return res.status(404).sendFile(notFoundPath)
  } catch (error) {
    next(error)
  }
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
