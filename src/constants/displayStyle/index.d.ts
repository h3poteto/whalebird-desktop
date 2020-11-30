export type DisplayStyleType = {
  name: string
  value: number
}

export type DisplayStyleList = {
  DisplayNameAndUsername: DisplayStyleType
  DisplayName: DisplayStyleType
  Username: DisplayStyleType
}

declare let d: DisplayStyleList

export default d
