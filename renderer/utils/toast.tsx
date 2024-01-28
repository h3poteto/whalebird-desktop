import { Alert } from '@material-tailwind/react'
import React, { useState, createContext, useContext } from 'react'

type ToastTypes = 'info' | 'success' | 'failure' | 'warning'

const ToastContext = createContext(({}: { text: string; type?: ToastTypes }) => {})
ToastContext.displayName = 'ToastContext'

export const useToast = () => {
  return useContext(ToastContext)
}

type Props = {
  children: React.ReactNode
}

export const ToastProvider: React.FC<Props> = ({ children }) => {
  const [showable, setShowable] = useState(false)
  const [toastText, setToastText] = useState('')
  const [toastType, setToastType] = useState<ToastTypes>('info')

  const showToast = ({ text, type = 'info' }: { text: string; type?: ToastTypes }) => {
    setToastText(text)
    setToastType(type)
    setShowable(true)
    setTimeout(() => {
      setShowable(false)
    }, 10000)
  }

  const color = (toastType: ToastTypes) => {
    switch (toastType) {
      case 'success':
        return 'green'
      case 'failure':
        return 'red'
      case 'warning':
        return 'amber'
      default:
        return 'blue'
    }
  }

  return (
    <ToastContext.Provider value={showToast}>
      <div className={`${showable ? 'block' : 'hidden'} fixed top-2 -translate-x-1/2`} style={{ left: '50%' }}>
        <Alert color={color(toastType)} className="w96">
          <span>{toastText}</span>
        </Alert>
      </div>
      {children}
    </ToastContext.Provider>
  )
}
