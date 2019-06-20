import { Account } from 'megalodon'

export type RemoveAccountFromList = {
  account: Account
  listId: string
}
