import { useRouter } from 'next/router'

type AccountProps = {}

export default function Account(props: AccountProps) {
  const router = useRouter()
  const lastTimeline = localStorage.getItem(`${router.query.id}_lastTimeline`)
  if (lastTimeline) {
    router.push(`/accounts/${router.query.id}/${lastTimeline}`)
  } else {
    router.push(`/accounts/${router.query.id}/home`)
  }

  return <>{router.query.id}</>
}
