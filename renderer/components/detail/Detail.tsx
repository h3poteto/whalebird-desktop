import { useRouter } from 'next/router'
import { HTMLAttributes, useEffect, useState } from 'react'
import { FaChevronLeft, FaUserPlus, FaUserXmark, FaX } from 'react-icons/fa6'
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
  const [tagFollowing, setTagFollowing] = useState(false)

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

  useEffect(() => {
    if (router.query.tag) {
      refreshFollowing(router.query.tag as string)
    } else {
      setTagFollowing(false)
    }
  }, [router.query.tag])

  const refreshFollowing = async (tag: string) => {
    const res = await props.client.getTag(tag)
    if (res.data.following) {
      setTagFollowing(true)
    } else {
      setTagFollowing(false)
    }
  }

  const back = () => {
    router.back()
  }

  const close = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline } })
  }

  const followTag = async (tag: string) => {
    await props.client.followTag(tag)
    await refreshFollowing(tag)
  }

  const unfollowTag = async (tag: string) => {
    await props.client.unfollowTag(tag)
    await refreshFollowing(tag)
  }

  return (
    <>
      {target && (
        <div className={`${props.className}`} style={props.style}>
          <div className="theme-bg-secondary text-gray-200 flex justify-between p-2 items-center" style={{ height: '44px' }}>
            <div className="flex gap-4 items-center">
              <button className="text-lg" title={formatMessage({ id: 'detail.back' })}>
                <FaChevronLeft onClick={back} />
              </button>
              {target === 'tag' && `#${router.query.tag}`}
            </div>
            <div className="flex items-center">
              {target === 'tag' && (
                <>
                  {tagFollowing ? (
                    <button
                      className="text-lg mr-4"
                      title={formatMessage({ id: 'detail.unfollow_tag' })}
                      onClick={() => unfollowTag(router.query.tag as string)}
                    >
                      <FaUserXmark />
                    </button>
                  ) : (
                    <button
                      className="text-lg mr-4"
                      title={formatMessage({ id: 'detail.follow_tag' })}
                      onClick={() => followTag(router.query.tag as string)}
                    >
                      <FaUserPlus />
                    </button>
                  )}
                </>
              )}

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
