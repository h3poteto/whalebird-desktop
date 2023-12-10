export const data = async () => {
  const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')

  return response.json()
}
