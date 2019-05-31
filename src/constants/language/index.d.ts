export type LanguageType = {
  name: string
  key: string
}

export type LanguageList = {
  de: LanguageType,
  en: LanguageType,
  fr: LanguageType,
  ja: LanguageType,
  ko: LanguageType,
  pl: LanguageType,
  it: LanguageType
}

declare var l: LanguageList

export default l
