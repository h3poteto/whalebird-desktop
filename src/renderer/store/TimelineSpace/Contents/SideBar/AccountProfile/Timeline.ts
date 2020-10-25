import { Module } from 'vuex'
import { RootState } from '@/store'

import Posts, { PostsState } from './Timeline/Posts'
import PostsAndReplies, { PostsAndRepliesState } from './Timeline/PostsAndReplies'

export type TimelineState = {}

type TimelineModule = {
  Posts: PostsState
  PostsAndReplies: PostsAndRepliesState
}

export type TimelineModuleState = TimelineModule & TimelineState

const state = (): TimelineState => ({})

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  modules: {
    Posts,
    PostsAndReplies
  },
  state: state
}

export default Timeline
