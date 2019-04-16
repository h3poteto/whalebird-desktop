export type ThemeColorType = {
  background_color: string,
  selected_background_color: string,
  global_header_color: string,
  side_menu_color: string,
  primary_color: string,
  regular_color: string,
  secondary_color: string,
  border_color: string,
  header_menu_color: string,
  wrapper_mask_color: string
}

declare var LightTheme: ThemeColorType
declare var DarkTheme: ThemeColorType
declare var SolarizedLightTheme: ThemeColorType
declare var SolarizedDarkTheme: ThemeColorType
declare var KimbieDarkTheme: ThemeColorType

export { LightTheme, DarkTheme, SolarizedLightTheme, SolarizedDarkTheme, KimbieDarkTheme }
