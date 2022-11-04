export type LanguageType = {
  name: string
  key: string
  rfc4646: string
}

export type LanguageList = {
  de: LanguageType
  en: LanguageType
  fr: LanguageType
  gd: LanguageType
  ja: LanguageType
  ko: LanguageType
  pl: LanguageType
  id: LanguageType
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
  fa: LanguageType
}

const languageList: LanguageList = {
  de: {
    name: 'Deutsch',
    key: 'de',
    rfc4646: 'de'
  },
  en: {
    name: 'English',
    key: 'en',
    rfc4646: 'en-US'
  },
  fa: {
    name: 'Persian',
    key: 'fa',
    rfc4646: 'fa'
  },
  fr: {
    name: 'Français',
    key: 'fr',
    rfc4646: 'fr'
  },
  gd: {
    name: 'Gàidhlig',
    key: 'gd',
    rfc4646: 'gd'
  },
  ja: {
    name: '日本語',
    key: 'ja',
    rfc4646: 'ja-JP'
  },
  ko: {
    name: '한국어',
    key: 'ko',
    rfc4646: 'ko'
  },
  pl: {
    name: 'Polski',
    key: 'pl',
    rfc4646: 'pl'
  },
  id: {
    name: 'Indonesian',
    key: 'id',
    rfc4646: 'id'
  },
  it: {
    name: 'Italiano',
    key: 'it',
    rfc4646: 'it'
  },
  zh_cn: {
    name: '简体中文',
    key: 'zh_cn',
    rfc4646: 'zh-CN'
  },
  zh_tw: {
    name: '繁體中文',
    key: 'zh_tw',
    rfc4646: 'zh-TW'
  },
  cs: {
    name: 'čeština',
    key: 'cs',
    rfc4646: 'cs'
  },
  es_es: {
    name: 'Español',
    key: 'es_es',
    rfc4646: 'es-ES'
  },
  no: {
    name: 'norsk',
    key: 'no',
    rfc4646: 'no'
  },
  pt_pt: {
    name: 'Português',
    key: 'pt_pt',
    rfc4646: 'pt-PT'
  },
  ru: {
    name: 'русский',
    key: 'ru',
    rfc4646: 'ru'
  },
  si: {
    name: 'සිංහල',
    key: 'si',
    rfc4646: 'si'
  },
  sv_se: {
    name: 'svenska',
    key: 'sv_se',
    rfc4646: 'sv-SE'
  },
  tzm: {
    name: 'Tamaziɣt',
    key: 'tzm',
    rfc4646: 'tzm'
  }
}

export default languageList
