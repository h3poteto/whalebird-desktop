import { IpcMainInvokeEvent } from 'electron'
import { createStore, Store } from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import { LocalTag } from '~/src/types/localTag'
import List, { ListState } from '@/store/TimelineSpace/Contents/Hashtag/List'
import { MyWindow } from '~/src/types/global'
import { RootState } from '@/store'
;(window as any as MyWindow).ipcRenderer = ipcRenderer

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

const hashtagStore = () => ({
  namespaced: true,
  modules: {
    List: initStore()
  }
})

const contentsStore = () => ({
  namespaced: true,
  modules: {
    Hashtag: hashtagStore()
  }
})

const sideMenuStore = {
  namespaced: true,
  actions: {
    listTags: jest.fn()
  }
}

const timelineStore = () => ({
  namespaced: true,
  modules: {
    SideMenu: sideMenuStore,
    Contents: contentsStore()
  }
})

describe('Hashtag/List', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore()
      }
    })
  })

  describe('listTags', () => {
    it('should be updated', async () => {
      ipcMain.handle('list-hashtags', () => {
        return [tag1, tag2]
      })
      afterEach(() => {
        ipcMain.removeHandler('list-hashtags')
      })
      await store.dispatch('TimelineSpace/Contents/Hashtag/List/listTags')
      expect(store.state.TimelineSpace.Contents.Hashtag.List.tags).toEqual([tag1, tag2])
    })
  })

  describe('removeTag', () => {
    it('should be updated', async () => {
      ipcMain.handle('remove-hashtag', (_: IpcMainInvokeEvent, tag: LocalTag) => {
        expect(tag).toEqual(tag1)
      })
      await store.dispatch('TimelineSpace/Contents/Hashtag/List/removeTag', tag1)
    })
  })
})
