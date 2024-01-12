import { Dialog, DialogBody, Input, List, ListItem } from '@material-tailwind/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

type Props = {
  opened: boolean
  close: () => void
}

type Timeline = {
  title: string
  path: string
}

export default function Jump(props: Props) {
  const router = useRouter()
  const { formatMessage } = useIntl()
  const [keyword, setKeyword] = useState('')
  const [match, setMatch] = useState<Array<Timeline>>([])
  const [selected, setSelected] = useState(0)
  const [timelines, setTimelines] = useState<Array<Timeline>>([])

  const inputRef = useRef<HTMLInputElement>()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (match[selected]) {
          jump(match[selected].path)
        }
      }
      if (event.key === 'ArrowUp') {
        setSelected(current => (current > 0 ? current - 1 : current))
      } else if (event.key === 'ArrowDown') {
        setSelected(current => (match[current + 1] ? current + 1 : current))
      }
    },
    [match, selected, setSelected]
  )

  useEffect(() => {
    inputRef.current?.addEventListener('keydown', handleKeyPress)

    return () => {
      inputRef.current?.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress, props.opened])

  useEffect(() => {
    if (keyword.length > 0) {
      const m = timelines
        .map(v => {
          if (v.title.toLowerCase().includes(keyword.toLowerCase())) {
            return v
          } else {
            return null
          }
        })
        .filter(v => v !== null)
      setMatch(m)
    } else {
      setMatch(timelines)
    }
  }, [keyword, timelines])

  useEffect(() => {
    setTimelines([
      { title: formatMessage({ id: 'timeline.home' }), path: `/accounts/${router.query.id}/home` },
      { title: formatMessage({ id: 'timeline.notifications' }), path: `/accounts/${router.query.id}/notifications` },
      { title: formatMessage({ id: 'timeline.local' }), path: `/accounts/${router.query.id}/local` },
      { title: formatMessage({ id: 'timeline.public' }), path: `/accounts/${router.query.id}/public` }
    ])
  }, [router.query.id])

  const jump = (path: string) => {
    props.close()
    setKeyword('')
    setSelected(0)
    console.log(path)
    router.push(path)
  }

  return (
    <Dialog open={props.opened} handler={props.close} size="sm">
      <DialogBody>
        <Input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          size="lg"
          label={formatMessage({ id: 'search.placeholder' })}
          ref={inputRef}
        />
        <List>
          {match.map((m, index) => (
            <ListItem key={index} selected={index === selected} onClick={() => jump(m.path)}>
              {m.title}
            </ListItem>
          ))}
        </List>
      </DialogBody>
    </Dialog>
  )
}
