// check if user is admin
const isAdmin = async () => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    const response = await fetch(`/user/${userId}`)
    const data = await response.json()
    if (data.isAdmin) {
      $('.adminLink').removeClass('hidden')
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

isAdmin()

const isLoggedIn = async () => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    $('.linkBtn').removeClass('hidden')
    return true
  } else {
    return false
  }
}

isLoggedIn()
