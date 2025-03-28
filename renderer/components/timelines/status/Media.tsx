import { Button } from '@material-tailwind/react'
import { Entity } from 'megalodon'
import { useState } from 'react'
import { FaArrowUpRightFromSquare, FaEyeSlash } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'

type Props = {
  media: Array<Entity.Attachment>
  sensitive: boolean
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}
export default function Media(props: Props) {
  const [sensitive, setSensitive] = useState(props.sensitive)
  const { formatMessage } = useIntl()

  const openMediaWindow = (url: string) => {
    window.open(url, '_blank', 'frame=false')
  }

  if (props.media.length > 0) {
    return (
      <div className="relative">
        {sensitive ? (
          <Button size="sm" onClick={() => setSensitive(false)} variant="outlined" className="my-1" color="blue-gray">
            <FormattedMessage id="timeline.status.cw" />
          </Button>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              {props.media.map((media, key) => (
                <div key={key} className="relative">
                  <button
                    className="absolute bg-gray-600 text-gray-200 top-1 left-1 p-1 rounded"
                    onClick={() => setSensitive(true)}
                    title={formatMessage({ id: 'timeline.status.hide_media' })}
                  >
                    <FaEyeSlash />
                  </button>
                  <Attachment attachment={media} openMedia={() => props.openMedia(props.media, key)} />
                  <button
                    className="absolute bg-gray-600 text-gray-200 top-1 right-1 p-1 rounded"
                    onClick={() => openMediaWindow(props.media[key].url)}
                    title={formatMessage({ id: 'timeline.status.open_media_window' })}
                  >
                    <FaArrowUpRightFromSquare />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  } else {
    return null
  }
}

type AttachmentProps = {
  attachment: Entity.Attachment
  openMedia: () => void
}

function Attachment(props: AttachmentProps) {
  return (
    <img
      src={props.attachment.preview_url}
      className="mb-2 max-w-full cursor-pointer"
      style={{ height: '144px' }}
      alt={props.attachment.description}
      title={props.attachment.description}
      onClick={props.openMedia}
    />
  )
}
