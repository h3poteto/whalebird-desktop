<template>
  <div class="members">
    <div class="add-account">
      <el-button link class="add-button" @click="addAccount">
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <template v-for="account in members">
      <user :user="account" :remove="true" @removeAccount="removeAccount"></user>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, toRefs, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'
import {
  MUTATION_TYPES as ADD_LIST_MEMBER_MUTATION,
  ACTION_TYPES as ADD_LIST_MEMBER_ACTION
} from '@/store/TimelineSpace/Modals/AddListMember'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'edit-list',
  props: ['list_id'],
  components: { User },
  setup(props) {
    const { list_id } = toRefs(props)
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const members = ref<Array<Entity.Account>>([])
    const userAgent = computed(() => store.state.App.userAgent)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      await load()
    })

    const load = async () => {
      if (!client.value) return
      try {
        const res = await client.value.getAccountsInList(list_id.value, { limit: 0 })
        members.value = res.data
      } catch (err) {
        console.error(err)
        ElMessage({
          message: t('message.members_fetch_error'),
          type: 'error'
        })
      }
    }

    const removeAccount = async (account: Entity.Account) => {
      if (!client.value) return
      try {
        await client.value.deleteAccountsFromList(list_id.value, [account.id])
        await load()
      } catch (err) {
        ElMessage({
          message: t('message.remove_user_error'),
          type: 'error'
        })
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
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;
  background-color: var(--theme-background-color);

  .add-account {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);

    .add-button {
      width: 100%;
    }
  }
}
</style>
