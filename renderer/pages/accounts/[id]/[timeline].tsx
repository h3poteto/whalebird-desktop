import { useRouter } from 'next/router'
import Timeline from '@/components/timelines/Timeline'
import { useEffect, useState } from 'react'
import { Account, db } from '@/db'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import Notifications from '@/components/timelines/Notifications'
import Media from '@/components/Media'
import Report from '@/components/report/Report'

export default function Page() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [client, setClient] = useState<MegalodonInterface>(null)
  const [attachment, setAttachment] = useState<Entity.Attachment | null>(null)
  const [report, setReport] = useState<Entity.Status | null>(null)

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

  if (!account || !client) return null
  switch (router.query.timeline as string) {
    case 'notifications': {
      return <Notifications account={account} client={client} setAttachment={setAttachment} />
    }
    default: {
      return (
        <>
          <Timeline timeline={router.query.timeline as string} account={account} client={client} setAttachment={setAttachment} />
          <Media open={attachment !== null} close={() => setAttachment(null)} attachment={attachment} />
          {report && <Report open={report !== null} close={() => setReport(null)} status={report} client={client} />}
        </>
      )
    }
  }
}
