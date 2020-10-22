import { Module } from 'vuex'
import { RootState } from '@/store'

import Posts, { PostsState } from './Timeline/Posts'

export type TimelineState = {}

type TimelineModule = {
  Posts: PostsState
}

export type TimelineModuleState = TimelineModule & TimelineState

const state = (): TimelineState => ({})

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  modules: {
    Posts
  },
  state: state
}

export default Timeline
