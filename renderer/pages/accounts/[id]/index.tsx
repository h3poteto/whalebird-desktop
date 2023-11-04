import { useRouter } from 'next/router'
import Image from 'next/image'
import Icon from '@/assets/256x256.png'

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
      <Image src={Icon} alt="icon" width={128} height={128} />
    </div>
  )
}
