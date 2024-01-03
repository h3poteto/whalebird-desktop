import { useRouter } from 'next/router'
import { Spinner } from 'flowbite-react'

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
      <Spinner color="info" />
    </div>
  )
}
