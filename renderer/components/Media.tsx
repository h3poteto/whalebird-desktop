import { Modal } from 'flowbite-react'
import { Entity } from 'megalodon'

type Props = {
  open: boolean
  close: () => void
  attachment: Entity.Attachment | null
}

export default function Media(props: Props) {
  return (
    <Modal show={props.open} onClose={props.close} size="6xl">
      <Modal.Header />
      <Modal.Body className="max-h-full max-w-full">
        {props.attachment && (
          <img
            src={props.attachment.url}
            alt={props.attachment.description}
            title={props.attachment.description}
            className="object-contain max-h-full max-w-full m-auto"
          />
        )}
      </Modal.Body>
    </Modal>
  )
}
