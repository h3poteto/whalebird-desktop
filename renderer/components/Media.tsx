import { Dialog, DialogBody } from '@material-tailwind/react'
import { Entity } from 'megalodon'

type Props = {
  open: boolean
  close: () => void
  attachment: Entity.Attachment | null
}

export default function Media(props: Props) {
  return (
    <Dialog open={props.open} handler={props.close} size="lg">
      <DialogBody className="max-h-full max-w-full">
        {props.attachment && (
          <img
            src={props.attachment.url}
            alt={props.attachment.description}
            title={props.attachment.description}
            className="object-contain max-h-full max-w-full m-auto"
          />
        )}
        <></>
      </DialogBody>
    </Dialog>
  )
}
