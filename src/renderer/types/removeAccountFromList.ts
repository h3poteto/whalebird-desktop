import { Account } from 'megalodon'

export interface RemoveAccountFromList {
  account: Account,
  listId: number
}
