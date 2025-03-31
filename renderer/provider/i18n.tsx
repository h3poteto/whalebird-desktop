import en from '../../locales/en/translation.json'
import cs from '../../locales/cs/translation.json'
import de from '../../locales/de/translation.json'
import es_es from '../../locales/es_es/translation.json'
import fr from '../../locales/fr/translation.json'
import gd from '../../locales/gd/translation.json'
import hu from '../../locales/hu/translation.json'
import id from '../../locales/id/translation.json'
import it from '../../locales/it/translation.json'
import ja from '../../locales/ja/translation.json'
import ko from '../../locales/ko/translation.json'
import no from '../../locales/no/translation.json'
import pt_pt from '../../locales/pt_pt/translation.json'
import zh_cn from '../../locales/zh_cn/translation.json'
import zh_tw from '../../locales/zh_tw/translation.json'

import { flattenMessages } from '../utils/flattenMessage'
import { createContext, useState } from 'react'
import { IntlProvider } from 'react-intl'

export type localeType = 'en' | 'cs' | 'de' | 'es-ES' | 'fr' | 'gd' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'no' | 'pt-PT' | 'zh-CN' | 'zh-TW'

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
    { locale: 'cs', messages: flattenMessages(cs) },
    { locale: 'de', messages: flattenMessages(de) },
    { locale: 'es-ES', messages: flattenMessages(es_es) },
    { locale: 'fr', messages: flattenMessages(fr) },
    { locale: 'gd', messages: flattenMessages(gd) },
    { locale: 'hu', messages: flattenMessages(hu) },
    { locale: 'id', messages: flattenMessages(id) },
    { locale: 'it', messages: flattenMessages(it) },
    { locale: 'ja', messages: flattenMessages(ja) },
    { locale: 'ko', messages: flattenMessages(ko) },
    { locale: 'no', messages: flattenMessages(no) },
    { locale: 'pt-PT', messages: flattenMessages(pt_pt) },
    { locale: 'zh-CN', messages: flattenMessages(zh_cn) },
    { locale: 'zh-TW', messages: flattenMessages(zh_tw) }
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
