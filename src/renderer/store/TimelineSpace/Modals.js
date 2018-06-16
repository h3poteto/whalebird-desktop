import NewToot from './Modals/NewToot'
import ImageViewer from './Modals/ImageViewer'
import Jump from './Modals/Jump'
import ListMembership from './Modals/ListMembership'

const Modals = {
  namespaced: true,
  modules: {
    ImageViewer,
    NewToot,
    Jump,
    ListMembership
  }
}

export default Modals
