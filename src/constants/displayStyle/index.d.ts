export type DisplayStyleType = {
  name: string
  value: number
}

export type DisplayStyleList = {
  DisplayNameAndUsername: DisplayStyleType
  DisplayName: DisplayStyleType
  Username: DisplayStyleType
}

declare var d: DisplayStyleList

export default d
