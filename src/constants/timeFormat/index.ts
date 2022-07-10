export type TimeFormatType = {
  name: string
  value: number
}

export type TimeFormatList = {
  Absolute: TimeFormatType
  Relative: TimeFormatType
}

const timeFormatList: TimeFormatList = {
  Absolute: {
    name: 'preferences.appearance.time_format.absolute',
    value: 0
  },
  Relative: {
    name: 'preferences.appearance.time_format.relative',
    value: 1
  }
}

export default timeFormatList
