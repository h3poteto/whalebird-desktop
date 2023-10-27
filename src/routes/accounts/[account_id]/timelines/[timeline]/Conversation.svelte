<script lang="ts">
  import type { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
  import type { Account } from '@/db'
  import VirtualScroll from 'svelte-virtual-scroll-list'
  import { Input } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import { onMount, tick } from 'svelte'
  import generator from 'megalodon'
  import { onNavigate } from '$app/navigation'
  import Conversation from '@/components/conversations/Conversation.svelte'

  export let account: Account | undefined
  export let conversations: Array<Entity.Conversation>
  export let client: MegalodonInterface
  let list: VirtualScroll
  let stream: WebSocketInterface | null = null
  let unreadConversations: Array<Entity.Conversation> = []

  onMount(async () => {
    if (!account) return
    const instance = await client.getInstance()
    if (!instance.data.urls?.streaming_api) return
    const c = generator(account.sns, instance.data.urls.streaming_api, account.access_token, 'Whalebird')
    stream = c.directSocket()
    stream.on('connect', () => {
      console.log(`connected to conversations in ${instance.data.urls!.streaming_api}`)
    })
    stream.on('conversation', conversation => {
      if (list && list.getOffset() > 10) {
        unreadConversations = [conversation, ...unreadConversations]
      } else {
        conversations = [conversation, ...conversations]
      }
    })
  })

  onNavigate(() => {
    if (stream) {
      stream.removeAllListeners()
      stream.stop()
      stream = null
      console.log(`close conversations`)
    }
  })

  const appendConversations = async () => {
    // TODO; use link header
    const maxId = conversations[conversations.length - 1].id
    const options = { max_id: maxId }
    const append = await loadConversations(options)
    conversations = [...conversations, ...append]
  }
  const prependConversations = async () => {
    const prepend = [...unreadConversations]
    conversations = [...unreadConversations, ...conversations]
    unreadConversations = []

    tick().then(() => {
      const sids = prepend.map(i => i.id)
      // @ts-ignore
      const offset = sids.reduce((previousValue, currentSid) => previousValue + list.getSize(currentSid), 0)
      list.scrollToOffset(offset)
    })
  }

  const loadConversations = async (options: any) => {
    const res = await client.getConversationTimeline(options)
    return res.data
  }
</script>

<section class="h-full conversation-wrapper">
  <div class="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
    <div class="text-lg font-bold">{$_('timeline.direct')}</div>
    <div class="w-64 text-xs">
      <form>
        <Input
          type="text"
          placeholder={$_('search.title')}
          class="px-4 py-1 bg-blue-800 border-0 text-blue-100 placeholder:text-blue-300"
          disabled
        />
      </form>
    </div>
  </div>
  <div class="conversation overflow-y-auto">
    <div class="h-full">
      <VirtualScroll
        bind:this={list}
        data={conversations}
        key="id"
        let:data
        on:bottom={() => appendConversations()}
        on:top={() => prependConversations()}
        start={0}
        pageMode={false}
      >
        <Conversation conversation={data} {client} />
      </VirtualScroll>
    </div>
  </div>
</section>

<style>
  .conversation-wrapper {
    width: calc(100% - 224px);
  }

  .conversation {
    height: calc(100% - 44px);
  }
</style>
