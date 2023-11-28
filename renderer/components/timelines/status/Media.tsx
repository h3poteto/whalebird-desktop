import { Button } from 'flowbite-react'
import { Entity } from 'megalodon'
import { useState } from 'react'
import { FaEyeSlash } from 'react-icons/fa6'
import { FormattedMessage } from 'react-intl'

type Props = {
  media: Array<Entity.Attachment>
  sensitive: boolean
}
export default function Media(props: Props) {
  const [sensitive, setSensitive] = useState(props.sensitive)

  if (props.media.length > 0) {
    return (
      <div className="relative">
        {sensitive ? (
          <Button size="xs" color="gray" className="focus:ring-0 my-1" onClick={() => setSensitive(false)}>
            <FormattedMessage id="timeline.status.cw" />
          </Button>
        ) : (
          <>
            <button className="absolute bg-gray-600 text-gray-200 top-1 left-1 p-1 rounded z-10" onClick={() => setSensitive(true)}>
              <FaEyeSlash />
            </button>
            <div className="mt-2 flex flex-wrap gap-2">
              {props.media.map((media, key) => (
                <div key={key}>
                  <Attachment attachment={media} />
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
}

function Attachment(props: AttachmentProps) {
  return (
    <img
      src={props.attachment.preview_url}
      className="mb-2 max-w-full cursor-pointer"
      style={{ height: '144px' }}
      alt={props.attachment.description}
      title={props.attachment.description}
    />
  )
}
