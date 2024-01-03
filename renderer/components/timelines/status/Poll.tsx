import dayjs from 'dayjs'
import { Progress, Button, Radio, Label, Checkbox } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { HTMLAttributes } from 'react'
import { FormattedMessage } from 'react-intl'

type Props = {
  poll: Entity.Poll
  client: MegalodonInterface
  onRefresh: () => void
} & HTMLAttributes<HTMLElement>

export default function Poll(props: Props) {
  if (props.poll.voted || props.poll.expired) {
    return <PollResult {...props} />
  } else if (props.poll.multiple) {
    return <MultiplePoll {...props} />
  } else {
    return <SimplePoll {...props} />
  }
}

function SimplePoll(props: Props) {
  const vote = async () => {
    const elements = document.getElementsByName(props.poll.id)
    let checked: number | null = null
    elements.forEach((element, index) => {
      if ((element as HTMLInputElement).checked) {
        checked = index
      }
    })
    if (checked !== null) {
      await props.client.votePoll(props.poll.id, [checked])
      props.onRefresh()
    }
  }
  return (
    <div className={props.className + ' my-2'}>
      {props.poll.options.map((option, index) => (
        <div key={index} className="flex items-center gap-2 my-2 pl-1">
          <Radio id={option.title} name={props.poll.id} value={option.title} />
          <Label htmlFor={option.title}>{option.title}</Label>
        </div>
      ))}
      <div className="flex gap-2 items-center mt-2">
        <Button color="blue" outline={true} size="xs" onClick={vote}>
          <FormattedMessage id="timeline.status.poll.vote" />
        </Button>
        <div>
          <FormattedMessage id="timeline.status.poll.people" values={{ num: props.poll.votes_count }} />
        </div>
        <div>
          <time dateTime={props.poll.expires_at}>{dayjs(props.poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}</time>
        </div>
      </div>
    </div>
  )
}

function MultiplePoll(props: Props) {
  const vote = async () => {
    let checked: Array<number> = []
    props.poll.options.forEach((value, index) => {
      const element = document.getElementById(value.title) as HTMLInputElement
      if (element.checked) {
        checked = [...checked, index]
      }
    })
    if (checked.length > 0) {
      await props.client.votePoll(props.poll.id, checked)
      props.onRefresh()
    }
  }

  return (
    <div className={props.className + ' my-2'}>
      {props.poll.options.map((option, index) => (
        <div key={index} className="flex items-center gap-2 my-2 pl-1">
          <Checkbox id={option.title} />
          <Label htmlFor={option.title}>{option.title}</Label>
        </div>
      ))}
      <div className="flex gap-2 items-center mt-2">
        <Button color="blue" outline={true} size="xs" onClick={vote}>
          <FormattedMessage id="timeline.status.poll.vote" />
        </Button>
        <div>
          <FormattedMessage id="timeline.status.poll.people" values={{ num: props.poll.votes_count }} />
        </div>
        <div>
          <time dateTime={props.poll.expires_at}>{dayjs(props.poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}</time>
        </div>
      </div>
    </div>
  )
}

function PollResult(props: Props) {
  return (
    <div className={props.className + ' my-2'}>
      {props.poll.options.map((option, index) => (
        <div key={index}>
          <span className="pr-2">{percent(option.votes_count ?? 0, props.poll.votes_count)}%</span>
          <span>{option.title}</span>
          <Progress progress={percent(option.votes_count ?? 0, props.poll.votes_count)} />
        </div>
      ))}
      <div className="flex gap-2 items-center mt-2">
        <Button color="gray" outline={true} size="xs" onClick={props.onRefresh}>
          <FormattedMessage id="timeline.status.poll.refresh" />
        </Button>
        <div>
          <FormattedMessage id="timeline.status.poll.people" values={{ num: props.poll.votes_count }} />
        </div>
        {props.poll.expired ? (
          <div>
            <FormattedMessage id="timeline.status.poll.closed" />
          </div>
        ) : (
          <div>
            <time dateTime={props.poll.expires_at}>{dayjs(props.poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}</time>
          </div>
        )}
      </div>
    </div>
  )
}

const percent = (votes: number, all: number) => {
  if (all > 0) {
    return Math.round((votes * 100) / all)
  } else {
    return 0
  }
}
