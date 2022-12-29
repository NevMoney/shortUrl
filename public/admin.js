console.log('admin.js running')

$('#usersBtn').click(async (e) => {
  e.preventDefault()
  console.log('fetching users')
  const users = await fetch('/users')
  const data = await users.json()
  console.log('data', data)
  // data.forEach((user) => {
  //   if (user.urls === undefined) {
  //     $('#user-list').append(`
  //     <table class="styled-table">
  //     <tbody>
  //       <tr>
  //         <td>${user.email}</td>
  //         <td>0</td>
  //         <td>${user._id}</td>
  //       </tr>
  //       </tbody>
  //     </table>
  //     `)
  //   } else {
  //     $('#user-list').append(`
  //     <table class="styled-table">
  //     <tbody>
  //       <tr>
  //         <td>${user.email}</td>
  //         <td>${user.urls.length}</td>
  //         <td>${user._id}</td>
  //       </tr>
  //       </tbody>
  //     </table>
  //     `)
  //   }
  // })
  $('#user-list').empty()
  $('#user-list').append(
    `<table class="table styled-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Number of Links</th>
          <th>User Id</th>
          <th>Actions</th>
        </tr>
      </thead>
      ${data.map(
        (user) => `
      <tbody>
      <tr>
        <td class="off-white">${user.email}</td>
        <td class="off-white">${user.urls.length}</td>
        <td class="off-white">${user._id}</td>
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
