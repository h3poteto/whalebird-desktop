<template>
<div id="authorize">
  <el-form ref="form" :model="authorizeForm" label-width="120px" label-position="top">
    <el-form-item label="Please paste authorization code from your browser:">
      <el-input v-model="authorizeForm.code"></el-input>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" @click="authorizeSubmit">Submit</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
export default {
  name: 'authorize',
  data () {
    return {
      authorizeForm: {
        code: ''
      }
    }
  },
  methods: {
    authorizeSubmit () {
      this.$store.dispatch('Authorize/submit', this.authorizeForm.code)
        .then((id) => {
          this.$router.push({ path: `/${id}/home` })
        })
    }
  }
}
</script>

<style lang="scss">
body { font-family: 'Source Sans Pro', sans-serif; }

#authorize {
  text-align: center;
}
</style>
