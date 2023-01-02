console.log('app.js running')
const button = document.getElementById('shrinkBtn')
button.addEventListener('click', createUrl)

const url = document.getElementById('url')
const slug = document.getElementById('slug')
const newUrl = document.getElementById('newUrl')
const error = document.getElementById('error')

async function createUrl(e) {
  e.preventDefault()
  const urlValue = url.value
  const slugValue = slug.value
  console.log('clicked', urlValue, slugValue)

  const loggedIn = isLoggedIn()
  const userId = localStorage.getItem('userId')

  if (!loggedIn) {
    // send this data to the server
    const response = await fetch('/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlValue,
        slug: slugValue || undefined,
      }),
    })
    if (response.ok) {
      console.log('response worked')
      const data = await response.json()
      console.log('data', data)
      // append new url to the page to open in a new tab
      newUrl.innerHTML = `<p><a href="${data.slug}" target="_blank">${window.location.origin}/${data.slug}</a></p>`
    } else {
      const data = await response.json()
      //   first remove .hidden class
      error.classList.remove('hidden')
      //   then add the error message
      error.innerHTML = `<p>${data.message}</p>`
    }
  } else {
    const response = await fetch(`/user/${userId}/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlValue,
        slug: slugValue || undefined,
      }),
    })
    if (response.ok) {
      console.log('response worked')
      const data = await response.json()
      console.log('data', data)
      // append new url to the page to open in a new tab
      newUrl.innerHTML = `<p><a href="${data.slug}" target="_blank">${window.location.origin}/${data.slug}</a></p>`
    } else {
      const data = await response.json()
      //   first remove .hidden class
      error.classList.remove('hidden')
      //   then add the error message
      error.innerHTML = `<p>${data.message}</p>`
    }
  }
}
