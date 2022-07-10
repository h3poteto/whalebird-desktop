export type ThemeType = {
  name: string
  key: string
}

export type ThemeList = {
  System: ThemeType
  Light: ThemeType
  Dark: ThemeType
  SolarizedLight: ThemeType
  SolarizedDark: ThemeType
  KimbieDark: ThemeType
  Custom: ThemeType
}

const themeList: ThemeList = {
  System: {
    name: 'preferences.appearance.theme.system',
    key: 'system'
  },
  Light: {
    name: 'preferences.appearance.theme.light',
    key: 'light'
  },
  Dark: {
    name: 'preferences.appearance.theme.dark',
    key: 'dark'
  },
  SolarizedLight: {
    name: 'preferences.appearance.theme.solarized_light',
    key: 'solarized_light'
  },
  SolarizedDark: {
    name: 'preferences.appearance.theme.solarized_dark',
    key: 'solarized_dark'
  },
  KimbieDark: {
    name: 'preferences.appearance.theme.kimbie_dark',
    key: 'kimbie_dark'
  },
  Custom: {
    name: 'preferences.appearance.theme.custom',
    key: 'custom'
  }
}

export default themeList
