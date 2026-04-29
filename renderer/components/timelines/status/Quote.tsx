import { Entity } from 'megalodon'
import dayjs from 'dayjs'
import emojify from '@/utils/emojify'
import { FormattedMessage } from 'react-intl'
import { useRouter } from 'next/router'

type Props = {
  quote: Entity.QuotedStatus
}

function isFullQuote(quote: Entity.QuotedStatus): quote is Entity.Quote {
  return 'quoted_status' in quote
}

export default function Quote(props: Props) {
  const { quote } = props
  const router = useRouter()

  if (quote.state !== 'accepted') {
    return (
      <div className="border border-solid border-gray-200 dark:border-gray-700 rounded-md p-2 my-1 text-sm text-gray-500 dark:text-gray-400">
        <QuoteStateMessage state={quote.state} />
      </div>
    )
  }

  if (!isFullQuote(quote) || !quote.quoted_status) {
    return null
  }

  const status = quote.quoted_status

  const openQuotedStatus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, status_id: status.id, detail: true } })
  }

  return (
    <div
      className="border border-solid border-gray-200 dark:border-gray-700 rounded-md p-2 my-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 overflow-hidden"
      onClick={openQuotedStatus}
    >
      <div className="flex items-center gap-1 text-sm">
        <img src={status.account.avatar} className="rounded" style={{ width: '16px', height: '16px' }} alt={status.account.username} />
        <span
          className="font-bold text-gray-950 dark:text-gray-300 text-ellipsis overflow-hidden"
          dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
        />
        <span className="text-gray-500 dark:text-gray-400">@{status.account.acct}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-auto text-xs whitespace-nowrap">
          <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
        </span>
      </div>
      <div
        className="raw-html font-thin text-sm mt-1 text-gray-950 dark:text-gray-300"
        style={{ wordWrap: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: emojify(status.content, status.emojis) }}
      />
      {status.media_attachments.length > 0 && (
        <div className="flex gap-1 mt-1">
          {status.media_attachments.slice(0, 4).map(media => (
            <div key={media.id} className="rounded overflow-hidden" style={{ height: '48px', width: '48px' }}>
              <img
                src={media.preview_url || media.url}
                alt={media.description || ''}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuoteStateMessage({ state }: { state: Entity.QuoteState }) {
  switch (state) {
    case 'pending':
      return <FormattedMessage id="timeline.status.quote.pending" />
    case 'rejected':
      return <FormattedMessage id="timeline.status.quote.rejected" />
    case 'deleted':
      return <FormattedMessage id="timeline.status.quote.deleted" />
    default:
      return <FormattedMessage id="timeline.status.quote.unavailable" />
  }
}
