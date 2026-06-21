export function getChurchId(request) {
  const churchId = request.headers.get('x-church-id')
  if (!churchId) return null
  return churchId
}