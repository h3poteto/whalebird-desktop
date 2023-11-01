import { useRouter } from 'next/router'

export default function Timeline() {
  const router = useRouter()
  return <div>{router.query.timeline}</div>
}
