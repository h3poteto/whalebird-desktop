import type { AppProps } from 'next/app'
import '../app.css'
import AccountLayout from '@/components/layouts/account'
import TimelineLayout from '@/components/layouts/timelines'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AccountLayout>
      <TimelineLayout>
        <Component {...pageProps} />
      </TimelineLayout>
    </AccountLayout>
  )
}
