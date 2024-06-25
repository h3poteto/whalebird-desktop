import { Spinner } from '@material-tailwind/react'
import { Entity } from 'megalodon'
import { useRouter } from 'next/router'
import { FaHashtag } from 'react-icons/fa6'

type Props = {
  hashtags: Array<Entity.Tag>
  loading: boolean
}

export default function Hashtags(props: Props) {
  const router = useRouter()

  const openTag = (tag: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, hashtag: tag, detail: true } })
  }

  return (
    <>
      <div className="overflow-x-hidden h-full w-full">
        {props.hashtags.length > 0 ? (
          <>
            {props.hashtags.map(hashtag => (
              <Hashtag key={hashtag.name} hashtag={hashtag} openTag={openTag} />
            ))}
          </>
        ) : (
          <>
            {props.loading && (
              <div className="py-4">
                <Spinner className="m-auto" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

type HashtagProps = {
  hashtag: Entity.Tag
  openTag: (tag: string) => void
}

function Hashtag(props: HashtagProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mr-2 py-1">
      <div className="flex">
        <div
          className="p2 cursor-pointer text-gray-800 dark:text-gray-200 flex items-center gap-1"
          onClick={() => props.openTag(props.hashtag.name)}
        >
          <FaHashtag />
          {props.hashtag.name}
        </div>
      </div>
    </div>
  )
}
