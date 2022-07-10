export type VisibilityType = {
  name: string
  value: number
  key: 'public' | 'unlisted' | 'private' | 'direct'
}

export type VisibilityList = {
  Public: VisibilityType
  Unlisted: VisibilityType
  Private: VisibilityType
  Direct: VisibilityType
}

const visibilityList: VisibilityList = {
  Public: {
    name: 'settings.general.toot.visibility.public',
    value: 0,
    key: 'public'
  },
  Unlisted: {
    name: 'settings.general.toot.visibility.unlisted',
    value: 1,
    key: 'unlisted'
  },
  Private: {
    name: 'settings.general.toot.visibility.private',
    value: 2,
    key: 'private'
  },
  Direct: {
    name: 'settings.general.toot.visibility.direct',
    value: 3,
    key: 'direct'
  }
}

export default visibilityList
