import { IpcMainEvent } from 'electron'
import { createLocalVue } from '@vue/test-utils'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import Vuex from 'vuex'
import { LocalTag } from '~/src/types/localTag'
import List, { ListState } from '@/store/TimelineSpace/Contents/Hashtag/List'
import { MyWindow } from '~/src/types/global'
;(window as MyWindow).ipcRenderer = ipcRenderer

const tag1: LocalTag = {
  tagName: 'tag1',
  _id: '1'
}

const tag2: LocalTag = {
  tagName: 'tag2',
  _id: '2'
}

const state = (): ListState => {
  return {
    tags: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: List.actions,
    mutations: List.mutations
  }
}

describe('Hashtag/List', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        List: initStore()
      }
    })
  })

  describe('listTags', () => {
    it('should be updated', async () => {
      ipcMain.once('list-hashtags', (event: IpcMainEvent) => {
        event.sender.send('response-list-hashtags', [tag1, tag2])
      })
      await store.dispatch('List/listTags')
      expect(store.state.List.tags).toEqual([tag1, tag2])
    })
  })

  describe('removeTag', () => {
    it('should be updated', async () => {
      ipcMain.once('remove-hashtag', async () => {
        ipcMain.once('remove-hashtag', (event: IpcMainEvent, tag: LocalTag) => {
          expect(tag).toEqual(tag1)
          event.sender.send('response-remove-hashtag')
        })
        await store.dispatch('List/removeTag', tag1)
      })
    })
  })
})
