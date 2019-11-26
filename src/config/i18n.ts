import i18next, { InitOptions } from 'i18next'
import cs from '~/src/config/locales/cs/translation.json'
import de from '~/src/config/locales/de/translation.json'
import en from '~/src/config/locales/en/translation.json'
import es_es from '~/src/config/locales/es_es/translation.json'
import fr from '~/src/config/locales/fr/translation.json'
import ja from '~/src/config/locales/it/translation.json'
import ko from '~/src/config/locales/ko/translation.json'
import no from '~/src/config/locales/no/translation.json'
import pl from '~/src/config/locales/pl/translation.json'
import pt_pt from '~/src/config/locales/pt_pt/translation.json'
import ru from '~/src/config/locales/ru/translation.json'
import sv_se from '~/src/config/locales/sv_se/translation.json'
import zh_cn from '~/src/config/locales/zh_cn/translation.json'

const options: InitOptions = {
  initImmediate: false,
  lng: 'en',
  fallbackLng: 'en',
  saveMissing: true,
  resources: {
    cs: {
      translation: cs
    },
    de: {
      translation: de
    },
    en: {
      translation: en
    },
    es_es: {
      translation: es_es
    },
    fr: {
      translation: fr
    },
    ja: {
      translation: ja
    },
    ko: {
      translation: ko
    },
    no: {
      translation: no
    },
    pl: {
      translation: pl
    },
    pt_pt: {
      translation: pt_pt
    },
    ru: {
      translation: ru
    },
    sv_se: {
      translation: sv_se
    },
    zh_cn: {
      translation: zh_cn
    }
  }
}

i18next.init(options)

export default i18next
