<template>
<div id="login">
  <el-form ref="instanceForm" label-width="120px" label-position="top">
    <el-form-item label="Domain name">
      <el-input v-model="instanceForm.domain"></el-input>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" @click="search">Search</el-button>
    </el-form-item>
  </el-form>
  <el-form ref="loginForm" v-if="instances.length > 0" label-width="120px" label-position="top">
    <el-form-item label="Select instance">
      <el-radio-group v-model="loginForm.selectInstance" @change="changeInstance">
        <el-radio class="instance-list" v-for="instance in instances" v-bind:key="instance.id" :label="instance.name" border></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" @click="login" v-if="selectedInstance !== null">Login</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'login',
  data () {
    return {
      instanceForm: {
        domain: ''
      },
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
  created () {
  },
  methods: {
    login () {
      this.$store.dispatch('Login/fetchLogin', this.selectedInstance)
        .then((url) => {
          this.$router.push({ path: '/authorize' })
        })
    },
    search () {
      this.$store.dispatch('Login/searchInstance', this.instanceForm.domain)
    },
    changeInstance (value) {
      this.$store.dispatch('Login/changeInstance', value)
    }
  }
}
</script>

<style lang="scss">
body { font-family: 'Source Sans Pro', sans-serif; }

#login {
  text-align: center;

  .instance-list {
    display: block;
  }
}
</style>
