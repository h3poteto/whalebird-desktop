import { Entity, MegalodonInterface } from 'megalodon'
import dayjs from 'dayjs'
import Body from './Body'
import Media from './Media'
import emojify from '@/utils/emojify'
import Card from './Card'
import Poll from './Poll'
import { FormattedMessage, useIntl } from 'react-intl'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Account } from '@/db'
import { Avatar, List, ListItem, Card as MaterialCard } from '@material-tailwind/react'

type Props = {
  status: Entity.Status
  account: Account
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
  filters: Array<Entity.Filter>
}

export default function Conversation(props: Props) {
  const status = originalStatus(props.status)
  const [spoilered, setSpoilered] = useState(status.spoiler_text.length > 0)
  const [ignoreFilter, setIgnoreFilter] = useState(false)
  const router = useRouter()
  const { formatMessage } = useIntl()

  const openStatus = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, status_id: status.id, detail: true } })
  }

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }


  if (
    !ignoreFilter &&
    props.filters.map(f => f.phrase).filter(keyword => props.status.content.toLowerCase().includes(keyword.toLowerCase())).length > 0
  ) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 text-gray-950 dark:text-gray-300 mr-2 py-2 text-center">
        <FormattedMessage id="timeline.status.filtered" />
        <span className="theme-text-subtle cursor-pointer pl-4" onClick={() => setIgnoreFilter(true)}>
          <FormattedMessage id="timeline.status.show_anyway" />
        </span>
      </div>
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(status.url)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2 py-1">
      <div className="flex">
        <div className="p-2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar
            src={status.account.avatar}
            onClick={() => openUser(status.account.id)}
            variant="circular"
            style={{ width: '40px', height: '40px' }}
            alt={formatMessage(
              {
                id: 'timeline.status.avatar'
              },
              { user: status.account.username }
            )}
          />
        </div>
        <div className="text-gray-950 dark:text-gray-300 break-all overflow-hidden" style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex justify-between">
            <div className="flex">
              <span className="text-gray-600 dark:text-gray-500">With </span>
              <span 
                className="text-gray-950 font-bold dark:text-gray-300 text-ellipsis break-all overflow-hidden cursor-pointer hover:underline ml-1"
                onClick={() => openUser(status.account.id)}
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
            </div>
            <div className="text-gray-600 dark:text-gray-500 text-right cursor-pointer hover:underline" onClick={openStatus}>
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <div className="status-body text-gray-600 dark:text-gray-500">
            <Body className="my-2" status={status} spoilered={spoilered} setSpoilered={setSpoilered} onClick={() => openStatus()} />
          </div>
          {!spoilered && (
            <>
              {status.poll && <Poll poll={status.poll} onRefresh={() => props.onRefresh(status)} client={props.client} />}
              {status.card && <Card card={status.card} />}
              <Media media={status.media_attachments} sensitive={status.sensitive} openMedia={props.openMedia} />
              <div className="flex items-center gap-2">
                {status.emoji_reactions &&
                  status.emoji_reactions.map(e => (
                    <button key={e.name} className="py-1">
                      {e.url ? <img src={e.url} style={{ height: '24px' }} /> : <span>{e.name}</span>}
                    </button>
                  ))}
              </div>
            </>
          )}
          <div className="fixed hidden context-menu z-50" id={`context-${status.id}`}>
            <MaterialCard className="rounded-md bg-white dark:bg-gray-800">
              <List className="my-2 p-0">
                <ListItem className="ground rounded-none py-1.5 px-3 text-sm" onClick={copyLink}>
                  <FormattedMessage id="timeline.status.context_menu.copy_link" />
                </ListItem>
                <ListItem className="ground rounded-none py-1.5 px-3 text-sm" onClick={openStatus}>
                  <FormattedMessage id="timeline.status.context_menu.open_detail" />
                </ListItem>
              </List>
            </MaterialCard>
          </div>
        </div>
      </div>
    </div>
  )
}

const originalStatus = (status: Entity.Status) => {
  if (status.reblog && !status.quote) {
    return status.reblog
  } else {
    return status
  }
}

