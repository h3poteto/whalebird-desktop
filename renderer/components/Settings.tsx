import { localeType } from '@/provider/i18n'
import { Dialog, DialogBody, DialogHeader, Input, Option, Select, Typography } from '@material-tailwind/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'

type Props = {
  opened: boolean
  close: () => void
  reloadSettings: () => void
}

const languages = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '日本語',
    value: 'ja'
  },
  {
    label: 'Português',
    value: 'pt-PT'
  }
]

const themes = [
  {
    label: 'Blue',
    value: 'theme-blue'
  },
  {
    label: 'Orange',
    value: 'theme-orange'
  },
  {
    label: 'Purple',
    value: 'theme-purple'
  },
  {
    label: 'Green',
    value: 'theme-green'
  },
  {
    label: 'Brown',
    value: 'theme-brown'
  },
  {
    label: 'Gray',
    value: 'theme-gray'
  }
]

export default function Settings(props: Props) {
  const [language, setLanguage] = useState<localeType>('en')
  const [fontSize, setFontSize] = useState<number>(16)
  const [theme, setTheme] = useState<string>('theme-blue')

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('language')
      if (lang) {
        setLanguage(lang as localeType)
      } else {
        setLanguage('en')
      }
    }
  }, [])

  const languageChanged = (e: string) => {
    setLanguage(e as localeType)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('language', e)
    }
    props.reloadSettings()
  }

  const fontSizeChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fontSize', e.target.value)
    }
    props.reloadSettings()
  }

  const themeChanged = (e: string) => {
    setTheme(e)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', e)
    }
    props.reloadSettings()
  }

  return (
    <Dialog open={props.opened} handler={props.close} size="sm">
      <DialogHeader>
        <FormattedMessage id="settings.title" />
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.font_size" />
              </Typography>
            </div>
            <div>
              <Input type="number" value={fontSize} onChange={fontSizeChanged} />
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.language" />
              </Typography>
            </div>
            <div>
              <Select id="language" onChange={languageChanged} value={language}>
                {languages.map(lang => (
                  <Option key={lang.value} value={lang.value}>
                    {lang.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.theme" />
              </Typography>
            </div>
            <div>
              <Select id="theme" onChange={themeChanged} value={theme}>
                {themes.map(t => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  )
}
