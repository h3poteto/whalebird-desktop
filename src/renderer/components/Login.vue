<template>
  <el-container id="login">
    <el-header>
      <el-row>
        <el-col :span="24" class="close">
          <el-button type="text" :icon="ElIconClose" @click="close" class="close-button"> </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <div v-shortkey="['esc']" @shortkey="close"></div>
      <login-form></login-form>
    </el-container>
  </el-container>
</template>

<script>
import { Close as ElIconClose } from '@element-plus/icons'
import LoginForm from './Login/LoginForm'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      ElIconClose
    }
  },
  name: 'login',
  components: { LoginForm },
  computed: {
    ...mapState({
      page: state => state.Login.page
    })
  },
  methods: {
    close() {
      this.$store.dispatch('Login/pageBack')
      return this.$router.push({ path: '/', query: { redirect: 'home' } })
    }
  }
}
</script>

<style lang="scss" scoped>
#login {
  background-color: #292f3f;
  color: #ffffff;
  text-align: center;
  min-height: 100%;

  .close {
    text-align: right;

    .close-button {
      font-size: 24px;
    }
  }
}
</style>
