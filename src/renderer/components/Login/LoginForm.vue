<template>
<div id="login_form">
  <el-form ref="loginForm" label-width="120px" label-position="top" v-on:submit.prevent="login">
    <el-form-item label="Select instance">
      <el-radio-group v-model="loginForm.selectInstance" @change="changeInstance" class="instance-group">
        <el-radio class="instance-list" v-for="instance in instances" v-bind:key="instance.id" :label="instance.name" border></el-radio>
      </el-radio-group>
    </el-form-item>
    <p v-if="instances.length === 0">Could not find instance</p>
    <el-form-item class="submit">
      <el-button type="text" class="back" @click="back"><icon name="chevron-left"></icon></el-button>
      <el-button type="primary" class="login" @click="login" v-if="selectedInstance !== null">Login</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'login-form',
  data () {
    return {
      loginForm: {
        selectInstance: ''
      }
    }
  },
  computed: {
    ...mapState({
      instances: state => state.Login.instances,
      selectedInstance: state => state.Login.selectedInstance
    })
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
          this.$router.push({ path: '/authorize' })
        })
        .catch(() => {
          loading.close()
          this.$message({
            message: 'Could not get authorize url',
            type: 'error'
          })
        })
    },
    changeInstance (value) {
      this.$store.dispatch('Login/changeInstance', value)
    },
    back () {
      this.$store.dispatch('Login/pageBack')
    }
  }
}
</script>

<style lang="scss" scoped>
.instance-group {
  width: 300px;
  text-align: left;
  margin: 0 auto;
}

.instance-list {
  display: block;
  width: 300px;
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
</style>
