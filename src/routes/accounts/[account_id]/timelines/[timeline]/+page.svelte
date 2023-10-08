<script lang="ts">
  import { tick } from 'svelte'
  import { Input } from 'flowbite-svelte'
  import VirtualScroll from 'svelte-virtual-scroll-list'
  import Status from '@/components/statuses/Status.svelte'
  import generator, { type WebSocketInterface, type Entity } from 'megalodon'
  import { onNavigate } from '$app/navigation'

  export let data
  let list: VirtualScroll
  let stream: WebSocketInterface | null = null
  let unreadStatuses: Array<Entity.Status> = []
  $: account = data.account
  $: statuses = data.statuses
  $: client = data.client
  $: timeline = data.timeline
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
    stream.on('heartbeat', () => {
      console.log('heartbeat')
    })
    stream.on('update', status => {
      if (list && list.getOffset() > 10) {
        unreadStatuses = [status, ...unreadStatuses]
      } else {
        statuses = [status, ...statuses]
      }
    })
    stream.on('notification', notification => {
      console.log('notification', notification)
    })
    stream.on('delete', id => {
      console.log('delete', id)
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
      const sids = prepend.map(i => i.url)
      // @ts-ignore
      const offset = sids.reduce((previousValue, currentSid) => previousValue + list.getSize(currentSid), 0)
      console.log(offset)
      list.scrollToOffset(offset)
    })
  }

  const loadTimeline = async (tl: string, options: any) => {
    if (!client) return []
    switch (tl) {
      case 'local':
        const res = await client.getLocalTimeline(options)
        return res.data
      case 'home': {
        const res = await client.getHomeTimeline(options)
        return res.data
      }
      default:
        return []
    }
  }
</script>

<section class="w-full h-full">
  <div class="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
    <div class="text-lg font-bold">
      {timeline}
    </div>
    <div class="w-64 text-xs">
      <form>
        <Input type="text" placeholder="Search" class="px-4 py-1 bg-blue-800 border-0 text-blue-100 placeholder:text-blue-300" />
      </form>
    </div>
  </div>
  <div class="timeline overflow-y-auto">
    <VirtualScroll
      bind:this={list}
      data={statuses}
      key="url"
      let:data
      on:bottom={() => appendStatuses()}
      on:top={() => prependStatuses()}
      start={0}
    >
      <Status status={data} />
    </VirtualScroll>
  </div>
</section>

<style>
  .timeline {
    height: calc(100% - 44px);
  }
</style>
