export function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'orange'
    case 'accepted':
      return 'blue'
    case 'ready':
      return 'green'
    case 'completed':
      return 'gray'
    case 'rejected':
      return 'red'
    default:
      return 'black'
  }
}
