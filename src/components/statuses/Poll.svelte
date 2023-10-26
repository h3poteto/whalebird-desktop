<script lang="ts">
  import type { Entity, MegalodonInterface } from 'megalodon'
  import { Button, Progressbar, Radio, Checkbox } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import dayjs from 'dayjs'

  export let poll: Entity.Poll
  export let client: MegalodonInterface
  export let onRefresh: () => void
  let selectedSimple: number
  let selectedMultiple: Array<number> = []

  const percent = (votes: number, all: number) => {
    if (all > 0) {
      return Math.round((votes * 100) / all)
    } else {
      return 0
    }
  }

  const vote = async (ids: Array<number>) => {
    await client.votePoll(poll.id, ids)
    onRefresh()
  }
</script>

<div class="my-2">
  {#if poll.voted || poll.expired}
    <div>
      {#each poll.options as option}
        <div>
          <span class="pr-2">{percent(option.votes_count ?? 0, poll.votes_count)}%</span>
          <span>{option.title}</span>
          <Progressbar progress={percent(option.votes_count ?? 0, poll.votes_count)} />
        </div>
      {/each}
      <Button outline={true} size="xs" class="mt-2" on:click={onRefresh}>{$_('timeline.poll.refresh')}</Button>
      <span>{$_('timeline.poll.people', { values: { count: poll.votes_count } })}</span>
      {#if poll.expired}
        <span>{$_('timeline.poll.closed')}</span>
      {:else}
        <time dateTime={poll.expires_at}>
          {dayjs(poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}
        </time>
      {/if}
    </div>
  {:else if poll.multiple}
    <div>
      {#each poll.options as option, index}
        <Checkbox value={index} bind:group={selectedMultiple} class="my-2">{option.title}</Checkbox>
      {/each}
      <Button outline={true} size="xs" class="mt-2" on:click={() => vote(selectedMultiple)}>{$_('timeline.poll.vote')}</Button>
      <span>{$_('timeline.poll.people', { values: { count: poll.votes_count } })}</span>
      <time dateTime={poll.expires_at}>
        {dayjs(poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}
      </time>
    </div>
  {:else}
    <div>
      {#each poll.options as option, index}
        <Radio name={poll.id} value={index} bind:group={selectedSimple} class="my-2">{option.title}</Radio>
      {/each}
      <Button outline={true} size="xs" class="mt-2" on:click={() => vote([selectedSimple])}>{$_('timeline.poll.vote')}</Button>
      <span>{$_('timeline.poll.people', { values: { count: poll.votes_count } })}</span>
      <time dateTime={poll.expires_at}>
        {dayjs(poll.expires_at).format('YYYY-MM-DD HH:mm:ss')}
      </time>
    </div>
  {/if}
</div>
