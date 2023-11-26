import { Entity } from 'megalodon'
import { useState } from 'react'
import { Blurhash } from 'react-blurhash'
import { FaEyeSlash } from 'react-icons/fa6'
import { FormattedMessage } from 'react-intl'

type Props = {
  media: Array<Entity.Attachment>
  sensitive: boolean
}
export default function Media(props: Props) {
  const [sensitive, setSensitive] = useState(props.sensitive)

  return (
    <div className="relative">
      {sensitive ? (
        <button className="absolute bg-gray-600 text-gray-200 top-1 left-1 p-1 rounded z-10" onClick={() => setSensitive(false)}>
          <FormattedMessage id="timeline.status.cw" />
        </button>
      ) : (
        <button className="absolute bg-gray-600 text-gray-200 top-1 left-1 p-1 rounded z-10" onClick={() => setSensitive(true)}>
          <FaEyeSlash />
        </button>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {props.media.map((media, key) => (
          <div key={key}>
            <Attachment attachment={media} sensitive={sensitive} />
          </div>
        ))}
      </div>
    </div>
  )
}

type AttachmentProps = {
  attachment: Entity.Attachment
  sensitive: boolean
}

function Attachment(props: AttachmentProps) {
  if (props.sensitive) {
    return (
      <Blurhash
        hash={props.attachment.blurhash}
        height={144}
        width={144}
        className="max-w-full rounded-md"
        style={{ marginBottom: '2px' }}
      />
    )
  } else {
    return (
      <img
        src={props.attachment.preview_url}
        className="mb-2 max-w-full cursor-pointer"
        style={{ width: '144px', height: '144px' }}
        alt={props.attachment.description}
        title={props.attachment.description}
      />
    )
  }
}
