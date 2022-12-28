console.log('links.js running')
const loginStart = document.getElementById('login-start')
const loginForm = document.getElementById('login-form')
const registerStart = document.getElementById('create-account')

loginStart.addEventListener('click', () => {
  loginForm.classList.remove('hidden')
  loginStart.classList.add('hidden')
})

registerStart.addEventListener('click', (e) => {
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
