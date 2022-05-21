import { Entity } from 'megalodon'
import DisplayStyle from '~/src/constants/displayStyle'
import emojify from '@/utils/emojify'

export const usernameWithStyle = (account: Entity.Account, displayNameStyle: number) => {
  switch (displayNameStyle) {
    case DisplayStyle.DisplayNameAndUsername.value:
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.acct
      }
    case DisplayStyle.DisplayName.value:
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.acct
      }
    default:
      return account.acct
  }
}

export const accountNameWithStyle = (account: Entity.Account, displayNameStyle: number) => {
  switch (displayNameStyle) {
    case DisplayStyle.DisplayNameAndUsername.value:
      return `@${account.acct}`
    default:
      return ''
  }
}
