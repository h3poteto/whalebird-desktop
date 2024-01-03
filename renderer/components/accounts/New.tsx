import { Label, Modal, TextInput, Button, Alert, Spinner } from 'flowbite-react'
import generator, { MegalodonInterface, OAuth, detector } from 'megalodon'
import { useState } from 'react'
import { db } from '@/db'
import { FormattedMessage, useIntl } from 'react-intl'

type NewProps = {
  opened: boolean
  close: () => void
}

export default function New(props: NewProps) {
  const [sns, setSNS] = useState<'mastodon' | 'pleroma' | 'firefish' | 'friendica' | null>(null)
  const [domain, setDomain] = useState<string>('')
  const [client, setClient] = useState<MegalodonInterface>()
  const [appData, setAppData] = useState<OAuth.AppData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { formatMessage } = useIntl()

  const close = () => {
    setSNS(null)
    setDomain('')
    setClient(undefined)
    setAppData(undefined)
    setError('')
    setLoading(false)
    props.close()
  }

  const checkDomain = async () => {
    setError('')
    setLoading(true)
    const input = document.getElementById('domain') as HTMLInputElement
    setDomain(input.value)
    const url = `https://${input.value}`
    const sns = await detector(url).catch(() => {
      setError(formatMessage({ id: 'accounts.new.detector_error' }, { domain: input.value }))
      return undefined
    })
    if (!sns) {
      setLoading(false)
      return
    }
    setSNS(sns)
    const client = generator(sns, url)
    setClient(client)
    const appData = await client.registerApp('Whalebird', {}).catch(() => {
      setError(formatMessage({ id: 'accounts.new.register_error' }))
      return undefined
    })
    setLoading(false)
    if (!appData) {
      return
    }
    setAppData(appData)
    global.ipc.invoke('open-browser', appData.url)
  }

  const authorize = async () => {
    setError('')
    setLoading(true)
    if (!client || !appData) return
    const input = document.getElementById('authorization') as HTMLInputElement
    let authorizationCode = null
    if (appData.session_token) {
      authorizationCode = appData.session_token
    } else {
      authorizationCode = input.value
    }
    const tokenData = await client.fetchAccessToken(appData.client_id, appData.client_secret, authorizationCode).catch(() => {
      setError(formatMessage({ id: 'accounts.new.token_error' }))
      return undefined
    })
    if (!tokenData) {
      setLoading(false)
      return
    }
    if (!sns) {
      setLoading(false)
      return
    }
    const cli = generator(sns, `https://${domain}`, tokenData.access_token, 'Whalebird')
    const acct = await cli.verifyAccountCredentials().catch(() => {
      setError(formatMessage({ id: 'accounts.new.credential_error' }))
      return undefined
    })
    setLoading(false)
    if (!acct) {
      return
    }
    await db.accounts.add({
      username: acct.data.username,
      account_id: acct.data.id,
      avatar: acct.data.avatar,
      client_id: appData.client_id,
      client_secret: appData.client_secret,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      url: `https://${domain}`,
      domain: domain,
      sns: sns
    })
    close()
  }

  return (
    <>
      <Modal dismissible={false} show={props.opened} onClose={close} size="lg">
        <Modal.Header>
          <FormattedMessage id="accounts.new.title" />
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert color="failure">
              <span>{error}</span>
            </Alert>
          )}
          <form className="flex max-w-md flex-col gap-2">
            {sns === null ? (
              <>
                <div className="block">
                  <Label htmlFor="domain">
                    <FormattedMessage id="accounts.new.domain" />
                  </Label>
                </div>
                <TextInput id="domain" placeholder="mastodon.social" required type="text" />
                <Button color="blue" onClick={checkDomain} disabled={loading}>
                  <FormattedMessage id="accounts.new.sign_in" />
                </Button>
              </>
            ) : (
              <>
                {appData ? (
                  <>
                    {appData.session_token ? (
                      <>
                        <div className="block text-gray-600">
                          <FormattedMessage id="accounts.new.without_code_authorize" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="block">
                          <Label htmlFor="authorization">
                            <FormattedMessage id="accounts.new.authorization_code" />
                          </Label>
                          <p className="text-sm text-gray-600">
                            <FormattedMessage id="accounts.new.authorization_helper" />
                          </p>
                        </div>
                        <TextInput id="authorization" required type="text" />
                      </>
                    )}

                    <Button onClick={authorize} disabled={loading}>
                      <FormattedMessage id="accounts.new.authorize" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <Spinner aria-label="Loading" />
                  </div>
                )}
              </>
            )}
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}
