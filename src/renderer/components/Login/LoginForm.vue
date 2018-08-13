<template>
  <el-form ref="loginForm" label-width="120px" label-position="top" v-on:submit.prevent="confirm('loginForm')" class="login-form" :rules="rules" :model="form">
    <el-form-item label="First, let's log in to a Mastodon instance. Please enter an instance domain name." prop="domainName">
      <el-input v-model="form.domainName" placeholder="mastodon.social" v-shortkey="['enter']" @shortkey.native="handleKey"></el-input>
    </el-form-item>
    <!-- Dummy form to guard submitting with enter -->
    <el-form-item class="hidden">
      <el-input></el-input>
    </el-form-item>
    <el-button
      type="primary"
      @click="confirm('loginForm')"
      v-if="selectedInstance === null"
      v-loading="searching"
      element-loading-background="rgba(0, 0, 0, 0.8)">
      Search
    </el-button>
    <el-form-item class="submit">
      <el-button
        type="primary"
        class="login"
        @click="login"
        v-if="selectedInstance !== null">
        Login
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState } from 'vuex'
import { domainFormat } from '../../utils/validator'

export default {
  name: 'login-form',
  data () {
    return {
      form: {
        domainName: ''
      }
    }
  },
  computed: {
    ...mapState({
      selectedInstance: state => state.Login.selectedInstance,
      searching: state => state.Login.searching
    }),
    rules: {
      get () {
        return {
          domainName: [
            {
              type: 'string',
              required: true,
              message: this.$t('validation.login.require_domain_name')
            },
            {
              pattern: domainFormat,
              trigger: 'change',
              message: this.$t('validation.login.domain_format')
            }
          ]
        }
      }
    }
  },
  methods: {
    login () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$store.dispatch('Login/fetchLogin', this.selectedInstance)
        .then((url) => {
          loading.close()
          this.$store.dispatch('Login/pageBack')
          this.$router.push({ path: '/authorize', query: { url: url } })
        })
        .catch(() => {
          loading.close()
          this.$message({
            message: this.$t('message.authorize_url_error'),
            type: 'error'
          })
        })
    },
    confirm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.dispatch('Login/confirmInstance', this.form.domainName)
            .then(() => {
              this.$message({
                message: this.$t('message.domain_confirmed', {domain: this.form.domainName}),
                type: 'success'
              })
            })
            .catch(() => {
              this.$message({
                message: this.$t('domain_doesnt_exist', {domain: this.form.domainName}),
                type: 'error'
              })
            })
        } else {
          this.$message({
            message: this.$t('validation.login.domain_format'),
            type: 'error'
          })
          return false
        }
      })
    },
    handleKey (event) {
      if (!this.selectedInstance) {
        this.confirm('loginForm')
      } else {
        this.login()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form /deep/ {
  margin: 0 auto;
  width: 300px;

  .el-form-item__label {
    color: #f0f3f9;
  }

  .el-input__inner {
    background-color: #373d48;
    color: #fff;
    border: 0;
  }

  .instance-group {
    text-align: left;
    margin: 0 auto;
  }

  .instance-list {
    display: block;
    margin-left: 0 !important;
    border-color: #606266;
    color: #dcdfe6;
    margin-bottom: 10px;
  }

  .submit {
    margin: 0;
  }

  .back {
    margin-right: 20px;
  }

  .hidden {
    display: none;
  }
}
</style>
