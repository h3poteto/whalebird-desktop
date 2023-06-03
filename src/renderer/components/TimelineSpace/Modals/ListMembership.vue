<template>
  <el-dialog :title="$t('modals.list_membership.title')" v-model="listMembershipModal" width="400px" custom-class="list-membership-modal">
    <el-checkbox-group v-model="belongToLists" v-loading="loading">
      <table class="lists">
        <tbody>
          <tr v-for="list in lists" :key="list.id">
            <td>
              <el-checkbox :label="list.id">{{ list.title }}</el-checkbox>
            </td>
          </tr>
        </tbody>
      </table>
    </el-checkbox-group>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/ListMembership'

export default defineComponent({
  name: 'list-membership',
  setup() {
    const space = 'TimelineSpace/Modals/ListMembership'
    const loading = ref<boolean>(false)
    const store = useStore()
    const { t } = useTranslation()

    const account = computed(() => store.state.TimelineSpace.Modals.ListMembership.account)
    const lists = computed(() => store.state.TimelineSpace.Modals.ListMembership.lists)
    const listMembershipModal = computed({
      get: () => store.state.TimelineSpace.Modals.ListMembership.modalOpen,
      set: (value: boolean) => store.dispatch(`${space}/${ACTION_TYPES.CHANGE_MODAL}`, value)
    })
    const belongToLists = computed({
      get: () => store.state.TimelineSpace.Modals.ListMembership.belongToLists.map(l => l.id),
      set: (value: Array<string>) => {
        loading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.CHANGE_BELONG_TO_LISTS}`, value)
          .catch(() => {
            ElMessage({
              message: t('message.update_list_memberships_error'),
              type: 'error'
            })
          })
          .finally(() => (loading.value = false))
      }
    })

    onMounted(async () => {
      loading.value = true
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_LISTS}`)
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_LIST_MEMBERSHIP}`, account.value)
      } catch (err) {
        ElMessage({
          message: t('message.lists_fetch_error'),
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      lists,
      listMembershipModal,
      belongToLists
    }
  }
})
</script>

<style lang="scss" scoped>
.lists {
  text-align: left;
  border-collapse: collapse;
  width: 100%;

  tr {
    border-bottom: solid 1px #ebeef5;

    &:first-child {
      border-top: solid 1px #ebeef5;
    }

    &:nth-child(even) {
      background-color: #fafafa;
    }

    &:hover {
      background-color: #f2f6fc;
    }

    td {
      padding: 4px 8px;
    }
  }
}
</style>
