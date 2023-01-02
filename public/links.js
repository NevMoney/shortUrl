console.log('links.js running')
let userId

// when start button clicked show login form
$('#startBtn').click(() => {
  $('#login-form').removeClass('hidden')
  $('#startBtn').addClass('hidden')
})

// when login button clicked
$('#login-form').submit(async (e) => {
  e.preventDefault()
  const email = $('#login-email').val()
  const password = $('#login-password').val()
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
  if (response.ok) {
    const data = await response.json()
    console.log('data', data)
    $('.error').empty()
    $('.error').addClass('hidden')

    // store user id in local storage
    userId = data._id
    localStorage.setItem('userId', data._id)

    // hide login form
    $('#login-form').addClass('hidden')
    // take first part of the email
    let greetingName = data.user.email.split('@')[0]
    // capitalize first letter
    greetingName = greetingName.charAt(0).toUpperCase() + greetingName.slice(1)
    // eliminate h2
    $('h2').remove()
    // change <h1> text
    $('h1').text(`Welcome, ${greetingName}!`)

    // change <p> text
    $('p').text(
      'Now you can create your own short links and view data about them',
    )

    // in the url-list div, create view and create buttons
    $('.button-list').append(
      `<button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
      <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>
      `,
    )

    // store token as cookie in browser for 1 day
    document.cookie = `token=${data.token}; max-age=86400`
    // set token in local storage
    localStorage.setItem('userId', data.user._id)

    // if the user is admin, show admin link
    if (data.user.isAdmin) {
      $('.adminLink').removeClass('hidden')
    }
  } else {
    const data = await response.json()
    console.log('data', data)
    $('.error').empty()
    $('.error').removeClass('hidden')
    // show error message
    $('.error').append(`<p>Ooops! ${data.message}</p>`)
  }
})

// logout user
$('nav').on('click', '#logout', async (e) => {
  e.preventDefault()
  const response = await fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    console.log('response worked')
    const data = await response.json()
    console.log('data', data)
    // change logout button to login button
    $('#logout').remove()
    // clear the url-list div
    $('.url-list').empty()
    $('.button-list').empty()
    // change <h1> text
    $('h1').text('Welcome to Shorten!')
    // change <p> text
    $('p').text(
      'Whether you have one or one thousand links, having proper management and information is the key to success. Here you can view all of your links and their information. Create an account or login to get started',
    )
    // show start button
    $('#startBtn').removeClass('hidden')

    // remove token cookie
    document.cookie
      .split(';')
      .forEach(
        (c) =>
          (document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)),
      )

    // remove user id from local storage
    localStorage.removeItem('userId')

    // remove admin link
    $('.adminLink').addClass('hidden')
  }
})

// when create account button clicked
$('#create-account').click((e) => {
  e.preventDefault()
  $('#login-form').addClass('hidden')

  // create a form for registering
  const register = document.getElementById('register')
  const registerForm = document.createElement('form')
  registerForm.classList.add('register-form')
  registerForm.setAttribute('action', '/register')
  registerForm.setAttribute('method', 'POST')
  registerForm.innerHTML = `
        <input class="input" type="email" name="email" id="email" placeholder="your email" required>
        <br/>
        <input class="input" type="password" name="password" id="password" placeholder="password" required>
        <br/>
        <button class="create" type="submit">Register</button>
    `
  register.appendChild(registerForm)

  $('.register-form').submit(async (e) => {
    e.preventDefault()
    const email = $('#email').val()
    const password = $('#password').val()
    console.log('email', email, 'password', password)
  })

  // add event listener to the form
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    console.log('email', email, 'password', password)
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
    if (response.ok) {
      console.log('response worked')
      const data = await response.json()
      console.log('data', data)
      // hide register form
      registerForm.classList.add('hidden')
      // take first part of the email
      let greetingName = data.user.email.split('@')[0]
      // capitalize first letter
      greetingName =
        greetingName.charAt(0).toUpperCase() + greetingName.slice(1)
      // eliminate h2
      $('h2').remove()
      // change <h1> text
      $('h1').text(`Welcome, ${greetingName}!`)

      // change <p> text
      $('p').text(
        'Now you can create your own short links and view data about them',
      )

      // in the url-list div, create view and create buttons
      $('.button-list').append(
        `<button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
      <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>
      `,
      )

      // store token as cookie in browser for 1 day
      document.cookie = `token=${data.token}; max-age=86400`
      // store user id in local storage
      localStorage.setItem('userId', data.user._id)

      // if the user is admin, show admin link
      if (data.user.isAdmin) {
        $('.adminLink').removeClass('hidden')
      }
    }
  })
})

// function to create links as a logged in user
const createLinks = async () => {
  console.log('create clicked')

  $('.custom-url').removeClass('hidden')

  let checkBox = showCustom()
}

const showCustom = () => {
  if ($('#checkBox').is(':checked')) {
    console.log('checked')
    $('#custom-url').show()
    // clear the url-list div
    $('.url-list').empty()
    $('.button-list').empty()
    // append an input form and optional custom base url input to the url-list div
    $('.url-list').append(
      `<form id="create-link-form" class="create-link-form">
      <input class="input" type="url" name="url" id="user-baseUrl" placeholder="Custom base" required>
      <br/>
      <input class="input" type="url" name="url" id="user-url" placeholder="your url" required>
      <br/>
      <input class="input" type="text" name="slug" id="user-slug" placeholder="slug" required>
      <br/>
      <button class="create" type="button" onClick="customShrink()">Create</button>
    </form>`,
    )
  } else {
    console.log('not checked')
    $('#custom-url').hide()
    // clear the url-list div
    $('.url-list').empty()
    $('.button-list').empty()
    // append an input form and optional custom base url input to the url-list div
    $('.url-list').append(
      `<form id="create-link-form" class="create-link-form">
      <input class="input" type="url" name="url" id="user-url" placeholder="your url" required>
      <br/>
      <input class="input" type="text" name="slug" id="user-slug" placeholder="slug" required>
      <br/>
      <button class="create" type="button" onClick="shrinkTheLink()">Create</button>
    </form>`,
    )
  }
}

// actual function pushing the link to the server/DB
const shrinkTheLink = async () => {
  console.log('shrink clicked')
  // get the url input
  const url = $('#user-url').val()
  // get the slug input
  const slug = $('#user-slug').val()
  console.log('url', url, 'slug', slug, 'userId', userId)
  // send a post request to the server
  const response = await fetch(`/user/${userId}/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      slug: slug || undefined,
    }),
  })
  if (response.ok) {
    console.log('response worked')
    const data = await response.json()
    console.log('data', data)
    // show user all their links
    $('.url-list').empty()
    $('p').remove()
    $('.url-list').append(
      `<p class="off-white mg-2-2">Your New Link:</p>
      <p><a href="${data.slug}" class="newUrl" target="_blank">${window.location.origin}/${data.slug}</a></p>
      
      <p class="off-white mg-2-2">What else do you want to do now?</p>
      <button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
      <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>`,
    )
  }
}

const customShrink = async () => {
  console.log('shrink clicked')
  // get the url input
  const url = $('#user-url').val()
  // get the slug input
  const slug = $('#user-slug').val()
  // get the custom base url input
  let customUrl = $('#user-baseUrl').val()

  // if the user doesn't enter http:// or https://, add it
  if (!customUrl.includes('http://') && !customUrl.includes('https://')) {
    customUrl = 'http://' + customUrl
  }

  // get userId
  const userId = localStorage.getItem('userId')
  console.log('customUrl', customUrl)
  console.log('url', url, 'slug', slug, 'userId', userId)
  // send a post request to the server; node uses app.post('/user/:id/customUrl', ...)
  const response = await fetch(`/user/${userId}/customUrl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      slug: slug || undefined,
      baseUrl: customUrl,
    }),
  })
  if (response.ok) {
    console.log('response worked')
    const data = await response.json()
    console.log('data', data)
    // show user all their links
    $('.url-list').empty()
    $('p').remove()
    $('.url-list').append(
      `<p class="off-white mg-2-2">Your New Link:</p>
      <p><a href="${data.slug}" class="newUrl" target="_blank">${data.baseUrl}/${data.slug}</a></p>

      <p class="off-white mg-2-2">What else do you want to do now?</p>
      <button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
      <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>`,
    )
  }
}

const viewLinks = async () => {
  // clear the url-list div
  $('.url-list').empty()
  userId = localStorage.getItem('userId')
  const response = await fetch(`/user/${userId}/urls`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const data = await response.json()

    // if no links
    if (data.length === 0) {
      $('.url-list').append(
        `<p class="off-white mg-2-2">You have no links yet. 👆 Create some! 👆</p>`,
      )
      $('#view-links').hide()
    } else if (data.createdAt === undefined) {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
          <thead>
            <tr>
              <th>Short Url</th>
              <th>Original Url</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>

        ${data.map(
          (link) => `
          <tbody>
          <tr>
            <td><a href="${link.slug}" target="_blank">${
            window.location.origin
          }/${link.slug}</a></td>
            <td><a href="${link.url}" target="_blank">${link.url.slice(
            0,
            30,
          )}</td>
            <td class="off-white">${link.slug}</td>
            <td>
              <button class="userActionBtn center"  onClick="deleteLink('${
                link.slug
              }')">Delete</button>
              <button class="userActionBtn center"  onClick="updateLink('${
                link.slug
              }')">Update</button>
              <button class="userActionBtn center"  onClick="viewStats('${
                link.slug
              }')">Stats</button>
            </td>
          </tr>
          </tbody>
        `,
        )}
      </table>`,
      )
    } else {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
          <thead>
            <tr>
              <th>Short Url</th>
              <th>Original Url</th>
              <th>Slug</th>
              <th>Clicks</th>
              <th>Unique Visitors</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

        ${data.map(
          (link) => `
          <tbody>
          <tr>
            <td><a href="${link.slug}" target="_blank">${
            window.location.origin
          }/${link.slug}</a></td>
            <td><a href="${link.url}" target="_blank">${link.url.slice(
            0,
            30,
          )}</td>
            <td class="off-white">${link.slug}</td>
            <td class="off-white">${link.visits}</td>
            <td class="off-white">${link.uniqueVisitors}</td>
            <td class="off-white">${link.createdAt.slice(0, 10)}</td>
            <td>
              <button class="userActionBtn center"  onClick="deleteLink('${
                link.slug
              }')">Delete</button>
              <button class="userActionBtn center"  onClick="updateLink('${
                link.slug
              }')">Update</button>
            </td>
          </tr>
          </tbody>
        `,
        )}
      </table>`,
      )
    }
  }
}

const deleteLink = async (slug) => {
  console.log('delete clicked')
  // send a delete request to the server : /user/:id/url/:slug
  const response = await fetch(`/user/${userId}/url/${slug}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    console.log('response worked')
    const data = await response.json()
    console.log('data', data)
    // show user all their links
    alert(`Link ${slug} deleted. ${data.message}`)
    viewLinks()
  }
}

const updateLink = async (slug) => {
  console.log('update clicked')
}

const getUrlVisits = async (slug) => {
  const response = await fetch(`/url/${slug}/visits`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const data = await response.json()
    console.log('data', data)
    return data
  } else {
    console.log(`Error: ${response.status} ${response.statusText}`)
  }
}

const getUrlInfo = async (slug) => {
  const response = await fetch(`/url/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const data = await response.json()
    console.log('data', data)
    return data
  } else {
    console.log(`Error: ${response.status} ${response.statusText}`)
  }
}

const viewStats = async (slug) => {
  console.log('view stats clicked')
  const info = await getUrlInfo(slug)
  const userId = localStorage.getItem('userId')

  let originalLink = info.url
  if (originalLink.length > 30) {
    originalLink = originalLink.slice(0, 30) + '...'
  }

  const paidUser = await payingCustomer(userId)
  console.log('paidUser', paidUser)

  if (paidUser) {
    if (info.createdAt == undefined || info.createdAt == null) {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
      <thead>
        <tr>
          <th>Short Url</th>
          <th>Original Url</th>
          <th>Slug</th>
          <th>Clicks</th>
          <th>Unique Visitors</th>
          <th>Visitor Locations</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a href="${slug}" target="_blank">${window.location.origin}/${slug}</a></td>
          <td><a href="${info.url}" target="_blank">${originalLink}</td>
          <td class="off-white">${slug}</td>
          <td class="off-white">${info.visits}</td>
          <td class="off-white">${info.uniqueVisitors}</td>
          <td class="off-white">${info.visitors}</td>
          <td>
            <button class="userActionBtn center"  onClick="deleteLink('${slug}')">Delete</button>
            <button class="userActionBtn center"  onClick="updateLink('${slug}')">Update</button>
          </tr>
        </tbody>
      </table>`,
      )
    } else {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
      <thead>
        <tr>
          <th>Short Url</th>
          <th>Original Url</th>
          <th>Slug</th>
          <th>Clicks</th>
          <th>Unique Visitors</th>
          <th>Visitor Locations</th>
          <th>Created On</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a href="${slug}" target="_blank">${
          window.location.origin
        }/${slug}</a></td>
          <td><a href="${info.url}" target="_blank">${originalLink}</td>
          <td class="off-white">${slug}</td>
          <td class="off-white">${info.visits}</td>
          <td class="off-white">${info.uniqueVisitors}</td>
            <td class="off-white">${info.visitors}</td>
          <td class="off-white">${info.createdAt.slice(0, 10)}</td>
          <td>
            <button class="userActionBtn center"  onClick="deleteLink('${slug}')">Delete</button>
            <button class="userActionBtn center"  onClick="updateLink('${slug}')">Update</button>
          </tr>
        </tbody>
      </table>`,
      )
    }
  } else {
    if (info.createdAt == undefined || info.createdAt == null) {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
        <thead>
          <tr>
            <th>Short Url</th>
            <th>Original Url</th>
            <th>Slug</th>
            <th>Clicks</th>
            <th>Unique Visitors</th>
            <th>Visitor Locations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><a href="${slug}" target="_blank">${window.location.origin}/${slug}</a></td>
            <td><a href="${info.url}" target="_blank">${originalLink}</td>
            <td class="off-white">${slug}</td>
            <td class="off-white">${info.visits}</td>
            <td class="off-white">${info.uniqueVisitors}</td>
            <td>
              <button class="userActionBtn center"  onClick="subscribe('${userId}')">Subscribe</button>
            </td>
            <td>
              <button class="userActionBtn center"  onClick="deleteLink('${slug}')">Delete</button>
              <button class="userActionBtn center"  onClick="updateLink('${slug}')">Update</button>
            </tr>
          </tbody>
        </table>`,
      )
    } else {
      $('.url-list').empty()
      $('.url-list').removeClass('hidden')
      $('.url-list').append(
        `<table class="table styled-table">
        <thead>
          <tr>
            <th>Short Url</th>
            <th>Original Url</th>
            <th>Slug</th>
            <th>Clicks</th>
            <th>Unique Visitors</th>
            <th>Visitor Locations</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><a href="${slug}" target="_blank">${
          window.location.origin
        }/${slug}</a></td>
            <td><a href="${info.url}" target="_blank">${originalLink}</td>
            <td class="off-white">${slug}</td>
            <td class="off-white">${info.visits}</td>
            <td class="off-white">${info.uniqueVisitors}</td>
            <td>
              <button class="userActionBtn center"  onClick="subscribe('${userId}')">Subscribe</button>
            </td>
            <td class="off-white">${info.createdAt.slice(0, 10)}</td>
            <td>
              <button class="userActionBtn center"  onClick="deleteLink('${slug}')">Delete</button>
              <button class="userActionBtn center"  onClick="updateLink('${slug}')">Update</button>
            </tr>
          </tbody>
        </table>`,
      )
    }
  }
}

const viewCustomLinks = async () => {
  // get cookie
  const cookie = document.cookie || ''
  console.log('cookie', cookie)
  let userId = localStorage.getItem('userId')
  if (cookie || userId) {
    // fetch the user's links user/:id/customUrls',
    const userLinks = await fetch(`/user/${userId}/customUrls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const links = await userLinks.json()
    console.log('links', links)
    if (links.length == 0) {
      console.log('no links')
      return
    } else {
      links.forEach((link) => {
        const slug = link.slug
        const info = link.info
        const originalLink = link.originalLink
        const createdAt = link.createdAt
        const userId = link.userId
        return displayCustomLinks(slug, info, originalLink, createdAt, userId)
      })
    }
  }
}

const displayCustomLinks = async (
  slug,
  info,
  originalLink,
  createdAt,
  userId,
) => {
  console.log('displaying custom links')
}

const payingCustomer = async (userId) => {
  // get information from stripe about the user

  // for now:
  return false
}

const subscribe = async (userId) => {
  // send them to stripe to subscribe
}

const loggedInDisplay = async () => {
  // get cookie
  const cookie = document.cookie || ''
  console.log('cookie', cookie)

  const userId = localStorage.getItem('userId')

  if (cookie || userId) {
    // hide the login button
    $('#startBtn').addClass('hidden')

    // fetch the user's links
    const user = await fetch(`/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!isAdmin) {
      $('#admin').addClass('hidden')
    }

    if (user.ok) {
      const data = await user.json()
      console.log('data', data)

      // if user is logged in, show the user their links
      if (data.user) {
        let greetingName = data.user.email.split('@')[0]
        greetingName =
          greetingName.charAt(0).toUpperCase() + greetingName.slice(1)

        $('h2').remove()
        $('h1').text(`Welcome, ${greetingName}!`)
        $('p').text(
          'Now you can create your own short links and view data about them',
        )

        // in the url-list div, create view and create buttons
        $('.button-list').append(
          `<button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
          <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>
         `,
        )
      } else if (data.email) {
        let greetingName = data.email.split('@')[0]
        greetingName =
          greetingName.charAt(0).toUpperCase() + greetingName.slice(1)

        $('h2').remove()
        $('h1').text(`Welcome, ${greetingName}!`)
        $('p').text(
          'Now you can create your own short links and view data about them',
        )

        // in the url-list div, create view and create buttons
        $('.button-list').append(
          `<button id="crate-links" onclick="createLinks()" class="create">Create Links</button>
          <button id="view-links" onclick="viewLinks()" class="create">View My Links</button>
         `,
        )
      }
    }
  } else {
    console.log('user is not logged in')
  }
}

loggedInDisplay()
