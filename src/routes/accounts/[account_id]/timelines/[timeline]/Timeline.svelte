<script lang="ts">
  import { tick } from 'svelte'
  import { Input } from 'flowbite-svelte'
  import VirtualScroll from 'svelte-virtual-scroll-list'
  import Status from '@/components/statuses/Status.svelte'
  import generator, { type WebSocketInterface, type Entity, type MegalodonInterface } from 'megalodon'
  import { onNavigate } from '$app/navigation'
  import type { Account } from '@/db'
  import { _ } from 'svelte-i18n'

  export let timeline: string
  export let account: Account | undefined
  export let statuses: Array<Entity.Status>
  export let client: MegalodonInterface
  let list: VirtualScroll
  let stream: WebSocketInterface | null = null
  let unreadStatuses: Array<Entity.Status> = []
  $: timeline, triggerSocket(timeline)

  const triggerSocket = async (tl: string) => {
    if (!client) return
    if (!account) return
    const instance = await client.getInstance()
    if (!instance.data.urls?.streaming_api) return
    const c = generator(account.sns, instance.data.urls.streaming_api, account.access_token, 'Whalebird')
    switch (tl) {
      case 'public':
        stream = c.publicSocket()
        break
      case 'local':
        stream = c.localSocket()
        break
      case 'home': {
        stream = c.userSocket()
        break
      }
      default: {
        break
      }
    }
    if (!stream) return
    stream.on('connect', () => {
      console.log(`connected to ${tl} in ${instance.data.urls!.streaming_api}`)
    })
    stream.on('update', status => {
      if (list && list.getOffset() > 10) {
        unreadStatuses = [status, ...unreadStatuses]
      } else {
        statuses = [status, ...statuses]
      }
    })
    stream.on('delete', id => {
      unreadStatuses = deleteStatus(unreadStatuses, id)
      statuses = deleteStatus(statuses, id)
    })
  }

  onNavigate(() => {
    if (stream) {
      stream.removeAllListeners()
      stream.stop()
      stream = null
      console.log(`closed ${timeline}`)
    }
  })

  const deleteStatus = (statuses: Array<Entity.Status>, deleted_id: string): Array<Entity.Status> => {
    return statuses.filter(status => {
      if (status.reblog !== null && status.reblog.id === deleted_id) {
        return false
      } else {
        return status.id !== deleted_id
      }
    })
  }

  const appendStatuses = async () => {
    const maxId = statuses[statuses.length - 1].id
    const options = { max_id: maxId }
    const append = await loadTimeline(timeline, options)
    statuses = [...statuses, ...append]
  }

  const prependStatuses = async () => {
    const prepend = [...unreadStatuses]
    statuses = [...unreadStatuses, ...statuses]
    unreadStatuses = []

    tick().then(() => {
      const sids = prepend.map(i => i.id)
      // @ts-ignore
      const offset = sids.reduce((previousValue, currentSid) => previousValue + list.getSize(currentSid), 0)
      list.scrollToOffset(offset)
    })
  }

  const loadTimeline = async (tl: string, options: any) => {
    if (!client) return []
    switch (tl) {
      case 'public': {
        const res = await client.getPublicTimeline(options)
        return res.data
      }
      case 'local': {
        const res = await client.getLocalTimeline(options)
        return res.data
      }
      case 'home': {
        const res = await client.getHomeTimeline(options)
        return res.data
      }
      default:
        return []
    }
  }

  const onRefresh = async (id: string) => {
    if (!client) return
    const res = await client.getStatus(id)
    const status = res.data
    const renew = statuses.map(s => {
      if (s.id === status.id) {
        return status
      } else if (s.reblog && s.reblog.id === status.id) {
        return Object.assign({}, s, { reblog: status })
      } else if (status.reblog && s.id === status.reblog.id) {
        return status.reblog
      } else if (status.reblog && s.reblog && s.reblog.id === status.reblog.id) {
        return Object.assign({}, s, { reblog: status.reblog })
      } else {
        return s
      }
    })
    statuses = renew
  }
</script>

<section class="h-full timeline-wrapper">
  <div class="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
    <div class="text-lg font-bold">
      {$_(`timeline.${timeline}`)}
    </div>
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
  <div class="timeline overflow-y-auto">
    <div class="h-full">
      <VirtualScroll
        bind:this={list}
        data={statuses}
        key="id"
        let:data
        on:bottom={() => appendStatuses()}
        on:top={() => prependStatuses()}
        start={0}
        pageMode={false}
      >
        <Status status={data} {onRefresh} {client} />
      </VirtualScroll>
    </div>
  </div>
</section>

<style>
  .timeline-wrapper {
    width: calc(100% - 224px);
  }

  .timeline {
    height: calc(100% - 44px);
  }
</style>
