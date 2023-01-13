import List, { ListState } from './Hashtag/List'
import Tag, { TagState } from './Hashtag/Tag'
import { Module } from 'vuex'
import { RootState } from '@/store'

export type HashtagState = {}

type HashtagModule = {
  List: ListState
  Tag: TagState
}

export type HashtagModuleState = HashtagModule & HashtagState

const state = (): HashtagState => ({})

const Hashtag: Module<HashtagState, RootState> = {
  namespaced: true,
  modules: {
    List,
    Tag
  },
  state: state
}

export default Hashtag
