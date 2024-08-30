import { Entity, MegalodonInterface } from 'megalodon'
import dayjs from 'dayjs'
import emojify from '@/utils/emojify'
import Body from '../status/Body'
import Poll from '../status/Poll'
import Card from '../status/Card'
import Media from '../status/Media'
import { findAccount, findLink, ParsedAccount, accountMatch, findTag } from '@/utils/statusParser'
import { FaBarsProgress, FaHouse, FaPenToSquare, FaRetweet, FaStar } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'
import { MouseEventHandler, useState } from 'react'
import { Avatar, List, ListItem, Card as MaterialCard } from '@material-tailwind/react'
import { useRouter } from 'next/router'
import { invoke } from '@/utils/invoke'
import { Account } from '@/db'

type Props = {
  notification: Entity.Notification
  client: MegalodonInterface
  account: Account
  onRefresh: (status: Entity.Status) => void
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Reaction(props: Props) {
  const status = props.notification.status
  const [spoilered, setSpoilered] = useState(status.spoiler_text.length > 0)
  const { formatMessage } = useIntl()
  const router = useRouter()

  const refresh = async () => {
    const res = await props.client.getStatus(status.id)
    props.onRefresh(res.data)
  }

  const openStatus = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, status_id: status.id, detail: true } })
  }

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  const statusClicked: MouseEventHandler<HTMLDivElement> = async e => {
    const parsedAccount = findAccount(e.target as HTMLElement, 'status-body')
    if (parsedAccount) {
      e.preventDefault()
      e.stopPropagation()

      const account = await searchAccount(parsedAccount, status, props.client, props.account.domain)
      if (account) {
        router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: account.id, detail: true } })
      } else {
        console.warn('account not found', parsedAccount)
      }
      return
    }

    const parsedTag = findTag(e.target as HTMLElement, 'status-body')
    if (parsedTag) {
      e.preventDefault()
      e.stopPropagation()
      router.push({ query: { id: router.query.id, timeline: router.query.timeline, tag: parsedTag, detail: true } })
      return
    }

    const url = findLink(e.target as HTMLElement, 'status-body')
    if (url) {
      invoke('open-browser', url)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const onContextMenu: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault()
    hideOthers()
    const context = document.getElementById(`context-${status.id}`)
    if (context) {
      context.style.left = `${e.clientX}px`
      context.style.top = `${e.clientY}px`
      context.style.display = 'block'
    }
  }

  const onClick: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault()
    hideOthers()
  }

  const hideOthers = () => {
    const menu = document.getElementsByClassName('context-menu')
    for (let i = 0; i < menu.length; i++) {
      ;(menu[i] as HTMLElement).style.display = 'none'
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(status.url)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 mr-2 py-1">
      <div className="flex items-center">
        <div style={{ width: '56px' }}>{actionIcon(props.notification)}</div>
        <div
          className="cursor-pointer text-gray-950 dark:text-gray-300"
          style={{ width: 'calc(100% - 56px)' }}
          onClick={() => openUser(props.notification.account.id)}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: emojify(
                formatMessage(
                  {
                    id: actionId(props.notification)
                  },
                  { user: props.notification.account.username }
                ),
                props.notification.account.emojis
              )
            }}
          />
        </div>
      </div>
      <div className="flex">
        <div className="p-2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar
            src={status.account.avatar}
            onClick={() => openUser(status.account.id)}
            variant="rounded"
            style={{ width: '40px', height: '40px' }}
            alt={formatMessage({ id: 'timeline.status.avatar' }, { user: status.account.username })}
          />
        </div>
        <div
          className="text-gray-600 dark:text-gray-500 break-all overflow-hidden"
          style={{ width: 'calc(100% - 56px)' }}
          onContextMenu={onContextMenu}
          onClick={onClick}
        >
          <div className="flex justify-between">
            <div className="flex cursor-pointer" onClick={() => openUser(status.account.id)}>
              <span
                className="text-ellipsis break-all overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
              <span className="text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
            </div>
            <div className="text-right cursor-pointer" onClick={openStatus}>
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <div className="status-body">
            <Body
              status={status}
              className="text-gray-600 dark:text-gray-500"
              spoilered={spoilered}
              setSpoilered={setSpoilered}
              onClick={statusClicked}
            />
          </div>
          {!spoilered && (
            <>
              {status.poll && <Poll poll={status.poll} onRefresh={refresh} client={props.client} className="text-gray-600" />}
              {status.card && <Card card={status.card} />}
              <Media media={status.media_attachments} sensitive={status.sensitive} openMedia={props.openMedia} />
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

const actionIcon = (notification: Entity.Notification) => {
  switch (notification.type) {
    case 'favourite': {
      return <FaStar className="text-orange-500 w-4 mr-2 ml-auto" />
    }
    case 'reblog':
    case 'quote': {
      return <FaRetweet className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'poll_expired':
    case 'poll_vote': {
      return <FaBarsProgress className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'status': {
      return <FaHouse className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'update': {
      return <FaPenToSquare className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'reaction':
    case 'emoji_reaction': {
      if (notification.reaction) {
        if (notification.reaction.url) {
          return (
            <div className="w-5 mr-2 ml-auto">
              <img src={notification.reaction.url} style={{ height: '18px' }} />
            </div>
          )
        } else {
          return (
            <div className="w-5 mr-2 ml-auto">
              <span dangerouslySetInnerHTML={{ __html: notification.reaction.name }} />
            </div>
          )
        }
      } else {
        return null
      }
    }
    default:
      return null
  }
}

const actionId = (notification: Entity.Notification) => {
  switch (notification.type) {
    case 'favourite':
      return 'notification.favourite.body'
    case 'reblog':
      return 'notification.reblog.body'
    case 'quote':
      return 'notification.quote.body'
    case 'poll_expired':
      return 'notification.poll_expired.body'
    case 'poll_vote':
      return 'notification.poll.vote'
    case 'status':
      return 'notification.status.body'
    case 'update':
      return 'notification.update.body'
    case 'reaction':
    case 'emoji_reaction':
      return 'notification.emoji_reaction.body'

    default:
      return ''
  }
}

async function searchAccount(account: ParsedAccount, status: Entity.Status, client: MegalodonInterface, domain: string) {
  if (status.in_reply_to_account_id) {
    const res = await client.getAccount(status.in_reply_to_account_id)
    if (res.status === 200) {
      const user = accountMatch([res.data], account, domain)
      if (user) return user
    }
  }
  if (status.in_reply_to_id) {
    const res = await client.getStatusContext(status.id)
    if (res.status === 200) {
      const accounts: Array<Entity.Account> = res.data.ancestors.map(s => s.account).concat(res.data.descendants.map(s => s.account))
      const user = accountMatch(accounts, account, domain)
      if (user) return user
    }
  }
  const res = await client.searchAccount(account.url, { resolve: true })
  if (res.data.length === 0) return null
  const user = accountMatch(res.data, account, domain)
  if (user) return user
  return null
}
