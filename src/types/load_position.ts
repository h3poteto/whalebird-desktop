import { Status, Account } from 'megalodon'

export interface LoadPosition {
  status: Status
}

export interface LoadPositionWithAccount extends LoadPosition {
  account: Account
}

export interface LoadPositionWithList extends LoadPosition {
  list_id: number
}
