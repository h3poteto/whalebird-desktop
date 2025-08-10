import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { db } from '@/db'
import { FormattedMessage } from 'react-intl'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const f = async () => {
      const accounts = await db.accounts.toArray()
      if (accounts.length > 0) {
        if (typeof localStorage !== 'undefined') {
          const lastAccount = localStorage.getItem(`lastAccount`)
          if (parseInt(lastAccount) >= 0) {
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
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p className="mb-4">
          <FormattedMessage id="main.no_accounts_title" />
        </p>
        <p className="text-sm">
          <FormattedMessage id="main.no_accounts_description" />
        </p>
      </div>
    </div>
  )
}
