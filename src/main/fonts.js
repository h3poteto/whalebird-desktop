import SystemFonts from 'system-font-families'

const fonts = () => {
  const systemFonts = new SystemFonts()
  return systemFonts.getFonts()
    .then(res => {
      return Array.from(new Set(res)).sort()
    })
}

export default fonts
