<template>
  <transition name="image-viewer">
    <div id="image" v-show="modalOpen" :aria-hidden="!modalOpen" aria-modal="true" role="dialog">
      <div class="image-wrapper">
        <div class="image-header">
          <el-button class="close-button" color="#1c1c1c" circle dark @click="close">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </div>
        <div class="image-content" role="presentation" @click.self="close">
          <span class="button-area"
            ><el-button v-show="showLeft" link @click="decrementIndex()"> <font-awesome-icon icon="angle-left" /> </el-button
          ></span>
          <Media :src="imageURL" :imageType="imageType"></Media>
          <span class="button-area"
            ><el-button v-show="showRight" link @click="incrementIndex()"> <font-awesome-icon icon="angle-right" /> </el-button
          ></span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/ImageViewer'
import Media from './ImageViewer/Media.vue'

export default defineComponent({
  name: 'image-viewer',
  components: {
    Media
  },
  setup() {
    const space = 'TimelineSpace/Modals/ImageViewer'
    const store = useStore()
    const { left, right, Escape } = useMagicKeys()

    const modalOpen = computed(() => store.state.TimelineSpace.Modals.ImageViewer.modalOpen)
    const imageURL = computed(() => store.getters[`${space}/imageURL`])
    const imageType = computed(() => store.getters[`${space}/imageType`])
    const showLeft = computed(() => store.getters[`${space}/showLeft`])
    const showRight = computed(() => store.getters[`${space}/showRight`])

    whenever(left, () => {
      decrementIndex()
    })
    whenever(right, () => {
      incrementIndex()
    })
    whenever(Escape, () => {
      close()
    })

    const close = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CLOSE_MODAL}`)
    }
    const decrementIndex = () => {
      if (showLeft.value) store.dispatch(`${space}/${ACTION_TYPES.DECREMENT_INDEX}`)
    }
    const incrementIndex = () => {
      if (showRight.value) store.dispatch(`${space}/${ACTION_TYPES.INCREMENT_INDEX}`)
    }

    return {
      modalOpen,
      imageURL,
      imageType,
      showLeft,
      showRight,
      close,
      decrementIndex,
      incrementIndex
    }
  }
})
</script>

<style lang="scss" scoped>
.image-wrapper {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  outline: 0;
  z-index: 2;

  .image-header {
    width: 100%;
    text-align: right;
    padding: 8px 8px 0 0;
    color: #409eff;
    box-sizing: border-box;
    position: fixed;

    .close-button {
      font-size: 24px;
    }
  }

  .image-content {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: opacity 0.5s;
}

.image-viewer-enter,
.image-viewer-leave-to {
  opacity: 0;
}

.button-area {
  display: inline-block;
  width: 27px;
  margin: 0 12px;

  svg {
    font-size: 50px;
  }
}
</style>
