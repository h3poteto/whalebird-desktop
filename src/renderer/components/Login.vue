<template>
  <el-container id="login">
    <el-header>
      <el-row>
        <el-col :span="24" class="close">
          <el-button type="text" @click="close" class="close-button">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <div></div>
      <login-form></login-form>
    </el-container>
  </el-container>
</template>

<script>
import LoginForm from './Login/LoginForm'
import { mapState } from 'vuex'

export default {
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
