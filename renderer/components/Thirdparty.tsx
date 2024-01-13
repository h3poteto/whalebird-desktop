import { Dialog, DialogBody, DialogHeader, List, ListItem } from '@material-tailwind/react'
import { FormattedMessage } from 'react-intl'
import licenses from '../thirdparty.json'

type Props = {
  opened: boolean
  close: () => void
}

export default function Thirdparty(props: Props) {
  return (
    <Dialog open={props.opened} handler={props.close} size="md">
      <DialogHeader>
        <FormattedMessage id="thirdparty.title" />
      </DialogHeader>
      <DialogBody className="h-[42rem] overflow-scroll timeline-scrollable">
        <List>
          {Object.keys(licenses).map(key => (
            <ListItem key={key} className="flex justify-between">
              <div>{key}</div>
              <div>{licenses[key].licenses}</div>
            </ListItem>
          ))}
        </List>
      </DialogBody>
    </Dialog>
  )
}
