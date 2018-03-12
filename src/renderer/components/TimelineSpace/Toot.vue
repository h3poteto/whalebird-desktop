<template>
  <div class="toot">
    <div class="icon">
      <img :src="message.account.avatar" />
    </div>
    <div class="detail">
      <div class="toot-header">
        <div class="account">
          {{ message.account.display_name }}
        </div>
        <div class="timestamp">
          {{ message.created_at }}
        </div>
      </div>
      <div class="content" v-html="message.content"></div>
      <div class="tool-box">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'toot',
  props: ['message']
}
</script>
