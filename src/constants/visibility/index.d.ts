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

declare var v: VisibilityList

export default v
