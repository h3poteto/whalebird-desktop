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

export default function Settings(props: Props) {
  const [language, setLanguage] = useState<localeType>('en')
  const [fontSize, setFontSize] = useState<number>(16)

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
        </div>
      </DialogBody>
    </Dialog>
  )
}
