import { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { FaBookmark, FaEllipsis, FaFaceLaughBeam, FaReply, FaRetweet, FaStar } from 'react-icons/fa6'
import Picker from '@emoji-mart/react'
import { data } from '@/utils/emojiData'
import { Account } from '@/db'
import { FormattedMessage } from 'react-intl'
import { IconButton, List, ListItem, Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import { useState } from 'react'

type Props = {
  status: Entity.Status
  account: Account
  client: MegalodonInterface
  onRefresh: () => void
}

export default function Actions(props: Props) {
  const [popoverDetail, setPopoverDetail] = useState(false)
  const [popoverEmoji, setPopoverEmoji] = useState(false)
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
    setPopoverDetail(false)
    props.onRefresh()
  }

  const report = () => {
    setPopoverDetail(false)
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, report_target_id: props.status.id, modal: true } })
  }

  return (
    <div className="flex gap-2">
      <IconButton variant="text" size="sm" onClick={reply} className="text-gray-400 text-base hover:text-gray-600">
        <FaReply className="w-4" />
      </IconButton>
      <IconButton variant="text" size="sm" onClick={reblog} className={`${retweetColor(props.status)} text-base hover:text-gray-600`}>
        <FaRetweet className="w-4" />
      </IconButton>
      <IconButton variant="text" size="sm" onClick={favourite} className={`${favouriteColor(props.status)} text-base hover:text-gray-600`}>
        <FaStar className="w-4" />
      </IconButton>
      <IconButton variant="text" size="sm" onClick={bookmark} className={`${bookmarkColor(props.status)} text-base hover:text-gray-600`}>
        <FaBookmark className="w-4" />
      </IconButton>
      {props.account.sns !== 'mastodon' && (
        <Popover open={popoverEmoji} handler={setPopoverEmoji}>
          <PopoverHandler>
            <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600 text-base">
              <FaFaceLaughBeam />
            </IconButton>
          </PopoverHandler>
          <PopoverContent className="z-10">
            <Picker data={data} onEmojiSelect={onEmojiSelect} previewPosition="none" set="native" perLine="7" theme="light" />
          </PopoverContent>
        </Popover>
      )}

      <Popover open={popoverDetail} handler={setPopoverDetail}>
        <PopoverHandler>
          <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600 text-base">
            <FaEllipsis className="w-4" />
          </IconButton>
        </PopoverHandler>
        <PopoverContent className="z-10">
          <List className="py-2 px-0">
            <ListItem onClick={report} className="rounded-none">
              <FormattedMessage id="timeline.status.report" values={{ user: `@${props.status.account.acct}` }} />
            </ListItem>
          </List>
        </PopoverContent>
      </Popover>
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
    return 'text-red-500'
  } else {
    return 'text-gray-400'
  }
}
