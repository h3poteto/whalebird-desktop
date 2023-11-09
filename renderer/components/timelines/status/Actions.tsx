import { FaBookmark, FaEllipsis, FaReply, FaRetweet, FaStar } from 'react-icons/fa6'

type Props = {}

export default function Actions(props: Props) {
  return (
    <div className="flex gap-6">
      <FaReply className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      <FaRetweet className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      <FaStar className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      <FaBookmark className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      <FaEllipsis className="w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
    </div>
  )
}
