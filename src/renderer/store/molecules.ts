import Toot, { TootState } from './molecules/Toot'

export interface MoleculesModuleState {
  Toot: TootState
}

export default {
  namespaced: true,
  modules: {
    Toot
  }
}
