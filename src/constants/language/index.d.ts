export type LanguageType = {
  name: string
  key: string
}

export type LanguageList = {
  de: LanguageType
  en: LanguageType
  fr: LanguageType
  ja: LanguageType
  ko: LanguageType
  pl: LanguageType
  it: LanguageType
  zh_cn: LanguageType
  zh_tw: LanguageType
  cs: LanguageType
  es_es: LanguageType
  no: LanguageType
  pt_pt: LanguageType
  ru: LanguageType
  si: LanguageType
  sv_se: LanguageType
  tzm: LanguageType
}

declare let l: LanguageList

export default l
