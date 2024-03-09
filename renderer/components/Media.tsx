import { Button, Dialog, DialogBody } from '@material-tailwind/react'
import { Entity } from 'megalodon'
import { useState, useEffect, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

type Props = {
  open: boolean
  close: () => void
  index: number
  media: Array<Entity.Attachment>
}

export default function Media(props: Props) {
  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    setIndex(props.index)
  }, [props.index])

  const next = useCallback(() => {
    if (index >= props.media.length - 1) {
      return
    }
    setIndex(current => current + 1)
  }, [props.media, index, setIndex])

  const previous = useCallback(() => {
    if (index <= 0) {
      return
    }
    setIndex(current => current - 1)
  }, [props.media, index, setIndex])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (props.open) {
        if (event.key === 'ArrowLeft') {
          previous()
        } else if (event.key === 'ArrowRight') {
          next()
        }
      }
    },
    [props.open, previous, next]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <Dialog open={props.open} handler={props.close} size="lg">
      <DialogBody className="max-h-full max-w-full">
        <div className="flex">
          <Button variant="text" onClick={previous} disabled={index < 1}>
            <FaChevronLeft />
          </Button>
          {props.media[index] && (
            <img
              src={props.media[index].url}
              alt={props.media[index].description}
              title={props.media[index].description}
              className="object-contain max-h-full m-auto"
              style={{ maxWidth: '85%' }}
            />
          )}
          <Button variant="text" onClick={next} disabled={index >= props.media.length - 1}>
            <FaChevronRight />
          </Button>
        </div>
      </DialogBody>
    </Dialog>
  )
}
