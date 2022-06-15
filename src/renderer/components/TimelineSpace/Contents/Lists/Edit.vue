<template>
  <div class="members">
    <div class="add-account">
      <el-button type="text" class="add-button" @click="addAccount">
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <template v-for="account in members">
      <user :user="account" :remove="true" @removeAccount="removeAccount"></user>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/Lists/Edit'
import {
  MUTATION_TYPES as ADD_LIST_MEMBER_MUTATION,
  ACTION_TYPES as ADD_LIST_MEMBER_ACTION
} from '@/store/TimelineSpace/Modals/AddListMember'

export default defineComponent({
  name: 'edit-list',
  props: ['list_id'],
  components: { User },
  setup(props) {
    const { list_id } = toRefs(props)
    const space = 'TimelineSpace/Contents/Lists/Edit'
    const store = useStore()
    const i18n = useI18next()

    const members = computed(() => store.state.TimelineSpace.Contents.Lists.Edit.members)

    onMounted(async () => {
      await init()
    })
    const init = async () => {
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_MEMBERS}`, list_id.value)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.members_fetch_error'),
          type: 'error'
        })
      } finally {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
      }
    }
    const removeAccount = async (account: Entity.Account) => {
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.REMOVE_ACCOUNT}`, {
          account: account,
          listId: list_id.value
        })
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_MEMBERS}`, list_id.value)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.remove_user_error'),
          type: 'error'
        })
      } finally {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
      }
    }
    const addAccount = () => {
      store.commit(`TimelineSpace/Modals/AddListMember/${ADD_LIST_MEMBER_MUTATION.SET_LIST_ID}`, list_id.value)
      store.dispatch(`TimelineSpace/Modals/AddListMember/${ADD_LIST_MEMBER_ACTION.CHANGE_MODAL}`, true)
    }

    return {
      addAccount,
      members,
      removeAccount
    }
  }
})
</script>

<style lang="scss" scoped>
.members {
  .add-account {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);

    .add-button {
      width: 100%;
    }
  }
}
</style>
