let items = []

export function getCartItems() {
  return items
}

export function addToCart(item) {
  items = [...items, item]
  return items
}

export function clearCart() {
  items = []
  return items
}
