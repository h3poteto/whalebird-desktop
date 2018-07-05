<template>
<div id="receive_drop">
  <div class="drop-area">
    <div class="drop-message">
      <h1>Drop to Upload to Mastodon</h1>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'receive-drop'
}
</script>

<style lang="scss" scoped>
#receive_drop {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 4000;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .drop-area {
    width: 80%;
    height: 80%;
    border: 4px dotted #ffffff;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;

    .drop-message {
      text-align: center;

      h1 {
        font-size: 42px;
      }
    }
  }
}
</style>
