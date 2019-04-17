import { ThemeColorType } from '~/src/constants/themeColor'

export type Appearance = {
  theme: string,
  fontSize: number,
  displayNameStyle: number,
  timeFormat: number,
  customThemeColor: ThemeColorType,
  font: string
}
