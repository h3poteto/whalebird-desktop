import generator, { MegalodonInterface, OAuth, detector } from 'megalodon'
import { useCallback, useEffect, useRef, useState } from 'react'
import { db } from '@/db'
import { FormattedMessage, useIntl } from 'react-intl'
import { Alert, Button, Dialog, DialogBody, DialogHeader, Input, Spinner, Typography } from '@material-tailwind/react'
import { invoke } from '@/utils/invoke'

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
  const domainFormRef = useRef<HTMLFormElement>(null)
  const authorizeFormRef = useRef<HTMLFormElement>(null)

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
    invoke('open-browser', appData.url)
  }

  const handleDomainSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault()
      checkDomain()
    },
    [checkDomain]
  )

  useEffect(() => {
    domainFormRef.current?.addEventListener('submit', handleDomainSubmit)

    return () => {
      domainFormRef.current?.removeEventListener('submit', handleDomainSubmit)
    }
  }, [props.opened, sns])

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

  const handleAuthorizeSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault()
      authorize()
    },
    [authorize]
  )

  useEffect(() => {
    authorizeFormRef.current?.addEventListener('submit', handleAuthorizeSubmit)

    return () => {
      authorizeFormRef.current?.removeEventListener('submit', handleAuthorizeSubmit)
    }
  }, [props.opened, appData])

  return (
    <>
      <Dialog open={props.opened} handler={close} size="xs">
        <DialogHeader>
          <FormattedMessage id="accounts.new.title" />
        </DialogHeader>
        <DialogBody>
          {error && (
            <Alert color="red">
              <span>{error}</span>
            </Alert>
          )}
          <div>
            {sns === null ? (
              <form className="flex max-w-md flex-col gap-2" ref={domainFormRef}>
                <div className="block">
                  <Typography>
                    <FormattedMessage id="accounts.new.domain" />
                  </Typography>
                </div>
                <Input type="text" color="blue-gray" id="domain" placeholder="mastodon.social" />
                <Button onClick={checkDomain} loading={loading} color="blue">
                  <FormattedMessage id="accounts.new.sign_in" />
                </Button>
              </form>
            ) : (
              <>
                {appData ? (
                  <form className="flex max-w-md flex-col gap-2" ref={authorizeFormRef}>
                    {appData.session_token ? (
                      <>
                        <div className="block text-gray-600">
                          <FormattedMessage id="accounts.new.without_code_authorize" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="block">
                          <Typography>
                            <FormattedMessage id="accounts.new.authorization_code" />
                          </Typography>
                          <Typography variant="small">
                            <FormattedMessage id="accounts.new.authorization_helper" />
                          </Typography>
                        </div>
                        <Input id="authorization" color="blue-gray" type="text" />
                      </>
                    )}

                    <Button onClick={authorize} disabled={loading} color="blue">
                      <FormattedMessage id="accounts.new.authorize" />
                    </Button>
                  </form>
                ) : (
                  <div className="text-center pt-2">
                    <Spinner className="m-auto" />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogBody>
      </Dialog>
    </>
  )
}
