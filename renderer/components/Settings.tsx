import { localeType } from '@/utils/i18n'
import { Label, Modal, Select, TextInput } from 'flowbite-react'
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
  }
]

export default function Settings(props: Props) {
  const [language, setLanguage] = useState<localeType>('en')
  const [fontSize, setFontSize] = useState<number>(16)

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('language')
      setLanguage(lang as localeType)
    }
  }, [])

  const languageChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as localeType)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('language', e.target.value)
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
    <Modal show={props.opened} onClose={props.close}>
      <Modal.Header>
        <FormattedMessage id="settings.title" />
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2">
              <Label htmlFor="fontsize">
                <FormattedMessage id="settings.font_size" />
              </Label>
            </div>
            <div>
              <TextInput type="number" value={fontSize} onChange={fontSizeChanged} />
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Label htmlFor="language">
                <FormattedMessage id="settings.language" />
              </Label>
            </div>
            <div>
              <Select id="language" onChange={languageChanged} defaultValue={language}>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
