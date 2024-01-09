import { Button, Dialog, DialogBody, DialogHeader, Textarea, Typography } from '@material-tailwind/react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'

type Props = {
  media: Entity.Attachment | undefined
  close: () => void
  client: MegalodonInterface
}

export default function EditMedia(props: Props) {
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (props.media) {
      const f = async () => {
        const res = await props.client.getMedia(props.media.id)
        if (res.data.description) {
          setDescription(res.data.description)
        }
      }
      f()
    }
  }, [props.media, props.client])

  const submit = async () => {
    if (!props.media || !props.client) return
    await props.client.updateMedia(props.media.id, {
      description: description
    })
  }

  const onClose = () => {
    setDescription('')
    props.close()
  }

  return (
    <Dialog open={props.media !== undefined} handler={onClose} size="xl">
      {props.media && (
        <>
          <DialogHeader>
            <FormattedMessage id="compose.edit_media.title" />
          </DialogHeader>
          <DialogBody className="max-h-full max-w-full">
            <div className="flex gap-2">
              <div className="w-1/4">
                <Typography>
                  <FormattedMessage id="compose.edit_media.label" />
                </Typography>
                <Textarea id="description" rows={4} value={description} onChange={ev => setDescription(ev.target.value)} />
                <Button className="mt-2" onClick={submit}>
                  <FormattedMessage id="compose.edit_media.submit" />
                </Button>
              </div>
              <div className="w-3/4">
                <img src={props.media.preview_url} className="object-cover m-auto" />
              </div>
            </div>
          </DialogBody>
        </>
      )}
      <></>
    </Dialog>
  )
}
