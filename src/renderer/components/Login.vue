<template>
<div id="login">
  <div class="close">
    <el-button type="text" @click="close">
      <i class="el-icon-close"></i>
    </el-button>
  </div>
  <instance-form v-if="page == 1"></instance-form>
  <login-form v-if="page == 2"></login-form>
</div>
</template>

<script>
import InstanceForm from './Login/InstanceForm'
import LoginForm from './Login/LoginForm'
import { mapState } from 'vuex'

export default {
  name: 'login',
  components: { InstanceForm, LoginForm },
  computed: {
    ...mapState({
      page: state => state.Login.page
    })
  },
  methods: {
    close () {
      return this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss">
body { font-family: 'Source Sans Pro', sans-serif; }

html, body, #app {
  height: 100%;
  margin: 0;
}

#login {
  background-color: #292f3f;
  color: #ffffff;
  text-align: center;
  min-height: 100%;

  .close {
    text-align: right;
  }

  .el-form-item__label {
    color: #f0f3f9;
  }

  .el-input__inner {
    background-color: #373d48;
    color: #ffffff;
    border: 0;
  }
}
</style>
