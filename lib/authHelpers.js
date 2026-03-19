export function getUserRole(user) {
  return user?.role || 'student'
}

export function isAuthenticated(user) {
  return Boolean(user)
}
