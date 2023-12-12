import { CustomFlowbiteTheme, Dropdown, Flowbite } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { FaBookmark, FaEllipsis, FaFaceLaughBeam, FaReply, FaRetweet, FaStar } from 'react-icons/fa6'
import Picker from '@emoji-mart/react'
import { data } from '@/utils/emojiData'
import { Account } from '@/db'
import { FormattedMessage } from 'react-intl'

type Props = {
  status: Entity.Status
  account: Account
  client: MegalodonInterface
  onRefresh: () => void
}

const customTheme: CustomFlowbiteTheme = {
  dropdown: {
    content: 'focus:outline-none',
    floating: {
      item: {
        base: 'hidden'
      }
    }
  }
}

export default function Actions(props: Props) {
  const router = useRouter()

  const reply = async () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, reply_target_id: props.status.id, detail: true } })
  }

  const reblog = async () => {
    if (props.status.reblogged) {
      await props.client.unreblogStatus(props.status.id)
    } else {
      await props.client.reblogStatus(props.status.id)
    }
    props.onRefresh()
  }

  const favourite = async () => {
    if (props.status.favourited) {
      await props.client.unfavouriteStatus(props.status.id)
    } else {
      await props.client.favouriteStatus(props.status.id)
    }
    props.onRefresh()
  }

  const bookmark = async () => {
    if (props.status.bookmarked) {
      await props.client.unbookmarkStatus(props.status.id)
    } else {
      await props.client.bookmarkStatus(props.status.id)
    }
    props.onRefresh()
  }

  const onEmojiSelect = async emoji => {
    await props.client.createEmojiReaction(props.status.id, emoji.native)
    const dummy = document.getElementById('dummy-emoji-picker')
    dummy.click()
    props.onRefresh()
  }

  const report = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, report_target_id: props.status.id, modal: true } })
  }

  return (
    <div className="flex gap-6">
      <FaReply className={`w-4 text-gray-400 cursor-pointer hover:text-gray-600`} onClick={reply} />
      <FaRetweet className={`${retweetColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={reblog} />
      <FaStar className={`${favouriteColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={favourite} />
      <FaBookmark className={`${bookmarkColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={bookmark} />
      {props.account.sns !== 'mastodon' && (
        <Flowbite theme={{ theme: customTheme }}>
          <Dropdown
            label=""
            dismissOnClick
            renderTrigger={() => (
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <FaFaceLaughBeam />
              </span>
            )}
          >
            <Picker data={data} onEmojiSelect={onEmojiSelect} previewPosition="none" set="native" perLine="7" theme="light" />
            <Dropdown.Item>
              <span id="dummy-emoji-picker" />
            </Dropdown.Item>
          </Dropdown>
        </Flowbite>
      )}

      <Dropdown
        label=""
        dismissOnClick
        renderTrigger={() => (
          <span className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FaEllipsis className="w-4" />
          </span>
        )}
      >
        <Dropdown.Item onClick={report}>
          <FormattedMessage id="timeline.status.report" values={{ user: `@${props.status.account.acct}` }} />
        </Dropdown.Item>
      </Dropdown>
    </div>
  )
}

const retweetColor = (status: Entity.Status) => {
  if (status.reblogged) {
    return 'text-blue-600'
  } else {
    return 'text-gray-400'
  }
}

const favouriteColor = (status: Entity.Status) => {
  if (status.favourited) {
    return 'text-orange-400'
  } else {
    return 'text-gray-400'
  }
}

const bookmarkColor = (status: Entity.Status) => {
  if (status.bookmarked) {
    return 'text-rose-500'
  } else {
    return 'text-gray-400'
  }
}
