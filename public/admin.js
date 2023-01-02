console.log('admin.js running')

// get all users
$('#usersBtn').click(async (e) => {
  e.preventDefault()
  console.log('fetching users')
  let userUrls
  const users = await fetch('/users')
  const data = await users.json()
  console.log('data', data)
  // data.forEach((user) => {
  //   if (user.urls === undefined || user.urls === null || user.urls === []) {
  //     userUrls = 0
  //   } else {
  //     userUrls = user.urls.length
  //   }
  //   console.log(`userurls ${user.email}`, userUrls)
  //   return userUrls
  // })
  $('#user-list').empty()
  $('#user-list').append(
    `<table class="table styled-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Number of Links</th>
          <th>User Id</th>
          <th>Admin?</th>
          <th>Actions</th>
        </tr>
      </thead>
      ${data.map(
        (user) => `
      <tbody>
      <tr>
        <td class="off-white" id="email${user._id}">${user.email}</td>
        <td class="off-white" id="links${user._id}">${user.urls.length}</td>
        <td class="off-white" >${user._id}</td>
        <td class="off-white" id="isAdmin${user._id}">${user.isAdmin}</td>
        <td class="actionButtons${user._id}">
          <button class="userActionBtn center" id="deleteBtn${user._id}" onClick="deleteUser('${user._id}')">Delete</button>
          <button class="userActionBtn center" id="updateBtn${user._id}" onClick="updateUser('${user._id}')">Update</button>
          <button class="userActionBtn center" id="userLinkBtn${user._id}" onClick="getUserLinks('${user._id}')">Get Links</button>
        </td>
      </tr>
      </tbody>
    `,
      )}
      </table>
    `,
  )
})

// get all links
$('#linksBtn').click(async (e) => {
  e.preventDefault()
  const links = await fetch('/urls')
  const data = await links.json()
  console.log('data', data)
  $('#link-list').empty()
  $('#link-list').append(
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
          <button class="userActionBtn center" onClick="deleteLink('${link.slug}')">Delete</button>
          <button class="userActionBtn center" onClick="updateLink('${link.slug}')">Update</button>
        </td>
      </tr>
      </tbody>
    `,
      )}
      </table>
    `,
  )
})

const getUserLinks = async (id) => {
  console.log(`getting links for user ${id}`)
  const links = await fetch(`/user/${id}/urls`)
  const data = await links.json()
  console.log('data', data)
  $('#user-list').empty()

  $(`#link-list`).empty()
  $(`#link-list`).append(
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
          <button class="userActionBtn center" onClick="deleteLink('${link.slug}')">Delete</button>
          <button class="userActionBtn center" onClick="updateLink('${link.slug}')">Update</button>
        </td>
      </tr>
      </tbody>
    `,
      )}
      </table>
    `,
  )
}

const deleteUser = async (id) => {
  console.log(`deleting user ${id}`)
  // verify that user is admin
  const admin = await isAdmin()
  if (admin) {
    let adminId = localStorage.getItem('userId')
    const response = await fetch(`admin/${adminId}/user/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('response', response)
    const data = await response.json()
    console.log('data', data)
    alert('User successfully deleted 🙌')
    // reload page
    location.reload()
  } else {
    alert('You are not authorized to perform this action')
  }
}

const deleteLink = async (slug) => {
  console.log(`deleting link ${slug}`)
  // verify that user is admin
  const admin = await isAdmin()
  if (admin) {
    let adminId = localStorage.getItem('userId')
    const response = await fetch(`user/${adminId}/url/${slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('response', response)
    if (response.status === 404) {
      alert('Link not found')
      return
    }
    if (response.ok) {
      const data = await response.json()
      console.log('data', data)
      alert('Link successfully deleted 🙌')
      // reload page
      location.reload()
    }
  } else {
    alert('You are not authorized to perform this action')
  }
}
