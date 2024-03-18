import { Button, Dialog, DialogBody, DialogHeader, Textarea, Typography } from '@material-tailwind/react'
import { Entity, MegalodonInterface } from 'megalodon'
import { FormattedMessage } from 'react-intl'

type Props = {
  open: boolean
  close: () => void
  status: Entity.Status
  client: MegalodonInterface
}

export default function Report(props: Props) {
  const submit = async () => {
    const comment = document.getElementById('comment') as HTMLTextAreaElement
    await props.client.report(props.status.account.id, {
      status_ids: [props.status.id],
      comment: comment.value,
      forward: true
    })
    props.close()
  }

  return (
    <Dialog open={props.open} handler={props.close} size="md">
      <DialogHeader>
        <FormattedMessage id="report.title" values={{ user: `@${props.status.account.username}` }} />
      </DialogHeader>
      <DialogBody className="max-h-full max-w-full">
        <form>
          <div className="block">
            <Typography>
              <FormattedMessage id="report.detail" />
            </Typography>
            <Textarea id="comment" rows={4} />
          </div>
          <Button className="mt-2" onClick={submit}>
            <FormattedMessage id="report.submit" />
          </Button>
        </form>
      </DialogBody>
    </Dialog>
  )
}
