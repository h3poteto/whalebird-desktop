<template>
<div id="instance_form">
  <el-form ref="instanceForm" label-width="120px" label-position="top" class="instance-form" v-on:submit.prevent="search">
    <el-form-item label="Domain name">
      <el-input v-model="instanceForm.domain" class="input" ref="domain" autofocus></el-input>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" @click="search" native-type="submit">Search</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
export default {
  name: 'instance-form',
  data () {
    return {
      instanceForm: {
        domain: ''
      }
    }
  },
  mounted () {
    this.$refs.domain.$el.getElementsByTagName('input')[0].focus()
  },
  methods: {
    search () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$store.dispatch('Login/searchInstance', this.instanceForm.domain)
        .then(() => {
          loading.close()
          this.$store.commit('Login/changePage', 2)
        })
        .catch(() => {
          loading.close()
          this.$message({
            message: 'Could not search instance',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.instance-form {
  width: 400px;
  margin: 0 auto;
}
</style>
