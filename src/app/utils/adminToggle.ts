let isAdmin = false

export function enableAdmin() {
  isAdmin = true
}

export function disableAdmin() {
  isAdmin = false
}

export function checkAdmin() {
  return isAdmin
}
