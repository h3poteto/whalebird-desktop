import NewToot, { NewTootModuleState } from './Modals/NewToot'
import ImageViewer, { ImageViewerState } from './Modals/ImageViewer'
import Jump, { JumpState } from './Modals/Jump'
import ListMembership, { ListMembershipState } from './Modals/ListMembership'
import AddListMember, { AddListMemberState } from './Modals/AddListMember'
import MuteConfirm, { MuteConfirmState } from './Modals/MuteConfirm'
import Shortcut, { ShortcutState } from './Modals/Shortcut'
import Report, { ReportState } from './Modals/Report'
import { Module, GetterTree } from 'vuex'
import { RootState } from '@/store/index'

export type ModalsState = {}

type ModalsModule = {
  Jump: JumpState
  AddListMember: AddListMemberState
  ImageViewer: ImageViewerState
  ListMembership: ListMembershipState
  MuteConfirm: MuteConfirmState
  NewToot: NewTootModuleState
  Report: ReportState
  Shortcut: ShortcutState
}

export type ModalsModuleState = ModalsModule & ModalsState

const state = (): ModalsState => ({})

const getters: GetterTree<ModalsState, RootState> = {
  modalOpened: (_state, _getters, rootState) => {
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

const Modals: Module<ModalsState, RootState> = {
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
  state: state,
  getters: getters
}

export default Modals
