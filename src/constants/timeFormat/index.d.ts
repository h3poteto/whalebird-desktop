export type TimeFormatType = {
  name: string,
  value: number
}

export type TimeFormatList = {
  Absolute: TimeFormatType,
  Relative: TimeFormatType
}

declare let t: TimeFormatList

export default t
