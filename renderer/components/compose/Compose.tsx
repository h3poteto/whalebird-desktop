import { Dropdown, TextInput, Textarea } from 'flowbite-react'
import { Dispatch, HTMLAttributes, SetStateAction, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FaEnvelope, FaGlobe, FaListCheck, FaLock, FaLockOpen, FaPaperPlane, FaPaperclip } from 'react-icons/fa6'
import { MegalodonInterface } from 'megalodon'

type Props = {
  client: MegalodonInterface
  setComposeHeight: Dispatch<SetStateAction<number>>
} & HTMLAttributes<HTMLElement>

export default function Compose(props: Props) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private' | 'direct'>('public')
  const [cw, setCW] = useState(false)
  const [spoiler, setSpoiler] = useState('')
  const { formatMessage } = useIntl()

  useEffect(() => {
    if (cw) {
      props.setComposeHeight(162)
    } else {
      props.setComposeHeight(120)
      setSpoiler('')
    }
  }, [cw])

  const post = async () => {
    if (body.length === 0) return
    let options = { visibility: visibility }
    if (cw) {
      options = Object.assign({}, options, {
        spoiler_text: spoiler
      })
    }
    await props.client.postStatus(body, options)
    reset()
  }

  const reset = () => {
    setBody('')
    setSpoiler('')
    setCW(false)
  }

  return (
    <div style={props.style} className="pb-4">
      <div className="mx-4 mb-4">
        <form id="form">
          {cw && (
            <TextInput
              id="spoiler"
              type="text"
              sizing="sm"
              className="mb-2"
              value={spoiler}
              onChange={ev => setSpoiler(ev.target.value)}
              placeholder={formatMessage({ id: 'compose.spoiler.placeholder' })}
            />
          )}
          <Textarea
            id="body"
            className="resize-none focus:ring-0"
            placeholder={formatMessage({ id: 'compose.placeholder' })}
            rows={3}
            value={body}
            onChange={ev => setBody(ev.target.value)}
          />
        </form>
        <div className="w-full flex justify-between mt-1 items-center">
          <div className="ml-1 flex gap-3">
            <FaPaperclip className="text-gray-400 hover:text-gray-600 cursor-pointer" />
            <FaListCheck className="text-gray-400 hover:text-gray-600 cursor-pointer" />
            <Dropdown label="" dismissOnClick={true} placement="top" renderTrigger={() => visibilityIcon(visibility)}>
              <Dropdown.Item onClick={() => setVisibility('public')}>
                <FormattedMessage id="compose.visibility.public" />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setVisibility('unlisted')}>
                <FormattedMessage id="compose.visibility.unlisted" />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setVisibility('private')}>
                <FormattedMessage id="compose.visibility.private" />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setVisibility('direct')}>
                <FormattedMessage id="compose.visibility.direct" />
              </Dropdown.Item>
            </Dropdown>

            {cw ? (
              <span className="text-blue-400 hover:text-blue-600 leading-4 cursor-pointer" onClick={() => setCW(false)}>
                CW
              </span>
            ) : (
              <span className="text-gray-400 hover:text-gray-600 leading-4 cursor-pointer" onClick={() => setCW(true)}>
                CW
              </span>
            )}
          </div>
          <div className="mr-1">
            <FaPaperPlane className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={post} />
          </div>
        </div>
      </div>
    </div>
  )
}

const visibilityIcon = (visibility: 'public' | 'unlisted' | 'private' | 'direct') => {
  switch (visibility) {
    case 'public':
      return (
        <span>
          <FaGlobe className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </span>
      )
    case 'unlisted':
      return (
        <span>
          <FaLockOpen className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </span>
      )
    case 'private':
      return (
        <span>
          <FaLock className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </span>
      )
    case 'direct':
      return (
        <span>
          <FaEnvelope className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </span>
      )
  }
}
