console.log('admin.js running')

$('#usersBtn').click(async (e) => {
  e.preventDefault()
  const users = await fetch('/users')
  const data = await users.json()
  console.log('data', data)
  data.forEach((user) => {
    if (user.urls === undefined) {
      $('#user-list').append(`
      <table class="styled-table">
      <tbody>
        <tr>
          <td>${user.email}</td>
          <td>0</td>
          <td>${user._id}</td>
        </tr>
        </tbody>
      </table>
      `)
    } else {
      $('#user-list').append(`
      <table class="styled-table">
      <tbody>
        <tr>
          <td>${user.email}</td>
          <td>${user.urls.length}</td>
          <td>${user._id}</td>
        </tr>
        </tbody>
      </table>
      `)
    }
  })
})

$('#linksBtn').click(async (e) => {
  e.preventDefault()
  const links = await fetch('/urls')
  const data = await links.json()
  console.log('data', data)
  data.forEach((link) => {
    $('#link-list').append(`
    <table class="styled-table">
      <tr>
        <td>${link.url}</td>
        <td>${link.slug}</td>
        <td>${link._id}</td> 
      </tr>
    </table>
    `)
  })
})
