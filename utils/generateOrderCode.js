export const generateOrderCode = () => {
  return 'GD' + Math.floor(1000 + Math.random() * 9000)
}
