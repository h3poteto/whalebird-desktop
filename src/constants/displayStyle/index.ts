export type DisplayStyleType = {
  name: string
  value: number
}

export type DisplayStyleList = {
  DisplayNameAndUsername: DisplayStyleType
  DisplayName: DisplayStyleType
  Username: DisplayStyleType
}

const displayStyleList: DisplayStyleList = {
  DisplayNameAndUsername: {
    name: 'preferences.appearance.display_style.display_name_and_username',
    value: 0
  },
  DisplayName: {
    name: 'preferences.appearance.display_style.display_name',
    value: 1
  },
  Username: {
    name: 'preferences.appearance.display_style.username',
    value: 2
  }
}

export default displayStyleList
