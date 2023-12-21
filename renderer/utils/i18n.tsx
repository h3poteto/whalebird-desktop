import en from '../../locales/en/translation.json'
import ja from '../../locales/ja/translation.json'
import { flattenMessages } from './flattenMessage'
import { createContext, useState } from 'react'
import { IntlProvider } from 'react-intl'

export type localeType = 'en' | 'ja'

type Props = {
  children: any // React.ReactNode
}

interface Lang {
  switchLang(lang: string): void
}

export const Context = createContext<Lang>({} as Lang)

export const IntlProviderWrapper: React.FC<Props> = props => {
  const langs = [
    { locale: 'en', messages: flattenMessages(en) },
    { locale: 'ja', messages: flattenMessages(ja) }
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
