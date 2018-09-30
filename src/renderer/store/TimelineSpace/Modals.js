import NewToot from './Modals/NewToot'
import ImageViewer from './Modals/ImageViewer'
import Jump from './Modals/Jump'
import ListMembership from './Modals/ListMembership'
import AddListMember from './Modals/AddListMember'
import MuteConfirm from './Modals/MuteConfirm'
import Shortcut from './Modals/Shortcut'
import Report from './Modals/Report'

const Modals = {
  namespaced: true,
  modules: {
    ImageViewer,
    NewToot,
    Jump,
    ListMembership,
    AddListMember,
    MuteConfirm,
    Shortcut,
    Report
  },
  getters: {
    modalOpened: (state, getters, rootState) => {
      const imageViewer = rootState.TimelineSpace.Modals.ImageViewer.modalOpen
      const newToot = rootState.TimelineSpace.Modals.NewToot.modalOpen
      const jump = rootState.TimelineSpace.Modals.Jump.modalOpen
      const listMembership = rootState.TimelineSpace.Modals.ListMembership.modalOpen
      const addListMember = rootState.TimelineSpace.Modals.AddListMember.modalOpen
      const shortcut = rootState.TimelineSpace.Modals.Shortcut.modalOpen
      const muteConfirm = rootState.TimelineSpace.Modals.MuteConfirm.modalOpen
      const report = rootState.TimelineSpace.Modals.Report.modalOpen
      return imageViewer || newToot || jump || listMembership || addListMember || shortcut || muteConfirm || report
    }
  }
}

export default Modals
