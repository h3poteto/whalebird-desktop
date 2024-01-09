import { Spinner } from '@material-tailwind/react'
import { useRouter } from 'next/router'

export default function Account() {
  const router = useRouter()
  if (typeof localStorage !== 'undefined') {
    const lastTimeline = localStorage.getItem(`${router.query.id}_lastTimeline`)
    if (lastTimeline) {
      router.push(`/accounts/${router.query.id}/${lastTimeline}`)
    } else {
      router.push(`/accounts/${router.query.id}/home`)
    }
  }

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Spinner />
    </div>
  )
}
