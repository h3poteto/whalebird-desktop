import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaX } from 'react-icons/fa6'
import Thread from './Thread'
import { MegalodonInterface } from 'megalodon'

type Props = {
  client: MegalodonInterface
}

export default function Detail(props: Props) {
  const [target, setTarget] = useState<'status' | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (router.query.status_id) {
      setTarget('status')
    } else {
      setTarget(null)
    }
  }, [router.query])

  const back = () => {
    router.back()
  }

  const close = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline } })
  }

  return (
    <>
      {target && (
        <div className="w-96 h-full fixed top-0 right-0 bg-white shadow-md">
          <div className="bg-blue-900 text-gray-200 flex justify-between p-2 items-center" style={{ height: '50px' }}>
            <FaChevronLeft onClick={back} className="cursor-pointer text-lg" />
            <FaX onClick={close} className="cursor-pointer text-lg" />
          </div>
          {target === 'status' && <Thread client={props.client} status_id={router.query.status_id as string} />}
        </div>
      )}
    </>
  )
}
