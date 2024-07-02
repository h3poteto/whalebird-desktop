import { useRouter } from 'next/router'
import Timeline from '@/components/timelines/Timeline'
import { useEffect, useReducer, useState } from 'react'
import { Account, db } from '@/db'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import Notifications from '@/components/timelines/Notifications'
import Search from '@/components/timelines/Search'
import Media from '@/components/Media'
import Report from '@/components/report/Report'

export default function Page() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [client, setClient] = useState<MegalodonInterface>(null)
  const [report, setReport] = useState<Entity.Status | null>(null)

  const [modalState, dispatch] = useReducer(modalReducer, initialModalState)

  useEffect(() => {
    if (router.query.id) {
      if (router.query.id && typeof localStorage !== 'undefined') {
        localStorage.setItem('lastAccount', router.query.id as string)
      }
      const f = async () => {
        const a = await db.accounts.get(parseInt(router.query.id as string))
        if (a) {
          setAccount(a)
          const c = generator(a.sns, a.url, a.access_token, 'Whalebird')
          setClient(c)
        }
      }
      f()
    }
  }, [router.query.id])

  useEffect(() => {
    if (router.query.timeline && router.query.id && typeof localStorage !== 'undefined') {
      localStorage.setItem(`${router.query.id}_lastTimeline`, router.query.timeline as string)
    }
  }, [router.query.id, router.query.timeline])

  useEffect(() => {
    if (router.query.modal && router.query.report_target_id) {
      const f = async () => {
        const res = await client.getStatus(router.query.report_target_id as string)
        setReport(res.data)
      }
      f()
    }
  }, [router.query.modal, router.query.report_target_id])

  const closeReport = () => {
    setReport(null)
    router.push({
      query: Object.assign({}, router.query, {
        report_target_id: null
      })
    })
  }

  if (!account || !client) return null
  return (
    <>
      {(router.query.timeline as string) === 'notifications' ? (
        <Notifications
          account={account}
          client={client}
          openMedia={(media: Array<Entity.Attachment>, index: number) =>
            dispatch({ target: 'media', value: true, object: media, index: index })
          }
        />
      ) : (
        <>
          {(router.query.timeline as string) === 'search' ? (
            <Search
              client={client}
              account={account}
              openMedia={(media: Array<Entity.Attachment>, index: number) =>
                dispatch({ target: 'media', value: true, object: media, index: index })
              }
            />
          ) : (
            <Timeline
              timeline={router.query.timeline as string}
              account={account}
              client={client}
              openMedia={(media: Array<Entity.Attachment>, index: number) =>
                dispatch({ target: 'media', value: true, object: media, index: index })
              }
            />
          )}
        </>
      )}
      <Media
        open={modalState.media.opened}
        close={() => dispatch({ target: 'media', value: false, object: [], index: -1 })}
        media={modalState.media.object}
        index={modalState.media.index}
      />
      {report && <Report open={report !== null} close={closeReport} status={report} client={client} />}
    </>
  )
}

type ModalState = {
  media: {
    opened: boolean
    object: Array<Entity.Attachment>
    index: number
  }
}

const initialModalState: ModalState = {
  media: {
    opened: false,
    object: [],
    index: 0
  }
}

const modalReducer = (current: ModalState, action: { target: string; value: boolean; object?: any; index?: number }): ModalState => {
  switch (action.target) {
    case 'media':
      return { ...current, media: { opened: action.value, object: action.object, index: action.index } }
    default:
      return current
  }
}
