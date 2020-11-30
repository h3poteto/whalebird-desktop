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

declare let v: VisibilityList

export default v
