import Toot, { TootState } from './organisms/Toot'

export type OrganismsModuleState = {
  Toot: TootState
}

export default {
  namespaced: true,
  modules: {
    Toot
  }
}
