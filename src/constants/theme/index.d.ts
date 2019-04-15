export type ThemeType = {
  name: string,
  key: string
}

export type ThemeList = {
  Light: ThemeType,
  Dark: ThemeType,
  SolarizedLight: ThemeType,
  SolarizedDark: ThemeType,
  KimbieDark: ThemeType,
  Custom: ThemeType
}

declare var t: ThemeList

export default t
