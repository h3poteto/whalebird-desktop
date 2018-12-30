import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Theme from '~/src/constants/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme, DarkTheme } from '~/src/renderer/utils/theme'
import DefaultFonts from '@/utils/fonts'
import Appearance from '@/store/Preferences/Appearance'
import { ipcMain } from '~/spec/mock/electron'

const state = {
  appearance: {
    theme: Theme.Light.key,
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    timeFormat: TimeFormat.Absolute.value,
    customThemeColor: LightTheme,
    font: DefaultFonts[0]
  },
  fonts: []
}

const Preferences = {
  namespaced: true,
  state: state,
  actions: Appearance.actions,
  mutations: Appearance.mutations
}

const App = {
  namespaced: true,
  actions: {
    loadPreferences: jest.fn()
  }
}

describe('Preferences/Appearance', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Preferences,
        App
      }
    })
    ipcMain.once('update-preferences', (event, config) => {
      event.sender.send('response-update-preferences', config)
    })
  })

  it('updateTheme', async () => {
    await store.dispatch('Preferences/updateTheme', Theme.Dark.key)
    expect(store.state.Preferences.appearance.theme).toEqual(Theme.Dark.key)
    expect(App.actions.loadPreferences).toBeCalled()
  })

  it('updateFontSize', async () => {
    await store.dispatch('Preferences/updateFontSize', 15)
    expect(store.state.Preferences.appearance.fontSize).toEqual(15)
    expect(App.actions.loadPreferences).toBeCalled()
  })

  it('updateDisplayNameStyle', async () => {
    await store.dispatch('Preferences/updateDisplayNameStyle', DisplayStyle.DisplayName.value)
    expect(store.state.Preferences.appearance.displayNameStyle).toEqual(DisplayStyle.DisplayName.value)
    expect(App.actions.loadPreferences).toBeCalled()
  })

  it('updateTimeFormat', async () => {
    await store.dispatch('Preferences/updateTimeFormat', TimeFormat.Relative.value)
    expect(store.state.Preferences.appearance.timeFormat).toEqual(TimeFormat.Relative.value)
    expect(App.actions.loadPreferences).toBeCalled()
  })

  it('updateCustomThemeColor', async () => {
    await store.dispatch('Preferences/updateCustomThemeColor', DarkTheme)
    expect(store.state.Preferences.appearance.customThemeColor).toEqual(DarkTheme)
    expect(App.actions.loadPreferences).toBeCalled()
  })

  it('updateFont', async () => {
    await store.dispatch('Preferences/updateFont', DefaultFonts[1])
    expect(store.state.Preferences.appearance.font).toEqual(DefaultFonts[1])
    expect(App.actions.loadPreferences).toBeCalled()
  })
})
