import en from '../../locales/en/translation.json'
import ja from '../../locales/ja/translation.json'
import pt_pt from '../../locales/pt_pt/translation.json'
import zh_tw from '../../locales/zh_tw/translation.json'
import es_es from '../../locales/es_es/translation.json'
import { flattenMessages } from '../utils/flattenMessage'
import { createContext, useState } from 'react'
import { IntlProvider } from 'react-intl'

export type localeType = 'en' | 'ja' | 'pt-PT' | 'zh-TW' | 'es-ES'

type Props = {
  children: React.ReactNode
}

interface Lang {
  switchLang(lang: string): void
}

export const Context = createContext<Lang>({} as Lang)

export const IntlProviderWrapper: React.FC<Props> = props => {
  const langs = [
    { locale: 'en', messages: flattenMessages(en) },
    { locale: 'ja', messages: flattenMessages(ja) },
    { locale: 'pt-PT', messages: flattenMessages(pt_pt) },
    { locale: 'zh-TW', messages: flattenMessages(zh_tw) },
    { locale: 'es-ES', messages: flattenMessages(es_es) }
  ]
  const [lang, setLang] = useState(langs[0])

  const switchLang = (locale: string) => {
    const changeLang = langs.find(lang => lang.locale === locale)
    if (changeLang == null) {
      return
    }
    setLang(changeLang)
  }

  return (
    <Context.Provider value={{ switchLang }}>
      <IntlProvider {...lang} defaultLocale="en" fallbackOnEmptyString={true}>
        {props.children}
      </IntlProvider>
    </Context.Provider>
  )
}
