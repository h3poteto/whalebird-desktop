import { invoke } from '@/utils/invoke'
import { Entity } from 'megalodon'

type Props = {
  card: Entity.Card
}

export default function Card(props: Props) {
  const openCard = () => {
    invoke('open-browser', props.card.url)
  }

  return (
    <div
      className="flex border-inherit border border-solid border-gray-200 dark:border-gray-800 rounded-md w-full cursor-pointer overflow-hidden text-ellipsis mb-1"
      onClick={openCard}
    >
      <div style={{ height: '60px', width: '60px' }}>
        <img src={props.card.image} alt={props.card.title} className="w-full h-full" />
      </div>
      <div className="px-2" style={{ height: '60px', width: 'calc(100% - 60px)' }}>
        <p className="text-ellipsis overflow-hidden w-full whitespace-nowrap">
          <strong>{props.card.title}</strong>
        </p>
        <p className="text-ellipsis overflow-hidden w-full whitespace-nowrap">{props.card.description}</p>
      </div>
    </div>
  )
}
