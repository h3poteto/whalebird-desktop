import NewToot from './Modals/NewToot'
import ImageViewer from './Modals/ImageViewer'
import Jump from './Modals/Jump'
import ListMembership from './Modals/ListMembership'
import AddListMember from './Modals/AddListMember'

const Modals = {
  namespaced: true,
  modules: {
    ImageViewer,
    NewToot,
    Jump,
    ListMembership,
    AddListMember
  }
}

export default Modals
