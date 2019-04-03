import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import App from '@/store/App'
import DisplayStyle from '~/src/constants/displayStyle'
import { LightTheme, DarkTheme } from '@/utils/theme'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import Language from '~/src/constants/language'
import DefaultFonts from '@/utils/fonts'

const state = () => {
  return {
    theme: LightTheme,
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    notify: {
      reply: true,
      reblog: true,
      favourite: true,
      follow: true
    },
    timeFormat: TimeFormat.Absolute.value,
    language: Language.en.key,
    defaultFonts: DefaultFonts,
    ignoreCW: false,
    ignoreNFSW: false,
    hideAllAttachments: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: App.actions,
    mutations: App.mutations
  }
}

describe('App', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        App: initStore()
      }
    })
  })

  describe('loadPreferences', () => {
    describe('error', () => {
      it('should not change', async () => {
        ipcMain.once('get-preferences', (event: any, _) => {
          event.sender.send('error-get-preferences', new Error())
        })
        await store.dispatch('App/loadPreferences')
          .catch((err) => {
            expect(err instanceof Error).toEqual(true)
            expect(store.state.App.theme).toEqual(LightTheme)
          })
      })
    })
    describe('success', () => {
      it('should be changed', async () => {
        ipcMain.once('get-preferences', (event: any, _) => {
          event.sender.send('response-get-preferences', {
            general: {
              timeline: {
                cw: true,
                nfsw: true
              }
            },
            language: {
              language: Language.en.key
            },
            notification: {
              notify: {
                reply: true,
                reblog: true,
                favourite: true,
                follow: true
              }
            },
            appearance: {
              theme: Theme.Dark.key,
              fontSize: 13,
              displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
              timeFormat: TimeFormat.Absolute.value,
              customThemeColor: LightTheme,
              font: DefaultFonts[0]
            }
          })
        })
        await store.dispatch('App/loadPreferences')
        expect(store.state.App.fontSize).toEqual(13)
        expect(store.state.App.theme).toEqual(DarkTheme)
        expect(store.state.App.ignoreCW).toEqual(true)
        expect(store.state.App.ignoreNFSW).toEqual(true)
      })
    })
  })
})
