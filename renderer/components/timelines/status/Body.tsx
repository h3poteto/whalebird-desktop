import { Entity } from 'megalodon'
import { Dispatch, HTMLAttributes, SetStateAction } from 'react'
import emojify from '@/utils/emojify'
import { Button } from 'flowbite-react'
import { FormattedMessage } from 'react-intl'

type Props = {
  status: Entity.Status
  spoilered: boolean
  setSpoilered: Dispatch<SetStateAction<boolean>>
  onClick?: (e: any) => void
} & HTMLAttributes<HTMLElement>

export default function Body(props: Props) {
  const { spoilered, setSpoilered } = props

  const spoiler = () => {
    if (props.status.spoiler_text.length > 0) {
      return (
        <div className="raw-html">
          <div
            className="spoiler-text"
            style={Object.assign({ wordWrap: 'break-word' }, props.style)}
            dangerouslySetInnerHTML={{ __html: emojify(props.status.spoiler_text, props.status.emojis) }}
            onClick={props.onClick}
          />
          <Button size="xs" color="gray" className="focus:ring-0 my-1" onClick={() => setSpoilered(current => !current)}>
            {spoilered ? <FormattedMessage id="timeline.status.show_more" /> : <FormattedMessage id="timeline.status.show_less" />}
          </Button>
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <>
      {spoiler()}
      {!spoilered && (
        <div
          className={`${props.className} raw-html`}
          style={Object.assign({ wordWrap: 'break-word' }, props.style)}
          dangerouslySetInnerHTML={{ __html: emojify(props.status.content, props.status.emojis) }}
          onClick={props.onClick}
        />
      )}
    </>
  )
}
