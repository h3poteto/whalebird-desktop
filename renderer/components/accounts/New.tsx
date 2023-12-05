import { Label, Modal, TextInput, Button } from 'flowbite-react'
import generator, { MegalodonInterface, OAuth, detector } from 'megalodon'
import { useState } from 'react'
import { db } from '@/db'
import { FormattedMessage } from 'react-intl'

type NewProps = {
  opened: boolean
  close: () => void
}

export default function New(props: NewProps) {
  const [sns, setSNS] = useState<'mastodon' | 'pleroma' | 'firefish' | 'friendica' | null>(null)
  const [domain, setDomain] = useState<string>('')
  const [client, setClient] = useState<MegalodonInterface>()
  const [appData, setAppData] = useState<OAuth.AppData>()

  const close = () => {
    setSNS(null)
    setDomain('')
    setClient(undefined)
    setAppData(undefined)
    props.close()
  }

  const checkDomain = async () => {
    const input = document.getElementById('domain') as HTMLInputElement
    setDomain(input.value)
    const url = `https://${input.value}`
    const sns = await detector(url)
    setSNS(sns)
    const client = generator(sns, url)
    setClient(client)
    const appData = await client.registerApp('Whalebird', {})
    setAppData(appData)
    global.ipc.invoke('open-browser', appData.url)
  }

  const authorize = async () => {
    if (!client || !appData) return
    const input = document.getElementById('authorization') as HTMLInputElement
    let authorizationCode = null
    if (appData.session_token) {
      authorizationCode = appData.session_token
    } else {
      authorizationCode = input.value
    }
    const tokenData = await client.fetchAccessToken(appData.client_id, appData.client_secret, authorizationCode)
    if (!sns) return
    const cli = generator(sns, `https://${domain}`, tokenData.access_token, 'Whalebird')
    const acct = await cli.verifyAccountCredentials()
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
      <Modal dismissible={false} show={props.opened} onClose={close}>
        <Modal.Header>
          <FormattedMessage id="accounts.new.title" />
        </Modal.Header>
        <Modal.Body>
          <form className="flex max-w-md flex-col gap-2">
            {sns === null && (
              <>
                <div className="block">
                  <Label htmlFor="domain">
                    <FormattedMessage id="accounts.new.domain" />
                  </Label>
                </div>
                <TextInput id="domain" placeholder="mastodon.social" required type="text" />
                <Button onClick={checkDomain}>
                  <FormattedMessage id="accounts.new.sign_in" />
                </Button>
              </>
            )}
            {sns && appData && (
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

                <Button onClick={authorize}>
                  <FormattedMessage id="accounts.new.authorize" />
                </Button>
              </>
            )}
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}
