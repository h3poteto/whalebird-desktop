import SystemFonts from 'system-font-families'

const fonts = async (): Promise<Array<string>> => {
  const systemFonts = new SystemFonts()
  return systemFonts.getFonts()
    .then((res: string) => {
      return Array.from(new Set(res)).sort()
    })
}

export default fonts
