import { Entity, MegalodonInterface } from 'megalodon'
import { Virtuoso } from 'react-virtuoso'
import Status from '../status/Status'
import { Account } from '@/db'
import { Spinner } from '@material-tailwind/react'

type Props = {
  client: MegalodonInterface
  account: Account
  statuses: Array<Entity.Status>
  loading: boolean
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Statuses(props: Props) {
  return (
    <>
      <div className="overflow-x-hidden h-full w-full">
        {props.statuses.length > 0 ? (
          <Virtuoso
            style={{ height: '100%' }}
            data={props.statuses}
            className="timeline-scrollable"
            itemContent={(index, status) => (
              <Status
                key={index}
                client={props.client}
                account={props.account}
                status={status}
                openMedia={props.openMedia}
                onRefresh={() => {}}
                filters={[]}
              />
            )}
          />
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
