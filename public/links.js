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
    // append logout button to nav
    $('nav').append(`<button id="logout" class="linkBtn">Logout</button>`)

    // store token as cookie in browser for 1 day
    document.cookie = `token=${data.token}; max-age=86400`

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
    $('.error').append(`<p>Ooops! Something went wrong! ${data.message}</p>`)
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
  }
})

// when create account button clicked
$('#create-account').click((e) => {
  e.preventDefault()
  registerStart.classList.add('hidden')
  loginForm.classList.add('hidden')

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
      //show user all their links
      const links = document.getElementById('url-list')
      links.innerHTML = `
            <h2>My Links</h2>
            <ul>
                ${data.links
                  .map(
                    (link) =>
                      `<li><a href="${link.slug}" target="_blank">${window.location.origin}/${link.slug}</a></li>`,
                  )
                  .join('')}
            </ul>
        `
    }
  })
})

// function to create links as a logged in user
const createLinks = async () => {
  console.log('create clicked')
  // clear the url-list div
  $('.url-list').empty()
  $('.button-list').empty()
  // append a form to the url-list div
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

const viewLinks = async () => {
  console.log('view clicked')
  // clear the url-list div
  $('.url-list').empty()
  // send a get request to the server : /user/:id/urls
  const response = await fetch(`/user/${userId}/urls`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const data = await response.json()
    console.log('data', data)

    $('.url-list').empty()
    $('.url-list').removeClass('hidden')
    // create a table to display the links, urls, slugs, clicks, and unique visitors and a delete and update button for each item then append it to the url-list div
    // table already has a header, just need to add the rows
    $('.url-list').append(
      `<table class="table styled-table">
      <thead>
        <tr>
          <th>Short Url</th>
          <th>Original Url</th>
          <th>Slug</th>
          <th>Clicks</th>
          <th>Unique Visitors</th>
          <th>Actions</th>
        </tr>
      </thead>

        ${data.map(
          (link) => `
          <tbody>
          <tr>
            <td><a href="${link.slug}" target="_blank">${window.location.origin}/${link.slug}</a></td>
            <td><a href="${link.url}" target="_blank">${link.url}</td>
            <td class="off-white">${link.slug}</td>
            <td class="off-white">${link.visits}</td>
            <td class="off-white">${link.uniqueVisitors}</td>
            <td>
              <button class="userActionBtn center"  onClick="deleteLink('${link.slug}')">Delete</button>
              <button class="userActionBtn center"  onClick="updateLink('${link.slug}')">Update</button>
            </td>
          </tr>
          </tbody>
        `,
        )}
      </table>`,
    )
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
