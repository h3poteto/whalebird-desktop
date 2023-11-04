import type { AppProps } from 'next/app'
import '../app.css'
import AccountLayout from '@/components/layouts/account'
import TimelineLayout from '@/components/layouts/timelines'
import { IntlProviderWrapper } from '@/utils/i18n'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IntlProviderWrapper>
      <AccountLayout>
        <TimelineLayout>
          <Component {...pageProps} />
        </TimelineLayout>
      </AccountLayout>
    </IntlProviderWrapper>
  )
}
