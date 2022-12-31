import generator, { Entity } from 'megalodon'
import Visibility, { VisibilityType } from '~/src/constants/visibility'
import TootStatus, { StatusState } from './NewToot/Status'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import AxiosLoading from '@/utils/axiosLoading'
import {
  NewTootModalOpen,
  NewTootBlockSubmit,
  NewTootTootLength,
  NewTootAttachLength,
  NewTootMediaDescription,
  NewTootPollInvalid,
  NewTootUnknownType
} from '@/errors/validations'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

type MediaDescription = {
  id: string
  description: string
}

type TootForm = {
  status: string
  spoiler: string
  polls: Array<string>
  pollExpireSeconds: number
}

export type NewTootState = {
  modalOpen: boolean
  initialStatus: string
  initialSpoiler: string
  replyToMessage: Entity.Status | null
  quoteToMessage: Entity.Status | null
  blockSubmit: boolean
  attachedMedias: Array<Entity.Attachment>
  mediaDescriptions: { [key: string]: string | null }
  visibility: number
  sensitive: boolean
  attachedMediaCount: number
  pinedHashtag: boolean
  hashtags: Array<Entity.Tag>
  loading: boolean
}

type NewTootModule = {
  Status: StatusState
}

export type NewTootModuleState = NewTootModule & NewTootState

const state = (): NewTootState => ({
  modalOpen: false,
  initialStatus: '',
  initialSpoiler: '',
  replyToMessage: null,
  quoteToMessage: null,
  blockSubmit: false,
  attachedMedias: [],
  mediaDescriptions: {},
  visibility: Visibility.Public.value,
  sensitive: false,
  attachedMediaCount: 0,
  pinedHashtag: false,
  hashtags: [],
  loading: false
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  SET_REPLY_TO: 'setReplyTo',
  SET_QUOTE_TO: 'setQuoteTo',
  UPDATE_INITIAL_STATUS: 'updateInitialStatus',
  UPDATE_INITIAL_SPOILER: 'updateInitialSpoiler',
  CHANGE_BLOCK_SUBMIT: 'changeBlockSubmit',
  APPEND_ATTACHED_MEDIAS: 'appendAttachedMedias',
  CLEAR_ATTACHED_MEDIAS: 'clearAttachedMedias',
  REMOVE_MEDIA: 'removeMedia',
  UPDATE_MEDIA_DESCRIPTION: 'updateMediaDescription',
  CLEAR_MEDIA_DESCRIPTIONS: 'clearMediaDescriptions',
  REMOVE_MEDIA_DESCRIPTION: 'removeMediaDescription',
  CHANGE_VISIBILITY_VALUE: 'changeVisibilityValue',
  CHANGE_SENSITIVE: 'changeSensitive',
  UPDATE_MEDIA_COUNT: 'updateMediaCount',
  CHANGE_PINED_HASHTAG: 'changePinedHashtag',
  UPDATE_HASHTAGS: 'updateHashtags',
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<NewTootState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.SET_REPLY_TO]: (state, message: Entity.Status | null) => {
    state.replyToMessage = message
  },
  [MUTATION_TYPES.SET_QUOTE_TO]: (state, message: Entity.Status | null) => {
    state.quoteToMessage = message
  },
  [MUTATION_TYPES.UPDATE_INITIAL_STATUS]: (state, status: string) => {
    state.initialStatus = status
  },
  [MUTATION_TYPES.UPDATE_INITIAL_SPOILER]: (state, cw: string) => {
    state.initialSpoiler = cw
  },
  [MUTATION_TYPES.CHANGE_BLOCK_SUBMIT]: (state, value: boolean) => {
    state.blockSubmit = value
  },
  [MUTATION_TYPES.APPEND_ATTACHED_MEDIAS]: (state, media: Entity.Attachment) => {
    state.attachedMedias = state.attachedMedias.concat([media])
  },
  [MUTATION_TYPES.CLEAR_ATTACHED_MEDIAS]: state => {
    state.attachedMedias = []
  },
  [MUTATION_TYPES.REMOVE_MEDIA]: (state, media: Entity.Attachment) => {
    state.attachedMedias = state.attachedMedias.filter(m => m.id !== media.id)
  },
  [MUTATION_TYPES.UPDATE_MEDIA_DESCRIPTION]: (state, value: MediaDescription) => {
    state.mediaDescriptions[value.id] = value.description
  },
  [MUTATION_TYPES.CLEAR_MEDIA_DESCRIPTIONS]: state => {
    state.mediaDescriptions = {}
  },
  [MUTATION_TYPES.REMOVE_MEDIA_DESCRIPTION]: (state, id: string) => {
    const descriptions = state.mediaDescriptions
    delete descriptions[id]
    state.mediaDescriptions = descriptions
  },
  /**
   * changeVisibilityValue
   * Update visibility using direct value
   * @param state vuex state object
   * @param value visibility value
   */
  [MUTATION_TYPES.CHANGE_VISIBILITY_VALUE]: (state, value: number) => {
    state.visibility = value
  },
  [MUTATION_TYPES.CHANGE_SENSITIVE]: (state, value: boolean) => {
    state.sensitive = value
  },
  [MUTATION_TYPES.UPDATE_MEDIA_COUNT]: (state, count: number) => {
    state.attachedMediaCount = count
  },
  [MUTATION_TYPES.CHANGE_PINED_HASHTAG]: (state, value: boolean) => {
    state.pinedHashtag = value
  },
  [MUTATION_TYPES.UPDATE_HASHTAGS]: (state, tags: Array<Entity.Tag>) => {
    state.hashtags = tags
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  }
}

export const ACTION_TYPES = {
  SETUP_LOADING: 'setupLoading',
  TEARDOWN_LOADING: 'tearDownLoading',
  START_LOADING: 'startLoading',
  STOP_LOADING: 'stopLoading',
  UPDATE_MEDIA: 'updateMedia',
  POST_TOOT: 'postToot',
  OPEN_REPLY: 'openReply',
  OPEN_QUOTE: 'openQuote',
  OPEN_MODAL: 'openModal',
  CLOSE_MODAL: 'closeModal',
  UPLOAD_IMAGE: 'uploadImage',
  INCREMENT_MEDIA_COUNT: 'incrementMediaCount',
  DECREMENT_MEDIA_COUNT: 'decrementMediaCount',
  RESET_MEDIA_COUNT: 'resetMediaCount',
  REMOVE_MEDIA: 'removeMedia',
  UPDATE_HASHTAGS: 'updateHashtags',
  FETCH_VISIBILITY: 'fetchVisibility'
}

const axiosLoading = new AxiosLoading()

const actions: ActionTree<NewTootState, RootState> = {
  [ACTION_TYPES.SETUP_LOADING]: ({ dispatch }) => {
    axiosLoading.on('start', (_: number) => {
      dispatch('startLoading')
    })
    axiosLoading.on('done', () => {
      dispatch('stopLoading')
    })
  },
  [ACTION_TYPES.TEARDOWN_LOADING]: () => {
    axiosLoading.removeAllListeners()
  },
  [ACTION_TYPES.START_LOADING]: ({ commit, state }) => {
    if (state.modalOpen && !state.loading) {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
    }
  },
  [ACTION_TYPES.STOP_LOADING]: ({ commit, state }) => {
    if (state.modalOpen && state.loading) {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  },
  [ACTION_TYPES.UPDATE_MEDIA]: async ({ rootState }, mediaDescription: MediaDescription) => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    const attachments = Object.keys(mediaDescription).map(async id => {
      if (mediaDescription[id] !== null) {
        return client.updateMedia(id, { description: mediaDescription[id] })
      } else {
        return Promise.resolve({})
      }
    })
    return Promise.all(attachments).catch(err => {
      console.error(err)
      throw err
    })
  },
  [ACTION_TYPES.POST_TOOT]: async ({ state, commit, rootState, dispatch }, params: TootForm): Promise<Entity.Status> => {
    if (!state.modalOpen) {
      throw new NewTootModalOpen()
    }

    if (params.status.length < 1 || params.status.length > rootState.TimelineSpace.tootMax) {
      throw new NewTootTootLength()
    }

    const visibilityKey: string | undefined = Object.keys(Visibility).find(key => {
      return Visibility[key].value === state.visibility
    })
    let specifiedVisibility: 'public' | 'unlisted' | 'private' | 'direct' = Visibility.Public.key
    if (visibilityKey !== undefined) {
      specifiedVisibility = Visibility[visibilityKey].key
    }

    let form = {
      visibility: specifiedVisibility,
      sensitive: state.sensitive,
      spoiler_text: params.spoiler
    }

    if (state.replyToMessage !== null) {
      form = Object.assign(form, {
        in_reply_to_id: state.replyToMessage.id
      })
    }

    if (state.quoteToMessage !== null) {
      form = Object.assign(form, {
        quote_id: state.quoteToMessage.id
      })
    }

    if (params.polls.length > 1) {
      params.polls.forEach(poll => {
        if (poll.length < 1) {
          throw new NewTootPollInvalid()
        }
      })
      form = Object.assign(form, {
        poll: {
          expires_in: params.pollExpireSeconds,
          multiple: false,
          options: params.polls
        }
      })
    }

    if (state.blockSubmit) {
      throw new NewTootBlockSubmit()
    }

    if (state.attachedMedias.length > 0) {
      if (state.attachedMedias.length > 4) {
        throw new NewTootAttachLength()
      }
      form = Object.assign(form, {
        media_ids: state.attachedMedias.map(m => {
          return m.id
        })
      })
      // Update media descriptions
      await dispatch('updateMedia', state.mediaDescriptions).catch(_ => {
        throw new NewTootMediaDescription()
      })
    }

    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, true)
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .postStatus(params.status, form)
      .then(res => {
        win.ipcRenderer.send('toot-action-sound')
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
      })
  },
  [ACTION_TYPES.OPEN_REPLY]: ({ commit, rootState }, message: Entity.Status) => {
    commit(MUTATION_TYPES.SET_REPLY_TO, message)
    const mentionAccounts = [message.account.acct]
      .concat(message.mentions.map(a => a.acct))
      .filter((a, i, self) => self.indexOf(a) === i)
      .filter(a => a !== rootState.TimelineSpace.account!.username)
    commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, `${mentionAccounts.map(m => `@${m}`).join(' ')} `)
    commit(MUTATION_TYPES.UPDATE_INITIAL_SPOILER, message.spoiler_text)
    commit(MUTATION_TYPES.CHANGE_MODAL, true)
    let value: number = Visibility.Public.value
    Object.keys(Visibility).forEach(key => {
      const target = Visibility[key]
      if (target.key === message.visibility) {
        value = target.value
      }
    })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, value)
  },
  [ACTION_TYPES.OPEN_QUOTE]: ({ commit }, message: Entity.Status) => {
    commit(MUTATION_TYPES.SET_QUOTE_TO, message)
    commit(MUTATION_TYPES.CHANGE_MODAL, true)
  },
  [ACTION_TYPES.OPEN_MODAL]: ({ dispatch, commit, state }) => {
    if (!state.replyToMessage && state.pinedHashtag) {
      commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, state.hashtags.map(t => `#${t.name}`).join(' '))
    }
    commit(MUTATION_TYPES.CHANGE_MODAL, true)
    dispatch('fetchVisibility')
  },
  [ACTION_TYPES.CLOSE_MODAL]: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, '')
    commit(MUTATION_TYPES.UPDATE_INITIAL_SPOILER, '')
    commit(MUTATION_TYPES.SET_REPLY_TO, null)
    commit(MUTATION_TYPES.SET_QUOTE_TO, null)
    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
    commit(MUTATION_TYPES.CLEAR_ATTACHED_MEDIAS)
    commit(MUTATION_TYPES.CLEAR_MEDIA_DESCRIPTIONS)
    commit(MUTATION_TYPES.CHANGE_SENSITIVE, false)
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, Visibility.Public.value)
  },
  [ACTION_TYPES.UPLOAD_IMAGE]: async ({ commit, state, dispatch, rootState }, image: any) => {
    if (state.attachedMedias.length > 3) {
      throw new NewTootAttachLength()
    }
    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, true)
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .uploadMedia(image)
      .then(res => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
        if (res.data.type === 'unknown') throw new NewTootUnknownType()
        commit(MUTATION_TYPES.APPEND_ATTACHED_MEDIAS, res.data)
        dispatch(ACTION_TYPES.INCREMENT_MEDIA_COUNT)
        return res.data
      })
      .catch(err => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
        console.error(err)
        throw err
      })
  },
  [ACTION_TYPES.INCREMENT_MEDIA_COUNT]: ({ commit, state }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, state.attachedMediaCount + 1)
  },
  [ACTION_TYPES.DECREMENT_MEDIA_COUNT]: ({ commit, state }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, state.attachedMediaCount - 1)
  },
  [ACTION_TYPES.RESET_MEDIA_COUNT]: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, 0)
  },
  [ACTION_TYPES.REMOVE_MEDIA]: ({ commit, dispatch }, media: Entity.Attachment) => {
    commit(MUTATION_TYPES.REMOVE_MEDIA, media)
    commit(MUTATION_TYPES.REMOVE_MEDIA_DESCRIPTION, media.id)
    dispatch(ACTION_TYPES.DECREMENT_MEDIA_COUNT)
  },
  [ACTION_TYPES.UPDATE_HASHTAGS]: ({ commit, state }, tags: Array<Entity.Tag>) => {
    if (state.pinedHashtag && tags.length > 0) {
      commit(MUTATION_TYPES.UPDATE_HASHTAGS, tags)
    }
  },
  [ACTION_TYPES.FETCH_VISIBILITY]: async ({ commit, rootState }) => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    const res = await client.verifyAccountCredentials()
    const visibility: VisibilityType | undefined = (Object.values(Visibility) as Array<VisibilityType>).find(v => {
      return res.data.source !== undefined && v.key === res.data.source.privacy
    })
    if (visibility === undefined) {
      throw new Error('Visibility value is invalid')
    }
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, visibility.value)
    return res.data
  }
}

const getters: GetterTree<NewTootState, RootState> = {
  hashtagInserting: state => {
    return !state.replyToMessage && state.pinedHashtag
  }
}

const NewToot: Module<NewTootState, RootState> = {
  namespaced: true,
  modules: {
    Status: TootStatus
  },
  state: state,
  mutations: mutations,
  getters: getters,
  actions: actions
}

export default NewToot
