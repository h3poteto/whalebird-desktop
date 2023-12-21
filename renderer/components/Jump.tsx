import { CustomFlowbiteTheme, Flowbite, Modal, TextInput } from 'flowbite-react'
import { useRef } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { useIntl } from 'react-intl'

type Props = {
  opened: boolean
  close: () => void
}

const customTheme: CustomFlowbiteTheme = {
  textInput: {
    field: {
      input: {
        colors: {
          gray: 'bg-gray-50 border-gray-300 text-gray-900 focus:none outline-none'
        }
      }
    }
  }
}

export default function Jump(props: Props) {
  const jumpRef = useRef<HTMLInputElement>(null)
  const { formatMessage } = useIntl()

  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Modal show={props.opened} onClose={props.close} dismissible initialFocus={jumpRef}>
        <div className="p-4">
          <TextInput id="jump" ref={jumpRef} placeholder={formatMessage({ id: 'jump.placeholder' })} icon={FaMagnifyingGlass} />
          <div></div>
        </div>
      </Modal>
    </Flowbite>
  )
}
