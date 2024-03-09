import { useRouter } from 'next/router'
import { HTMLAttributes, useEffect, useState } from 'react'
import { FaChevronLeft, FaX } from 'react-icons/fa6'
import Thread from './Thread'
import { Entity, MegalodonInterface } from 'megalodon'
import Reply from './Reply'
import Profile from './Profile'
import Tag from './Tag'
import { Account } from '@/db'
import { useIntl } from 'react-intl'

type Props = {
  client: MegalodonInterface
  account: Account
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
} & HTMLAttributes<HTMLElement>

export default function Detail(props: Props) {
  const [target, setTarget] = useState<'status' | 'reply' | 'profile' | 'tag' | null>(null)
  const router = useRouter()
  const { formatMessage } = useIntl()

  useEffect(() => {
    if (router.query.status_id) {
      setTarget('status')
    } else if (router.query.reply_target_id) {
      setTarget('reply')
    } else if (router.query.user_id) {
      setTarget('profile')
    } else if (router.query.tag) {
      setTarget('tag')
    } else {
      setTarget(null)
    }
  }, [router.query])

  const back = () => {
    router.back()
  }

  const close = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline } })
  }

  return (
    <>
      {target && (
        <div className={`bg-white ${props.className}`} style={props.style}>
          <div className="bg-blue-900 text-gray-200 flex justify-between p-2 items-center" style={{ height: '44px' }}>
            <div className="flex gap-4 items-center">
              <button className="text-lg" title={formatMessage({ id: 'detail.back' })}>
                <FaChevronLeft onClick={back} />
              </button>
              {target === 'tag' && `#${router.query.tag}`}
            </div>
            <div className="flex items-center">
              <button className="text-lg" title={formatMessage({ id: 'detail.close' })}>
                <FaX onClick={close} />
              </button>
            </div>
          </div>
          {target === 'status' && (
            <Thread
              client={props.client}
              account={props.account}
              status_id={router.query.status_id as string}
              openMedia={props.openMedia}
            />
          )}
          {target === 'reply' && (
            <Reply
              client={props.client}
              account={props.account}
              status_id={router.query.reply_target_id as string}
              openMedia={props.openMedia}
            />
          )}
          {target === 'profile' && (
            <Profile client={props.client} account={props.account} user_id={router.query.user_id as string} openMedia={props.openMedia} />
          )}
          {target === 'tag' && (
            <Tag client={props.client} account={props.account} tag={router.query.tag as string} openMedia={props.openMedia} />
          )}
        </div>
      )}
    </>
  )
}
