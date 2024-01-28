import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'

type UnreadsType = { [key: string]: number }

type Context = {
  unreads: UnreadsType
  setUnreads: Dispatch<SetStateAction<UnreadsType>>
}

const UnreadsContext = createContext<Context>({
  unreads: {},
  setUnreads: (_: UnreadsType) => {}
})

UnreadsContext.displayName = 'UnreadsContext'

export const useUnreads = () => {
  return useContext(UnreadsContext)
}

type Props = {
  children: React.ReactNode
}

export const UnreadsProvider: React.FC<Props> = ({ children }) => {
  const [unreads, setUnreads] = useState<UnreadsType>({})

  return <UnreadsContext.Provider value={{ unreads, setUnreads }}>{children}</UnreadsContext.Provider>
}
