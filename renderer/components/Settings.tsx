import { localeType } from '@/utils/i18n'
import { Label, Modal, Select } from 'flowbite-react'
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
