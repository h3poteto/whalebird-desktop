import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Icon from '@/assets/256x256.png'
import { db } from '@/db'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const f = async () => {
      const accounts = await db.accounts.toArray()
      if (accounts.length > 0) {
        router.push(`/accounts/${accounts[0].id}`)
      }
    }
    f()
  }, [])

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Image src={Icon} alt="icon" width={128} height={128} />
    </div>
  )
}
