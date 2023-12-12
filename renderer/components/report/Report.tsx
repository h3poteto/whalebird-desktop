import { Button, Label, Modal, Textarea } from 'flowbite-react'
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
    <Modal show={props.open} onClose={props.close} size="xl">
      <Modal.Header>
        <FormattedMessage id="report.title" values={{ user: `@${props.status.account.username}` }} />
      </Modal.Header>
      <Modal.Body className="max-h-full max-w-full">
        <form>
          <div className="block">
            <Label htmlFor="comment">
              <FormattedMessage id="report.detail" />
            </Label>
            <Textarea id="comment" rows={4} />
          </div>
          <Button className="mt-2" onClick={submit}>
            <FormattedMessage id="report.submit" />
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  )
}
