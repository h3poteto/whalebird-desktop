import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  FaEnvelope,
  FaFaceLaughBeam,
  FaGlobe,
  FaListCheck,
  FaLock,
  FaLockOpen,
  FaPaperPlane,
  FaPaperclip,
  FaPencil,
  FaXmark,
  FaUsers
} from 'react-icons/fa6'
import { Entity, MegalodonInterface } from 'megalodon'
import { useToast } from '@/provider/toast'
import Picker from '@emoji-mart/react'
import { data } from '@/utils/emojiData'
import EditMedia from './EditMedia'
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  List,
  ListItem,
  Option,
  Popover,
  PopoverContent,
  PopoverHandler,
  Radio,
  Select,
  Switch,
  Textarea
} from '@material-tailwind/react'
import { Account } from '@/db'

type Props = {
  client: MegalodonInterface
  in_reply_to?: Entity.Status
  account: Account
}

type Poll = {
  options: Array<string>
  expires_in: number
  multiple: boolean
}

export default function Compose(props: Props) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private' | 'direct' | 'local'>('public')
  const [cw, setCW] = useState(false)
  const [spoiler, setSpoiler] = useState('')
  const [attachments, setAttachments] = useState<Array<Entity.Attachment | Entity.AsyncAttachment>>([])
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(false)
  const [editMedia, setEditMedia] = useState<Entity.Attachment>()
  const [maxCharacters, setMaxCharacters] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [popoverVisibility, setPopoverVisibility] = useState(false)
  const [popoverEmoji, setPopoverEmoji] = useState(false)

  const { formatMessage } = useIntl()
  const uploaderRef = useRef(null)
  const showToast = useToast()
  const textareaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.client) return
    const f = async () => {
      const instance = await props.client.getInstance()
      if (instance.data.configuration.statuses.max_characters) {
        setMaxCharacters(instance.data.configuration.statuses.max_characters)
      }
    }
    f()
  }, [props.client])

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

  useEffect(() => {
    if (maxCharacters) {
      setRemaining(maxCharacters - body.length - spoiler.length)
    }
  }, [maxCharacters, body, spoiler])

  const post = async () => {
    if (props.account.sns !== 'pixelfed' && body.length === 0) return
    if (props.account.sns === 'pixelfed' && attachments.length === 0) {
      showToast({ text: formatMessage({ id: 'alert.validation.attachment_required' }), type: 'failure' })
      return
    }
    let options = { visibility: visibility }
    if (props.in_reply_to) {
      options = Object.assign({}, options, {
        in_reply_to_id: props.in_reply_to.id
      })
    }
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
    } catch (err) {
      console.error(err)
      showToast({ text: formatMessage({ id: 'alert.compose.post_failed' }), type: 'failure' })
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
    setMaxCharacters(null)
  }

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey === true && event.key === 'Enter') || (event.metaKey === true && event.key === 'Enter')) {
        post()
      }
    },
    [post]
  )

  useEffect(() => {
    textareaRef.current?.addEventListener('keydown', handleKeyPress)

    return () => {
      textareaRef.current?.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

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
    if (attachments.length >= 4) {
      showToast({ text: formatMessage({ id: 'alert.validation.attachment_length' }, { limit: 4 }), type: 'failure' })
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

  const openDescription = (index: number) => {
    setEditMedia(attachments[index])
  }

  const closeDescription = () => {
    setEditMedia(undefined)
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
    setPopoverEmoji(false)
  }

  return (
    <div className="px-4 pb-4">
      <form id="form">
        {cw && (
          <Input
            id="spoiler"
            type="text"
            color="blue-gray"
            containerProps={{ className: 'mb-2' }}
            value={spoiler}
            className="placeholder:opacity-100"
            onChange={ev => setSpoiler(ev.target.value)}
            placeholder={formatMessage({ id: 'compose.spoiler.placeholder' })}
          />
        )}
        <div className="relative">
          <Textarea
            id="body"
            color="blue-gray"
            className="resize-none focus:ring-0"
            placeholder={formatMessage({ id: 'compose.placeholder' })}
            rows={3}
            value={body}
            onChange={ev => setBody(ev.target.value)}
            ref={textareaRef}
          />
          <Popover open={popoverEmoji} handler={setPopoverEmoji}>
            <PopoverHandler>
              <button
                className="absolute top-1 right-1 text-gray-600 cursor-pointer"
                type="button"
                title={formatMessage({ id: 'compose.emoji' })}
              >
                <FaFaceLaughBeam />
              </button>
            </PopoverHandler>
            <PopoverContent>
              <Picker data={data} onEmojiSelect={onEmojiSelect} previewPosition="none" set="native" perLine="7" theme="light" />
            </PopoverContent>
          </Popover>
        </div>
      </form>
      {poll && <PollForm poll={poll} setPoll={setPoll} />}
      <div className="attachments flex gap-2">
        {attachments.map((f, index) => (
          <div className="py-2 relative" key={index}>
            <button className="absolute bg-gray-600 rounded" onClick={() => removeFile(index)}>
              <FaXmark className="text-gray-200" />
            </button>
            <button className="absolute right-0 bg-gray-600 rounded" onClick={() => openDescription(index)}>
              <FaPencil className="text-gray-200" />
            </button>
            <img src={f.preview_url} style={{ width: '80px', height: '80px' }} className="rounded-md" />
          </div>
        ))}
      </div>

      {attachments.length > 0 && (
        <div>
          <Checkbox id="sensitive" label={formatMessage({ id: 'compose.nsfw' })} />
        </div>
      )}

      <div className="w-full flex justify-between mt-1 items-center h-5">
        <div className="ml-1 flex gap-3">
          <input type="file" id="file" className="hidden" ref={uploaderRef} onChange={fileChanged} />
          <IconButton
            variant="text"
            size="sm"
            onClick={selectFile}
            className="text-gray-400 hover:text-gray-600 text-base"
            title={formatMessage({ id: 'compose.actions.attachment' })}
          >
            <FaPaperclip />
          </IconButton>
          <IconButton
            variant="text"
            size="sm"
            onClick={togglePoll}
            className="text-gray-400 hover:text-gray-600 text-base"
            title={formatMessage({ id: 'compose.actions.poll' })}
          >
            <FaListCheck />
          </IconButton>
          <Popover open={popoverVisibility} handler={setPopoverVisibility}>
            <PopoverHandler>{visibilityIcon(visibility, formatMessage({ id: 'compose.actions.visibility' }))}</PopoverHandler>
            <PopoverContent>
              <List>
                <ListItem
                  onClick={() => {
                    setVisibility('public')
                    setPopoverVisibility(false)
                  }}
                >
                  <FormattedMessage id="compose.visibility.public" />
                </ListItem>
                <ListItem
                  onClick={() => {
                    setVisibility('local')
                    setPopoverVisibility(false)
                  }}
                >
                  <FormattedMessage id="compose.visibility.local" />
                </ListItem>
                <ListItem
                  onClick={() => {
                    setVisibility('unlisted')
                    setPopoverVisibility(false)
                  }}
                >
                  <FormattedMessage id="compose.visibility.unlisted" />
                </ListItem>
                <ListItem
                  onClick={() => {
                    setVisibility('private')
                    setPopoverVisibility(false)
                  }}
                >
                  <FormattedMessage id="compose.visibility.private" />
                </ListItem>
                <ListItem
                  onClick={() => {
                    setVisibility('direct')
                    setPopoverVisibility(false)
                  }}
                >
                  <FormattedMessage id="compose.visibility.direct" />
                </ListItem>
              </List>
            </PopoverContent>
          </Popover>

          {cw ? (
            <IconButton variant="text" size="sm" className="theme-enabled leading-4 text-base" onClick={() => setCW(false)}>
              CW
            </IconButton>
          ) : (
            <IconButton
              variant="text"
              size="sm"
              className="text-gray-400 hover:text-gray-600 leading-4 text-base"
              onClick={() => setCW(true)}
              title={formatMessage({ id: 'compose.actions.cw' })}
            >
              CW
            </IconButton>
          )}
        </div>
        <div className="mr-1 flex items-center gap-2">
          <span className="text-gray-400">{remaining}</span>
          <IconButton disabled={loading} onClick={post} variant="text" size="sm" title={formatMessage({ id: 'compose.actions.post' })}>
            <FaPaperPlane className="text-base text-gray-600" />
          </IconButton>
        </div>
      </div>
      <EditMedia media={editMedia} close={closeDescription} client={props.client} />
    </div>
  )
}

const visibilityIcon = (visibility: 'public' | 'unlisted' | 'private' | 'direct' | 'local', title: string) => {
  switch (visibility) {
    case 'public':
      return (
        <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600  text-base" title={title}>
          <FaGlobe />
        </IconButton>
      )
    case 'unlisted':
      return (
        <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600 text-base" title={title}>
          <FaLockOpen />
        </IconButton>
      )
    case 'private':
      return (
        <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600  text-base" title={title}>
          <FaLock />
        </IconButton>
      )
    case 'direct':
      return (
        <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600 text-base" title={title}>
          <FaEnvelope />
        </IconButton>
      )
    case 'local':
      return (
        <IconButton variant="text" size="sm" className="text-gray-400 hover:text-gray-600 text-base" title={title}>
          <FaUsers />
        </IconButton>
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

  const changeMultiple = (ev: ChangeEvent<HTMLInputElement>) => {
    console.log(ev)
    props.setPoll(current =>
      Object.assign({}, current, {
        multiple: ev.target.checked
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
          {props.poll.multiple ? (
            <Checkbox disabled containerProps={{ className: 'p-1' }} />
          ) : (
            <Radio disabled containerProps={{ className: 'p-1' }} />
          )}
          <Input
            type="text"
            color="blue-gray"
            value={option}
            onChange={ev => updateOption(index, ev.target.value)}
            containerProps={{ className: 'h-8' }}
          />
          <FaXmark className="text-gray-400 cursor-pointer" onClick={() => removeOption(index)} />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button onClick={addOption} size="sm" color="indigo" variant="outlined">
          <FormattedMessage id="compose.poll.add" />
        </Button>
        <Select
          id="expires"
          color="blue-gray"
          value={`${props.poll.expires_in}`}
          onChange={e => changeExpire(parseInt(e))}
          containerProps={{ className: 'h-8' }}
        >
          {expiresList.map((expire, index) => (
            <Option value={`${expire.value}`} key={index}>
              {expire.label}
            </Option>
          ))}
        </Select>
      </div>
      <div className="mt-2">
        <Switch checked={props.poll.multiple} onChange={v => changeMultiple(v)} label={formatMessage({ id: 'compose.poll.multiple' })} />
      </div>
    </div>
  )
}
