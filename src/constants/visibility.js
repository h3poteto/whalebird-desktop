import i18n from '../config/i18n'

export default {
  Public: {
    name: i18n.t('preferences.general.visibility.public'),
    value: 0,
    key: 'public'
  },
  Unlisted: {
    name: i18n.t('preferences.general.visibility.unlisted'),
    value: 1,
    key: 'unlisted'
  },
  Private: {
    name: i18n.t('preferences.general.visibility.private'),
    value: 2,
    key: 'private'
  },
  Direct: {
    name: i18n.t('preferences.general.visibility.direct'),
    value: 3,
    key: 'direct'
  }
}
