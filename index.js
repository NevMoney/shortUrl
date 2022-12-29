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
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
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
  urls: yup.array().default([]),
})

// allow for /links page to be loaded without error
app.get('/links', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/links.html'))
})

// allow for admin page to be loaded without error
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'))
})

app.get('/user/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await users.findOne({ _id: id })
    res.json(user)
  } catch (error) {
    next(error)
  }
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
  // because we're storing the encrypted password, we need to compare the encrypted password to the password the user entered
  try {
    await userSchema.validate({
      email,
      password,
    })
    const user = await users.findOne({ email })
    if (!user) {
      res.status(404)
      throw new Error('User not found 🤷‍♂️')
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (user.password !== password && !isValid) {
      res.status(401)
      throw new Error('Invalid password 🤷‍♂️')
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// logout
app.post('/logout', async (req, res, next) => {
  const { id } = req.body
  try {
    const user = await users.findOne({ _id: id })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// if user is logged in, get their urls
app.get('/user/:id/urls', async (req, res, next) => {
  // id is the user id
  const { id } = req.params
  try {
    const user = await users.findOne({ _id: id })
    res.json(user.urls)
  } catch (error) {
    next(error)
  }
})

// get all users
app.get('/users', async (req, res, next) => {
  try {
    const items = await users.find({})
    res.json(items)
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
// create url even if not logged in or registered
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

// create url if user is logged in
app.post('/user/:id/url', async (req, res, next) => {
  const { id } = req.params
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
    // add url to user
    const user = await users.findOne({ _id: id })
    if (user) {
      const updated = await users.update(
        { _id: id },
        { $push: { urls: created } },
      )
      console.log('updated', updated)
    }
  } catch (error) {
    next(error)
  }
})

// update url - only if user is logged in
app.put('/user/:id/url/:slug', async (req, res, next) => {
  const { id, slug } = req.params
  try {
    // find user
    const user = await users.findOne({ _id: id })
    // find url
    const url = await urls.findOne({ slug })
    // verify that user owns url
    if (user.urls.includes(url._id)) {
      // update url
      const updated = await urls.update({ slug }, { $set: req.body })
      res.json(updated)
      console.log('updated', updated)
    } else {
      res.status(404)
      throw new Error('Not authorized. 🛑 Not your url. 🤷‍♂️')
    }
  } catch (error) {
    next(error)
  }
})

// delete url - only if user is logged in
app.delete('/user/:id/url/:slug', async (req, res, next) => {
  const { id, slug } = req.params
  try {
    const user = await users.findOne({ _id: id })
    const url = await urls.findOne({ slug })
    console.log('user.urls', user.urls)
    console.log('url._id', url._id)
    const toDelete = user.urls.find((url) => url._id === url._id)
    console.log('toDelete', toDelete)
    // delete url
    const deleted = await urls.remove({ slug })
    res.json(deleted)
    console.log('deleted', deleted)
    // remove url from user
    const updated = await users.update(
      { _id: id },
      { $pull: { urls: url._id } },
    )
    console.log('updated', updated)
  } catch (error) {
    next(error)
  }
})

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
