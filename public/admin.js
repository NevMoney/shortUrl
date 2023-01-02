console.log('admin.js running')

// first we need to verify that user has admin privileges, which we can check from isAdmin property in the user object
const isAdmin = async () => {
  const userId = localStorage.getItem('userId')
  const response = await fetch(`/user/${userId}`)
  const data = await response.json()
  console.log('data', data)
  if (data.isAdmin) {
    return true
  } else {
    return false
  }
}

isAdmin()

// get all users
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
        <td class="off-white" id="email${user._id}">${user.email}</td>
        <td class="off-white" id="links${user._id}">${userUrls}</td>
        <td class="off-white" >${user._id}</td>
        <td class="off-white" id="isAdmin${user._id}">${user.isAdmin}</td>
        <td class="actionButtons${user._id}">
          <button class="userActionBtn center" id="deleteBtn${user._id}" onClick="deleteUser('${user._id}')">Delete</button>
          <button class="userActionBtn center" id="updateBtn${user._id}" onClick="updateUser('${user._id}')">Update</button>
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

// HAS A BUG - NOT UPDATING USER, EVEN THOUGH IT SAYS IT IS :(
const updateUser = async (id) => {
  console.log('updating user')
  const admin = await isAdmin()
  let fieldName = prompt('Enter field name to update')
  let updateValue = prompt('Enter new value')
  // if user clicks cancel, return
  if (fieldName == null) {
    return
  }
  if (updateValue == null) {
    return
  }
  if (admin) {
    try {
      let adminId = localStorage.getItem('userId')
      const response = await fetch(`admin/${adminId}/user/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldName,
          updateValue,
        }),
      })
      console.log('response', response)
      const data = await response.json()
      console.log('data', data)
    } catch (error) {
      console.log('error', error)
    }
  } else {
    alert('You are not authorized to perform this action')
  }
}
