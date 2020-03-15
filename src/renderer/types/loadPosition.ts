import { Entity } from 'megalodon'

export type LoadPosition = {
  status: Entity.Status
}

export type LoadPositionWithAccount = LoadPosition & {
  account: Entity.Account
}

export type LoadPositionWithList = LoadPosition & {
  list_id: string
}

export type LoadPositionWithTag = LoadPosition & {
  tag: string
}
