import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ImageViewer, { ImageViewerState } from '~/src/renderer/store/TimelineSpace/Modals/ImageViewer'

const state = (): ImageViewerState => {
  return {
    modalOpen: false,
    currentIndex: -1,
    mediaList: [],
    loading: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: ImageViewer.actions,
    mutations: ImageViewer.mutations,
    getters: ImageViewer.getters
  }
}

describe('ImageViewer', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        ImageViewer: initStore()
      }
    })
  })

  // Actions
  describe('openModal', () => {
    it('should be changed', () => {
      store.dispatch('ImageViewer/openModal', {
        currentIndex: 1,
        mediaList: ['media1', 'media2']
      })
      expect(store.state.ImageViewer.modalOpen).toEqual(true)
      expect(store.state.ImageViewer.currentIndex).toEqual(1)
      expect(store.state.ImageViewer.mediaList).toEqual(['media1', 'media2'])
      expect(store.state.ImageViewer.loading).toEqual(true)
    })
  })

  describe('closeModal', () => {
    beforeEach(() => {
      store.dispatch('ImageViewer/openModal', {
        currentIndex: 1,
        mediaList: ['media1', 'media2']
      })
    })
    it('should be changed', () => {
      store.dispatch('ImageViewer/closeModal')
      expect(store.state.ImageViewer.modalOpen).toEqual(false)
      expect(store.state.ImageViewer.currentIndex).toEqual(-1)
      expect(store.state.ImageViewer.mediaList).toEqual([])
      expect(store.state.ImageViewer.loading).toEqual(false)
    })
  })

  describe('incrementIndex', () => {
    it('should be changed', () => {
      store.dispatch('ImageViewer/incrementIndex')
      expect(store.state.ImageViewer.currentIndex).toEqual(0)
      expect(store.state.ImageViewer.loading).toEqual(true)
    })
  })

  describe('decrementIndex', () => {
    it('should be changed', () => {
      store.dispatch('ImageViewer/decrementIndex')
      expect(store.state.ImageViewer.currentIndex).toEqual(-2)
      expect(store.state.ImageViewer.loading).toEqual(true)
    })
  })

  // Getters
  describe('imageURL', () => {
    describe('currentIndex exists', () => {
      beforeEach(() => {
        store.dispatch('ImageViewer/openModal', {
          currentIndex: 0,
          mediaList: [
            {
              url: 'http://github.com'
            },
            {
              url: 'http://google.com'
            }
          ]
        })
      })
      it('should return url', () => {
        const url = store.getters['ImageViewer/imageURL']
        expect(url).toEqual('http://github.com')
      })
    })
  })

  describe('imageType', () => {
    describe('currentIndex exists', () => {
      beforeEach(() => {
        store.dispatch('ImageViewer/openModal', {
          currentIndex: 0,
          mediaList: [
            {
              type: 'image/png'
            },
            {
              type: 'image/jpg'
            }
          ]
        })
      })
      it('should return type', () => {
        const type = store.getters['ImageViewer/imageType']
        expect(type).toEqual('image/png')
      })
    })
  })

  describe('showLeft', () => {
    describe('currentIndex > 0', () => {
      describe('mediaList > 1', () => {
        beforeEach(() => {
          store.dispatch('ImageViewer/openModal', {
            currentIndex: 1,
            mediaList: [
              {
                type: 'image/png'
              },
              {
                type: 'image/jpg'
              }
            ]
          })
        })
        it('should return true', () => {
          const left = store.getters['ImageViewer/showLeft']
          expect(left).toEqual(true)
        })
      })
      describe('mediaList < 1', () => {
        beforeEach(() => {
          store.dispatch('ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              }
            ]
          })
        })
        it('should not return true', () => {
          const left = store.getters['ImageViewer/showLeft']
          expect(left).toEqual(false)
        })
      })
    })
  })

  describe('showRight', () => {
    describe('current index is lower than media list length', () => {
      describe('media list length > 1', () => {
        beforeEach(() => {
          store.dispatch('ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              },
              {
                type: 'image/jpeg'
              }
            ]
          })
        })
        it('should return true', () => {
          const right = store.getters['ImageViewer/showRight']
          expect(right).toEqual(true)
        })
      })
      describe('media list length <= 1', () => {
        beforeEach(() => {
          store.dispatch('ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              }
            ]
          })
        })
        it('should not return true', () => {
          const right = store.getters['ImageViewer/showRight']
          expect(right).toEqual(false)
        })
      })
    })
  })
})
