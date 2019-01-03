<template>
<el-container id="login">
  <el-header>
    <el-row>
      <el-col :span="24" class="close">
        <el-button type="text" icon="el-icon-close" @click="close" class="close-button">
        </el-button>
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
    close () {
      this.$store.dispatch('Login/pageBack')
      return this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
#login {
  background-color: #92c44e;
  color: #ffffff;
  text-align: center;
  min-height: 100%;

  .close {
    text-align: right;

    .close-button {
      font-size: 24px;
      color: white;
    }
  }
}
</style>
