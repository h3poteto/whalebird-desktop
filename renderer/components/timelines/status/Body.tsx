import { Entity } from 'megalodon'
import { HTMLAttributes } from 'react'
import emojify from '@/utils/emojify'

type Props = {
  status: Entity.Status
} & HTMLAttributes<HTMLElement>

export default function Body(props: Props) {
  return (
    <>
      <div
        className={props.className}
        style={Object.assign({ wordWrap: 'break-word' }, props.style)}
        dangerouslySetInnerHTML={{ __html: emojify(props.status.content, props.status.emojis) }}
      />
    </>
  )
}
