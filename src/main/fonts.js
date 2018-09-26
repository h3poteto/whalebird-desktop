import fontManager from 'font-manager'

const fonts = () => {
  return new Promise((resolve, reject) => {
    fontManager.getAvailableFonts((fonts) => {
      const families = fonts.map(f => {
        return f.family
      })
      resolve(Array.from(new Set(families)).sort())
    })
  })
}

export default fonts
