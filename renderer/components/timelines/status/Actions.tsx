import { Entity, MegalodonInterface } from 'megalodon'
import { FaBookmark, FaEllipsis, FaReply, FaRetweet, FaStar } from 'react-icons/fa6'

type Props = {
  status: Entity.Status
  client: MegalodonInterface
  onRefresh: () => void
}

export default function Actions(props: Props) {
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

  return (
    <div className="flex gap-6">
      <FaReply className={`w-4 text-gray-400 cursor-pointer hover:text-gray-600`} />
      <FaRetweet className={`${retweetColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={reblog} />
      <FaStar className={`${favouriteColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={favourite} />
      <FaBookmark className={`${bookmarkColor(props.status)} w-4 cursor-pointer hover:text-gray-600`} onClick={bookmark} />
      <FaEllipsis className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
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
