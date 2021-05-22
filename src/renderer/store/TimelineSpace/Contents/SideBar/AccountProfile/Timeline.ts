import { GetterTree, Module } from 'vuex'
import { RootState } from '@/store'

import Posts, { PostsState } from './Timeline/Posts'
import PostsAndReplies, { PostsAndRepliesState } from './Timeline/PostsAndReplies'
import Media, { MediaState } from './Timeline/Media'
import { FilterContext } from 'megalodon'

export type TimelineState = {}

type TimelineModule = {
  Posts: PostsState
  PostsAndReplies: PostsAndRepliesState
  Media: MediaState
}

export type TimelineModuleState = TimelineModule & TimelineState

const state = (): TimelineState => ({})

const getters: GetterTree<TimelineState, RootState> = {
  filters: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.filters.filter(f => f.context.includes(FilterContext.Account) && !f.irreversible)
  }
}

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  modules: {
    Posts,
    PostsAndReplies,
    Media
  },
  state: state,
  getters: getters
}

export default Timeline
