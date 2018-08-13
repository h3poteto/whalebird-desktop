<template>
<div id="authorize">
  <div>
    <el-header>
      <el-row>
        <el-col :span="24" class="close">
          <el-button type="text" icon="el-icon-close" @click="close" class="close-button">
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <div class="authorization-url">
        <p>Now authorization page is opened in your browser.</p>
        <p>If it is not opened, please open the following URL manually.</p>
        <p class="url">{{ $route.query.url }}</p>
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
          <el-button
            type="primary"
            @click="authorizeSubmit"
            v-loading="submitting"
            element-loading-background="rgba(0, 0, 0, 0.8)">
            Submit
          </el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </div>
</div>
</template>

<script>
export default {
  name: 'authorize',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      authorizeForm: {
        code: ''
      },
      submitting: false
    }
  },
  mounted () {
    console.log(this.url)
  },
  methods: {
    authorizeSubmit () {
      this.submitting = true
      this.$store.dispatch('Authorize/submit', this.authorizeForm.code)
        .finally(() => {
          this.submitting = false
        })
        .then((id) => {
          this.$router.push({ path: `/${id}/home` })
        })
        .catch((err) => {
          if (err.name === 'DuplicateRecordError') {
            this.$message({
              message: this.$t('message.authorize_duplicate_error'),
              type: 'error'
            })
          } else {
            this.$message({
              message: this.$t('message.authorize_error'),
              type: 'error'
            })
          }
        })
    },
    close () {
      return this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
#authorize /deep/ {
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

  .authorization-url {
    margin: 0 auto 64px;
    max-width: 80%;

    .url {
      color: #909399;
      word-wrap: break-word;
    }
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

  .hidden {
    display: none;
  }
}
</style>
