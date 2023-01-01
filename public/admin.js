console.log('admin.js running')

// first we need to verify that user has admin privileges, which we can check from isAdmin property in the user object
const isAdmin = async () => {
  const response = await fetch('/users')
  const data = await response.json()
  console.log('data', data)
  const user = data.find((user) => user._id === localStorage.getItem('userId'))
  console.log('user', user)
  if (user.isAdmin === true) {
    console.log('user is admin')
    return true
  } else {
    console.log('user is not admin')
    return false
  }
}

isAdmin()

$('#usersBtn').click(async (e) => {
  e.preventDefault()
  console.log('fetching users')
  let userUrls
  const users = await fetch('/users')
  const data = await users.json()
  console.log('data', data)
  data.forEach((user) => {
    if (user.urls === undefined || user.urls === null || user.urls === []) {
      userUrls = 0
    } else {
      userUrls = user.urls.length
    }
    console.log(`userurls ${user.email}`, userUrls)
    return userUrls
  })
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
        <td class="off-white">${user.email}</td>
        <td class="off-white">${userUrls}</td>
        <td class="off-white">${user._id}</td>
        <td class="off-white">${user.isAdmin}</td>
        <td>
          <button class="userActionBtn center" onClick="deleteUser('${user._id}')">Delete</button>
          <button class="userActionBtn center" onClick="updateUser('${user._id}')">Update</button>
        </td>
      </tr>
      </tbody>
    `,
      )}
      </table>
    `,
  )
})

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

const deleteUser = async (id) => {
  console.log(`deleting user ${id}`)
  // verify that user is admin
  const admin = await isAdmin()
  if (admin) {
    // node uses app.delete('/admin/:requesterId/user/:id', async (req, res, next) => {
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

const updateUser = async (id) => {
  console.log('updating user')
  const response = await fetch(`/users/${id}`, {
    method: 'PUT',
  })
  const data = await response.json()
  console.log('data', data)
  location.reload()
}
