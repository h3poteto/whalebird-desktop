import { Context, localeType } from '@/utils/i18n'
import { Label, Modal, Select } from 'flowbite-react'
import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'

type Props = {
  opened: boolean
  close: () => void
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
  const { switchLang } = useContext(Context)

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
    reloadSettings()
  }

  const reloadSettings = () => {
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('language')
      switchLang(lang)
    }
  }

  return (
    <Modal show={props.opened} onClose={props.close}>
      <Modal.Header>
        <FormattedMessage id="settings.title" />
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
    </Modal>
  )
}
