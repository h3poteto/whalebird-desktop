import Toot, { TootState } from './molecules/Toot'

export type MoleculesModuleState = {
  Toot: TootState
}

export default {
  namespaced: true,
  modules: {
    Toot
  }
}
