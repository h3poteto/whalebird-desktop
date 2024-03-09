import { Entity, MegalodonInterface } from 'megalodon'
import dayjs from 'dayjs'
import Body from './Body'
import Media from './Media'
import emojify from '@/utils/emojify'
import Card from './Card'
import Poll from './Poll'
import { FormattedMessage, useIntl } from 'react-intl'
import Actions from './Actions'
import { useRouter } from 'next/router'
import { MouseEventHandler, useState } from 'react'
import { findAccount, findLink, ParsedAccount, accountMatch, findTag } from '@/utils/statusParser'
import { Account } from '@/db'
import { Avatar } from '@material-tailwind/react'
import { invoke } from '@/utils/invoke'

type Props = {
  status: Entity.Status
  account: Account
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
  filters: Array<Entity.Filter>
}

export default function Status(props: Props) {
  const status = originalStatus(props.status)
  const [spoilered, setSpoilered] = useState(status.spoiler_text.length > 0)
  const [ignoreFilter, setIgnoreFilter] = useState(false)
  const router = useRouter()
  const { formatMessage } = useIntl()

  const onRefresh = async () => {
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

      const account = await searchAccount(parsedAccount, props.status, props.client, props.account.domain)
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

  if (
    !ignoreFilter &&
    props.filters.map(f => f.phrase).filter(keyword => props.status.content.toLowerCase().includes(keyword.toLowerCase())).length > 0
  ) {
    return (
      <div className="border-b mr-2 py-2 text-center">
        <FormattedMessage id="timeline.status.filtered" />
        <span className="theme-text-subtle cursor-pointer pl-4" onClick={() => setIgnoreFilter(true)}>
          <FormattedMessage id="timeline.status.show_anyway" />
        </span>
      </div>
    )
  }

  return (
    <div className="border-b mr-2 py-1">
      {rebloggedHeader(
        props.status,
        formatMessage(
          {
            id: 'timeline.status.avatar'
          },
          { user: status.account.username }
        )
      )}
      <div className="flex">
        <div className="p-2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar
            src={status.account.avatar}
            onClick={() => openUser(status.account.id)}
            variant="rounded"
            style={{ width: '40px', height: '40px' }}
            alt={formatMessage(
              {
                id: 'timeline.status.avatar'
              },
              { user: status.account.username }
            )}
          />
        </div>
        <div className="text-gray-950 break-all overflow-hidden" style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex justify-between">
            <div className="flex cursor-pointer" onClick={() => openUser(status.account.id)}>
              <span
                className="text-gray-950 text-ellipsis break-all overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
              <span className="text-gray-600 text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
            </div>
            <div className="text-gray-600 text-right cursor-pointer" onClick={openStatus}>
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <div className="status-body">
            <Body status={status} spoilered={spoilered} setSpoilered={setSpoilered} onClick={statusClicked} />
          </div>
          {!spoilered && (
            <>
              {status.poll && <Poll poll={status.poll} onRefresh={onRefresh} client={props.client} />}
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

          <Actions status={status} client={props.client} account={props.account} onRefresh={onRefresh} />
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

const rebloggedHeader = (status: Entity.Status, alt: string) => {
  if (status.reblog && !status.quote) {
    return (
      <div className="flex text-gray-600">
        <div className="grid justify-items-end pr-2" style={{ width: '56px' }}>
          <Avatar src={status.account.avatar} size="xs" variant="rounded" alt={alt} />
        </div>
        <div style={{ width: 'calc(100% - 56px)' }}>
          <FormattedMessage id="timeline.status.boosted" values={{ user: status.account.username }} />
        </div>
      </div>
    )
  } else {
    return null
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
