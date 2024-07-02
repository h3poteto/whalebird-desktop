import { Input, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'
import Statuses from './search/Statuses'
import { Account } from '@/db'
import Accounts from './search/Accounts'
import Hashtags from './search/Hashtags'
import Detail from '../detail/Detail'

type Props = {
  client: MegalodonInterface
  account: Account
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Search(props: Props) {
  const router = useRouter()
  const { formatMessage } = useIntl()

  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('statuses')
  const [results, setResults] = useState<Entity.Results>({
    accounts: [],
    hashtags: [],
    statuses: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string)
      search(router.query.q as string)
    }
  }, [router.query.q])

  const search = (query: string) => {
    setLoading(true)
    setResults({
      accounts: [],
      hashtags: [],
      statuses: []
    })
    props.client
      .search(query)
      .then(res => {
        setResults(res.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const word = ((ev.target as HTMLFormElement).elements[0] as HTMLInputElement).value
    if (word.length > 0) {
      router.push({
        query: Object.assign({}, router.query, {
          timeline: 'search',
          q: word
        })
      })
    }
  }

  const timelineClass = () => {
    if (router.query.detail) {
      return 'timeline-with-drawer'
    }
    return 'timeline'
  }

  return (
    <>
      <div className="flex timeline-wrapper">
        <section className={`h-full ${timelineClass()}`}>
          <div className="w-full theme-text-primary p-2 flex justify-center" style={{ height: '56px' }}>
            <form onSubmit={ev => submit(ev)}>
              <Input
                type="text"
                color="blue-gray"
                placeholder={formatMessage({ id: 'timeline.search' })}
                className="placeholder:opacity-100"
                value={query}
                onChange={e => setQuery(e.target.value)}
                icon={<FaMagnifyingGlass />}
              />
            </form>
          </div>
          <Tabs value={activeTab} style={{ height: 'calc(100% - 56px)' }}>
            <TabsHeader
              indicatorProps={{
                className: 'bg-blue-gray-50 dark:bg-blue-gray-900 border-b-2 border-blue-400 dark:border-blue-600 shadow-none rounded-none'
              }}
            >
              <Tab value="statuses" onClick={() => setActiveTab('statuses')}>
                <FormattedMessage id="search.statuses" />
              </Tab>
              <Tab value="accounts" onClick={() => setActiveTab('accounts')}>
                <FormattedMessage id="search.accounts" />
              </Tab>
              <Tab value="hashtags" onClick={() => setActiveTab('hashtags')}>
                <FormattedMessage id="search.hashtags" />
              </Tab>
            </TabsHeader>
            <TabsBody style={{ height: 'calc(100% - 35px)' }}>
              <TabPanel value="statuses" className="h-full p-0">
                <Statuses
                  statuses={results.statuses}
                  client={props.client}
                  account={props.account}
                  openMedia={props.openMedia}
                  loading={loading}
                />
              </TabPanel>
              <TabPanel value="accounts">
                <Accounts users={results.accounts} loading={loading} />
              </TabPanel>
              <TabPanel value="hashtags">
                <Hashtags hashtags={results.hashtags} loading={loading} />
              </TabPanel>
            </TabsBody>
          </Tabs>
        </section>
        <Detail client={props.client} account={props.account} className="detail" openMedia={props.openMedia} />
      </div>
    </>
  )
}
