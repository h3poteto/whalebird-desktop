import {
  Button,
  Checkbox,
  CustomFlowbiteTheme,
  Dropdown,
  Flowbite,
  Label,
  Radio,
  Select,
  Spinner,
  TextInput,
  Textarea,
  ToggleSwitch
} from 'flowbite-react'
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FaEnvelope, FaFaceLaughBeam, FaGlobe, FaListCheck, FaLock, FaLockOpen, FaPaperPlane, FaPaperclip, FaXmark } from 'react-icons/fa6'
import { Entity, MegalodonInterface } from 'megalodon'
import { useToast } from '@/utils/toast'
import Picker from '@emoji-mart/react'
import { data } from '@/utils/emojiData'

type Props = {
  client: MegalodonInterface
  in_reply_to?: Entity.Status
}

type Poll = {
  options: Array<string>
  expires_in: number
  multiple: boolean
}

const customTheme: CustomFlowbiteTheme = {
  dropdown: {
    content: 'focus:outline-none',
    floating: {
      item: {
        base: ''
      }
    }
  }
}

export default function Compose(props: Props) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private' | 'direct'>('public')
  const [cw, setCW] = useState(false)
  const [spoiler, setSpoiler] = useState('')
  const [attachments, setAttachments] = useState<Array<Entity.Attachment | Entity.AsyncAttachment>>([])
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(false)

  const { formatMessage } = useIntl()
  const uploaderRef = useRef(null)
  const showToast = useToast()

  useEffect(() => {
    if (!cw) {
      setSpoiler('')
    }
  }, [cw])

  useEffect(() => {
    if (props.in_reply_to) {
      const f = async () => {
        const myself = await props.client.verifyAccountCredentials()
        const mentionAccounts = [props.in_reply_to.account.acct, ...props.in_reply_to.mentions.map(a => a.acct)]
          .filter((a, i, self) => self.indexOf(a) === i)
          .filter(a => a !== myself.data.username)
        setBody(`${mentionAccounts.map(m => `@${m}`).join(' ')} `)
        setVisibility(props.in_reply_to.visibility)
      }
      f()
    }
  }, [props.in_reply_to])

  const post = async () => {
    if (body.length === 0) return
    let options = { visibility: visibility }
    if (cw) {
      options = Object.assign({}, options, {
        spoiler_text: spoiler
      })
    }
    if (attachments.length > 0) {
      options = Object.assign({}, options, {
        media_ids: attachments.map(m => m.id)
      })
    }
    const sensitive = document.getElementById('sensitive') as HTMLInputElement
    if (sensitive && sensitive.checked) {
      options = Object.assign({}, options, {
        sensitive: sensitive.checked
      })
    }
    if (poll && poll.options.length > 0) {
      options = Object.assign({}, options, {
        poll: poll
      })
    }
    setLoading(true)
    try {
      await props.client.postStatus(body, options)
      reset()
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setBody('')
    setSpoiler('')
    setCW(false)
    setAttachments([])
    setPoll(null)
  }

  const selectFile = () => {
    if (uploaderRef.current) {
      uploaderRef.current.click()
    }
  }

  const fileChanged = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0)
    if (file === null || file === undefined) {
      return
    }
    if (!file.type.includes('image') && !file.type.includes('video')) {
      showToast({ text: formatMessage({ id: 'alert.validation.attachment_type' }), type: 'failure' })
      return
    }
    setLoading(true)
    try {
      const res = await props.client.uploadMedia(file)
      setAttachments(current => [...current, res.data])
    } catch {
      showToast({ text: formatMessage({ id: 'alert.upload_error' }), type: 'failure' })
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (index: number) => {
    setAttachments(current => current.filter((_, i) => i !== index))
  }

  const togglePoll = () => {
    if (poll) {
      setPoll(null)
    } else {
      setPoll(defaultPoll())
    }
  }

  const onEmojiSelect = emoji => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    const cursor = textarea.selectionStart
    if (emoji.native) {
      setBody(current => `${current.slice(0, cursor)}${emoji.native} ${current.slice(cursor)}`)
    } else if (emoji.shortcodes) {
      setBody(current => `${current.slice(0, cursor)}${emoji.shortcodes} ${current.slice(cursor)}`)
    }
  }

  return (
    <div className="px-4 pb-4">
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
        <div className="relative">
          <Textarea
            id="body"
            className="resize-none focus:ring-0"
            placeholder={formatMessage({ id: 'compose.placeholder' })}
            rows={3}
            value={body}
            onChange={ev => setBody(ev.target.value)}
          />
          <Flowbite theme={{ theme: customTheme }}>
            <Dropdown
              label=""
              dismissOnClick
              renderTrigger={() => (
                <span className="absolute top-1 right-1 text-gray-600 cursor-pointer">
                  <FaFaceLaughBeam />
                </span>
              )}
            >
              <Dropdown.Item>
                <Picker data={data} onEmojiSelect={onEmojiSelect} previewPosition="none" set="native" perLine="7" theme="light" />
              </Dropdown.Item>
            </Dropdown>
          </Flowbite>
        </div>
      </form>
      {poll && <PollForm poll={poll} setPoll={setPoll} />}
      <div className="attachments flex gap-2">
        {attachments.map((f, index) => (
          <div className="py-2 relative" key={index}>
            <button className="absolute bg-gray-600 rounded" onClick={() => removeFile(index)}>
              <FaXmark className="text-gray-200" />
            </button>
            <img src={f.preview_url} style={{ width: '80px', height: '80px' }} className="rounded-md" />
          </div>
        ))}
      </div>

      {attachments.length > 0 && (
        <div>
          <Checkbox id="sensitive" className="focus:ring-0" />
          <Label htmlFor="sensitive" className="pl-2 text-gray-600">
            <FormattedMessage id="compose.nsfw" />
          </Label>
        </div>
      )}

      <div className="w-full flex justify-between mt-1 items-center h-5">
        <div className="ml-1 flex gap-3">
          <input type="file" id="file" className="hidden" ref={uploaderRef} onChange={fileChanged} />
          <FaPaperclip className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={selectFile} />
          <FaListCheck className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={togglePoll} />
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
          {loading ? <Spinner size="sm" /> : <FaPaperPlane className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={post} />}
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

const defaultPoll = () => ({
  options: ['', ''],
  expires_in: 86400,
  multiple: false
})

type PollProps = {
  poll: Poll
  setPoll: Dispatch<SetStateAction<Poll>>
}

const PollForm = (props: PollProps) => {
  const { formatMessage } = useIntl()

  const expiresList = [
    { label: formatMessage({ id: 'compose.poll.5min' }), value: 300 },
    { label: formatMessage({ id: 'compose.poll.30min' }), value: 1800 },
    { label: formatMessage({ id: 'compose.poll.1h' }), value: 3600 },
    { label: formatMessage({ id: 'compose.poll.6h' }), value: 21600 },
    { label: formatMessage({ id: 'compose.poll.1d' }), value: 86400 },
    { label: formatMessage({ id: 'compose.poll.3d' }), value: 259200 },
    { label: formatMessage({ id: 'compose.poll.7d' }), value: 604800 }
  ]

  const addOption = () => {
    props.setPoll(current =>
      Object.assign({}, current, {
        options: [...current.options, '']
      })
    )
  }

  const removeOption = (index: number) => {
    props.setPoll(current =>
      Object.assign({}, current, {
        options: current.options.filter((_, i) => i !== index)
      })
    )
  }

  const updateOption = (index: number, value: string) => {
    props.setPoll(current =>
      Object.assign({}, current, {
        options: current.options.map((original, i) => (i === index ? value : original))
      })
    )
  }

  const changeMultiple = (value: boolean) => {
    props.setPoll(current =>
      Object.assign({}, current, {
        multiple: value
      })
    )
  }

  const changeExpire = (value: number) => {
    props.setPoll(current =>
      Object.assign({}, current, {
        expires_in: value
      })
    )
  }

  return (
    <div className="pt-1">
      {props.poll.options.map((option, index) => (
        <div className="flex items-center gap-3 py-1" key={index}>
          {props.poll.multiple ? <Checkbox disabled /> : <Radio disabled />}
          <TextInput sizing="sm" value={option} onChange={ev => updateOption(index, ev.target.value)} />
          <FaXmark className="text-gray-400 cursor-pointer" onClick={() => removeOption(index)} />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button onClick={addOption} color="light">
          <FormattedMessage id="compose.poll.add" />
        </Button>
        <Select id="expires" onChange={e => changeExpire(parseInt(e.target.value))}>
          {expiresList.map((expire, index) => (
            <option value={expire.value} key={index}>
              {expire.label}
            </option>
          ))}
        </Select>
      </div>
      <ToggleSwitch
        checked={props.poll.multiple}
        onChange={v => changeMultiple(v)}
        className="mt-2"
        label={formatMessage({ id: 'compose.poll.multiple' })}
      />
    </div>
  )
}
