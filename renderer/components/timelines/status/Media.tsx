import { Entity } from 'megalodon'

type Props = {
  media: Array<Entity.Attachment>
}
export default function Media(props: Props) {
  return (
    <div className="mt-2 flex flex-wrap">
      {props.media.map((media, key) => (
        <img
          src={media.preview_url}
          className="h-36 mr-2 mb-2 rounded-md max-w-full cursor-pointer"
          alt={media.description}
          title={media.description}
        />
      ))}
    </div>
  )
}
