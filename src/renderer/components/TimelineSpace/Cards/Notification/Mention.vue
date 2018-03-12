<template>
  <div class="mention">
    <toot :message="message.status"></toot>
  </div>
</template>

<script>
import Toot from '../Toot'

export default {
  name: 'mention',
  props: ['message'],
  components: { Toot }
}
</script>
