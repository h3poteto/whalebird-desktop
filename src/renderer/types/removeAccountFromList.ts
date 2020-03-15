import { Entity } from 'megalodon'

export type RemoveAccountFromList = {
  account: Entity.Account
  listId: string
}
