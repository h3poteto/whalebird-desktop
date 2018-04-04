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
#login /deep/ {
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
