import { Label, Modal, TextInput, Button } from 'flowbite-react'
import generator, { MegalodonInterface, detector } from 'megalodon'
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
  const [clientId, setClientId] = useState<string>()
  const [clientSecret, setClientSecret] = useState<string>()

  const close = () => {
    setSNS(null)
    setDomain('')
    setClient(undefined)
    setClientId(undefined)
    setClientSecret(undefined)
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
    setClientId(appData.client_id)
    setClientSecret(appData.client_secret)
    global.ipc.invoke('open-browser', appData.url)
  }

  const authorize = async () => {
    const input = document.getElementById('authorization') as HTMLInputElement
    if (!client || !clientId || !clientSecret) return
    const tokenData = await client.fetchAccessToken(clientId, clientSecret, input.value)
    if (!sns) return
    const cli = generator(sns, `https://${domain}`, tokenData.access_token, 'Whalebird')
    const acct = await cli.verifyAccountCredentials()
    await db.accounts.add({
      username: acct.data.username,
      account_id: acct.data.id,
      avatar: acct.data.avatar,
      client_id: clientId,
      client_secret: clientSecret,
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
            {sns && (
              <>
                <div className="block">
                  <Label htmlFor="authorization" value="Authorization Code" />
                </div>
                <TextInput id="authorization" required type="text" />
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
