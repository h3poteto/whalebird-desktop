export interface DisplayStyleType {
  name: string,
  value: number
}

export interface DisplayStyleList {
  DisplayNameAndUsername: DisplayStyleType,
  DisplayName: DisplayStyleType,
  Username: DisplayStyleType
}

declare var d: DisplayStyleList

export default d
