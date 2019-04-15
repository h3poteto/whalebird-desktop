export type ThemeType = {
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

declare var LightTheme: ThemeType
declare var DarkTheme: ThemeType
declare var SolarizedLightTheme: ThemeType
declare var SolarizedDarkTheme: ThemeType
declare var KimbieDarkTheme: ThemeType

export { LightTheme, DarkTheme, SolarizedLightTheme, SolarizedDarkTheme, KimbieDarkTheme }
