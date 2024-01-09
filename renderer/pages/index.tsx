import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { db } from '@/db'
import { Spinner } from '@material-tailwind/react'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const f = async () => {
      const accounts = await db.accounts.toArray()
      if (accounts.length > 0) {
        if (typeof localStorage !== 'undefined') {
          const lastAccount = localStorage.getItem(`lastAccount`)
          if (lastAccount) {
            router.push(`/accounts/${lastAccount}`)
          } else {
            router.push(`/accounts/${accounts[0].id}`)
          }
        } else {
          router.push(`/accounts/${accounts[0].id}`)
        }
      }
    }
    f()
  }, [])

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Spinner />
    </div>
  )
}
