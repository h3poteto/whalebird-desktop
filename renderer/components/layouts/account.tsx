import { CSSProperties, useContext, useEffect, useState } from 'react'
import { FaGear, FaIdCard, FaPlus, FaTrash } from 'react-icons/fa6'
import { Account, db } from '@/db'
import NewAccount from '@/components/accounts/New'
import Settings from '@/components/Settings'
import { useRouter } from 'next/router'
import { FormattedMessage, useIntl } from 'react-intl'
import { Context } from '@/provider/i18n'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemPrefix,
  Popover,
  PopoverContent,
  PopoverHandler
} from '@material-tailwind/react'
import Thirdparty from '../Thirdparty'
import { useUnreads } from '@/provider/unreads'
import { useAccounts } from '@/provider/accounts'
import { invoke } from '@/utils/invoke'
import generator from 'megalodon'

const defaultFontFamily = [
  'Apple-System',
  'Hiragino Kaku Gothic ProN',
  'Hiragino Sans GB',
  'Arial',
  'Helvetica',
  'PingFang SC',
  'Meiryo',
  'Microsoft YaHei',
  'STXihei',
  'sans-serif'
]

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [accounts, setAccounts] = useState<Array<Account>>([])
  const [openNewModal, setOpenNewModal] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openThirdparty, setOpenThirdparty] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  const [openPopover, setOpenPopover] = useState(false)
  const [theme, setTheme] = useState('theme-blue')
  const [isDark, setIsDark] = useState(false)

  const { switchLang } = useContext(Context)
  const router = useRouter()
  const { formatMessage } = useIntl()
  const { unreads } = useUnreads()
  const { addAccount, removeAccount, removeAll } = useAccounts()

  for (let i = 1; i < 9; i++) {
    useHotkeys(`mod+${i}`, () => {
      const acct = accounts[i - 1]
      if (acct && acct.id) {
        router.push(`/accounts/${acct.id}`)
      }
    })
  }

  useEffect(() => {
    loadSettings()
    const fn = async () => {
      const acct = await db.accounts.toArray()
      setAccounts(acct)
      if (acct.length === 0) {
        setOpenNewModal(true)
      }
      acct.forEach(async account => {
        addAccount(account)
        const cli = generator(account.sns, account.url, account.access_token, 'Whalebird')
        const a = await cli.verifyAccountCredentials()
        await db.accounts.update(account.id, { avatar: a.data.avatar })
      })
    }
    fn()

    return () => {
      removeAll()
    }
  }, [])

  useEffect(() => {
    console.log('isDark', isDark)
    document.body.className = isDark ? 'dark' : 'light'
  }, [isDark])

  const closeNewModal = async () => {
    const acct = await db.accounts.toArray()
    setAccounts(acct)
    setOpenNewModal(false)
    if (acct.length === 0) {
      setOpenNewModal(true)
    } else if (!router.query.id) {
      router.push(`/accounts/${acct[0].id}`)
    }
  }

  const openAccount = (id: number) => {
    router.push(`/accounts/${id}`)
  }

  const openContextMenu = (id: number) => {
    document.getElementById(`${id}`).click()
  }

  const deleteAccount = async (account: Account) => {
    removeAccount(account)
    await db.accounts.delete(account.id)
    const acct = await db.accounts.toArray()
    setAccounts(acct)
    if (acct.length === 0) {
      router.push('/')
      setOpenNewModal(true)
    }
  }

  const selectedClassName = (id: number) => {
    if (id === parseInt(router.query.id as string)) {
      return 'theme-bg cursor-pointer text-center'
    } else {
      return 'cursor-pointer text-center'
    }
  }

  const loadSettings = () => {
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('language')
      switchLang(lang)
      const fontSize = localStorage.getItem('fontSize')
      if (parseInt(fontSize)) {
        setStyle({
          fontSize: `${fontSize}px`
        })
      }
      const fontFamily = localStorage.getItem('fontFamily')
      if (fontFamily) {
        setStyle({
          fontFamily: [fontFamily]
            .concat(defaultFontFamily)
            .filter(f => f !== null)
            .join(',')
        })
      }
      const t = localStorage.getItem('theme')
      if (t && t.length > 0) {
        setTheme(t)
      }
      const dark = localStorage.getItem('color-mode')
      if (dark && dark === 'dark') {
        setIsDark(true)
      } else {
        setIsDark(false)
      }
      const proxyMode = localStorage.getItem('proxyMode')
      const proxyProtocol = localStorage.getItem('proxyProtocol')
      const proxyHost = localStorage.getItem('proxyHost')
      const proxyPort = localStorage.getItem('proxyPort')
      invoke('set-proxy', { mode: proxyMode, protocol: proxyProtocol, host: proxyHost, port: proxyPort })
    }
  }

  return (
    <div className={`app flex flex-col min-h-screen ${theme}`} style={style}>
      <main className="flex w-full box-border my-0 mx-auto min-h-screen bg-white dark:bg-gray-900">
        <aside className="w-16 theme-account-bg flex flex-col justify-between">
          <div>
            {accounts.map(account => (
              <div key={account.id} className={selectedClassName(account.id)}>
                <Popover>
                  <PopoverHandler>
                    <span id={`${account.id}`} />
                  </PopoverHandler>
                  <PopoverContent>
                    <List className="py-2 px-0">
                      <ListItem onClick={() => deleteAccount(account)} className="py-2 px-4 rounded-none">
                        <ListItemPrefix>
                          <FaTrash />
                        </ListItemPrefix>
                        <FormattedMessage id="accounts.remove" />
                      </ListItem>
                    </List>
                  </PopoverContent>
                </Popover>
                <Badge className="mt-1" color="green" invisible={!(unreads[account.id.toString()] > 0)}>
                  <Avatar
                    alt={account.domain}
                    src={account.avatar}
                    title={`${account.username}@${account.domain}`}
                    aria-label={`${account.username}@${account.domain}`}
                    className="p-1"
                    onClick={() => openAccount(account.id)}
                    onContextMenu={() => openContextMenu(account.id)}
                  />
                </Badge>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setOpenNewModal(true)}
                title={formatMessage({ id: 'accounts.new.title' })}
                aria-label={formatMessage({ id: 'accounts.new.title' })}
              >
                <FaPlus className="text-gray-400 text-xl" />
              </IconButton>
            </div>
            <NewAccount opened={openNewModal} close={closeNewModal} />
          </div>
          <div className="settings text-gray-400 flex flex-col items-center mb-2">
            <Popover open={openPopover} handler={setOpenPopover}>
              <PopoverHandler>
                <IconButton
                  variant="text"
                  size="lg"
                  title={formatMessage({ id: 'settings.title' })}
                  aria-label={formatMessage({ id: 'settings.title' })}
                >
                  <FaGear className="text-gray-400 text-xl" />
                </IconButton>
              </PopoverHandler>
              <PopoverContent>
                <List className="py-2 px-0">
                  <ListItem
                    onClick={() => {
                      setOpenSettings(true)
                      setOpenPopover(false)
                    }}
                    className="py-2 px-4 rounded-none"
                  >
                    <ListItemPrefix>
                      <FaGear />
                    </ListItemPrefix>
                    <FormattedMessage id="settings.title" />
                  </ListItem>
                  <ListItem
                    onClick={() => {
                      setOpenThirdparty(true)
                      setOpenPopover(false)
                    }}
                    className="py-2 px-4 rounded-none"
                  >
                    <ListItemPrefix>
                      <FaIdCard />
                    </ListItemPrefix>
                    <FormattedMessage id="thirdparty.title" />
                  </ListItem>
                </List>
              </PopoverContent>
            </Popover>
          </div>
        </aside>
        {children}
        <Settings opened={openSettings} close={() => setOpenSettings(false)} reloadSettings={loadSettings} />
        <Thirdparty opened={openThirdparty} close={() => setOpenThirdparty(false)} />
      </main>
    </div>
  )
}
