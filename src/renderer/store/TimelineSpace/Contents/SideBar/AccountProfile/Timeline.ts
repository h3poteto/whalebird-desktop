import { Module } from 'vuex'
import { RootState } from '@/store'

import Posts, { PostsState } from './Timeline/Posts'
import PostsAndReplies, { PostsAndRepliesState } from './Timeline/PostsAndReplies'
import Media, { MediaState } from './Timeline/Media'

export type TimelineState = {}

type TimelineModule = {
  Posts: PostsState
  PostsAndReplies: PostsAndRepliesState
  Media: MediaState
}

export type TimelineModuleState = TimelineModule & TimelineState

const state = (): TimelineState => ({})

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  modules: {
    Posts,
    PostsAndReplies,
    Media
  },
  state: state
}

export default Timeline
