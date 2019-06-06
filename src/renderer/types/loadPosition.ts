import { Status, Account } from 'megalodon'

export type LoadPosition = {
  status: Status
}

export type LoadPositionWithAccount = LoadPosition & {
  account: Account
}

export type LoadPositionWithList = LoadPosition & {
  list_id: string
}

export type LoadPositionWithTag = LoadPosition & {
  tag: string
}
