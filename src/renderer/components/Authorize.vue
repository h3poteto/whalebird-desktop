<template>
<div id="authorize">
  <div class="close">
    <el-button type="text" @click="close">
      <i class="el-icon-close"></i>
    </el-button>
  </div>
  <el-form ref="form" :model="authorizeForm" label-width="120px" label-position="top" class="authorize-form" v-on:submit.prevent="authorizeSubmit">
    <el-form-item label="Please paste authorization code from your browser:">
      <el-input v-model="authorizeForm.code"></el-input>
    </el-form-item>
    <!-- Dummy form to guard submitting with enter -->
    <el-form-item class="hidden">
      <el-input></el-input>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" @click="authorizeSubmit" native-type="submit">Submit</el-button>
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
        .catch(() => {
          this.$message({
            message: 'Could not authorize the code',
            type: 'error'
          })
        })
    },
    close () {
      return this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss">
body { font-family: 'Source Sans Pro', sans-serif; }

html, body, #app, #authorize {
  height: 100%;
  margin: 0;
}

#authorize {
  background-color: #292f3f;
  color: #ffffff;
  text-align: center;

  .close {
    text-align: right;
  }

  .authorize-form {
    width: 500px;
    margin: 0 auto;
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
