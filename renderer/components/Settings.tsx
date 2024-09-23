import { localeType } from '@/provider/i18n'
import { invoke } from '@/utils/invoke'
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Radio, Select, Typography } from '@material-tailwind/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

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
  },
  {
    label: '繁体字',
    value: 'zh-TW'
  },
  {
    label: 'español',
    value: 'es-ES'
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

type ProxyValue = 'no' | 'os' | 'manual'

export default function Settings(props: Props) {
  const [language, setLanguage] = useState<localeType>('en')
  const [fontSize, setFontSize] = useState<number>(16)
  const [theme, setTheme] = useState<string>('theme-blue')
  const [isDark, setIsDark] = useState(false)
  const [proxy, setProxy] = useState<ProxyValue>('no')
  const [proxyProtocol, setProxyProtocol] = useState<string | null>(null)
  const [proxyHost, setProxyHost] = useState<string | null>(null)
  const [proxyPort, setProxyPort] = useState<string | null>(null)
  const [fontFamilies, setFontFamilies] = useState<Array<string>>([])
  const [fontFamily, setFontFamily] = useState<string | null>(null)
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      const lists = await invoke('list-fonts', null)
      if (lists) {
        setFontFamilies(lists)
      }
    }
    f()
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('language')
      if (lang) {
        setLanguage(lang as localeType)
      } else {
        setLanguage('en')
      }
      const fontSize = localStorage.getItem('fontSize')
      if (fontSize) {
        setFontSize(parseInt(fontSize))
      }
      const fontFamily = localStorage.getItem('fontFamily')
      if (fontFamily) {
        setFontFamily(fontFamily)
      }
      const dark = localStorage.getItem('color-mode')
      if (dark === 'dark') {
        setIsDark(true)
      } else {
        setIsDark(false)
      }
      const proxyMode = localStorage.getItem('proxyMode')
      if (proxyMode) {
        setProxy(proxyMode as ProxyValue)
      }
      const proxyProtocol = localStorage.getItem('proxyProtocol')
      if (proxyProtocol) {
        setProxyProtocol(proxyProtocol)
      }
      const proxyHost = localStorage.getItem('proxyHost')
      if (proxyHost) {
        setProxyHost(proxyHost)
      }
      const proxyPort = localStorage.getItem('proxyPort')
      if (proxyPort) {
        setProxyPort(proxyPort)
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

  const fontFamilyChanged = (e: string) => {
    setFontFamily(e)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fontFamily', e)
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

  const modeChanged = (isDark: boolean) => {
    setIsDark(isDark)
    if (typeof localStorage !== 'undefined') {
      if (isDark) {
        localStorage.setItem('color-mode', 'dark')
      } else {
        localStorage.setItem('color-mode', 'light')
      }
    }
    props.reloadSettings()
  }

  const save = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('proxyMode', proxy)
      localStorage.setItem('proxyProtocol', proxyProtocol)
      localStorage.setItem('proxyHost', proxyHost)
      localStorage.setItem('proxyPort', proxyPort)
    }
    props.reloadSettings()
    props.close()
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
              <Input type="number" color="blue-gray" value={fontSize} onChange={fontSizeChanged} />
            </div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.font_family" />
              </Typography>
            </div>
            <div>
              <Select onChange={fontFamilyChanged} value={fontFamily}>
                {fontFamilies.map((font, index) => (
                  <Option key={index} value={font}>
                    {font}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.language" />
              </Typography>
            </div>
            <div>
              <Select id="language" color="blue-gray" onChange={languageChanged} value={language}>
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
                <FormattedMessage id="settings.mode" />
              </Typography>
            </div>
            <div>
              <Radio
                name="mode"
                color="blue"
                label={<FormattedMessage id="settings.dark_mode" />}
                onClick={() => modeChanged(true)}
                defaultChecked={isDark}
              />
              <Radio
                name="mode"
                color="blue"
                label={<FormattedMessage id="settings.light_mode" />}
                onClick={() => modeChanged(false)}
                defaultChecked={!isDark}
              />
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.theme" />
              </Typography>
            </div>
            <div>
              <Select id="theme" color="blue-gray" onChange={themeChanged} value={theme}>
                {themes.map(t => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <Typography>
                <FormattedMessage id="settings.proxy.title" />
              </Typography>
            </div>
            <div className="flex flex-col gap-2">
              <Radio
                name="proxy"
                color="blue"
                label={<FormattedMessage id="settings.proxy.no" />}
                defaultChecked={proxy === 'no'}
                onClick={() => setProxy('no')}
              />
              <Radio
                name="proxy"
                color="blue"
                label={<FormattedMessage id="settings.proxy.os" />}
                defaultChecked={proxy === 'os'}
                onClick={() => setProxy('os')}
              />
              <Radio
                name="proxy"
                color="blue"
                label={
                  <div>
                    <FormattedMessage id="settings.proxy.manual" />
                    <div className="flex gap-2">
                      <div className="w-1/5">
                        <Select
                          label={formatMessage({ id: 'settings.proxy.protocol' })}
                          containerProps={{
                            className: '!min-w-2'
                          }}
                          value={proxyProtocol}
                          onChange={val => setProxyProtocol(val)}
                        >
                          <Option value="http">
                            <FormattedMessage id="settings.proxy.http" />
                          </Option>
                          <Option value="socks">
                            <FormattedMessage id="settings.proxy.socks" />
                          </Option>
                        </Select>
                      </div>
                      <div className="w-3/5">
                        <Input
                          defaultValue={proxyHost}
                          label={formatMessage({ id: 'settings.proxy.host' })}
                          onChange={e => setProxyHost(e.target.value)}
                        />
                      </div>
                      <div className="w-1/5">
                        <Input
                          defaultValue={proxyPort}
                          label={formatMessage({ id: 'settings.proxy.port' })}
                          containerProps={{
                            className: '!min-w-2'
                          }}
                          onChange={e => setProxyPort(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                }
                defaultChecked={proxy === 'manual'}
                onClick={() => setProxy('manual')}
              />
            </div>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={props.close}>
          <FormattedMessage id="settings.cancel" />
        </Button>
        <Button variant="gradient" color="blue" onClick={save}>
          <FormattedMessage id="settings.save" />
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
