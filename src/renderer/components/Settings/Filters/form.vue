<template>
  <el-form ref="form" class="section" label-width="200px" label-position="right" size="medium">
    <el-form-item :label="$t('settings.filters.form.phrase')">
      <el-input v-model="filterPhrase"></el-input>
    </el-form-item>
    <el-form-item :label="$t('settings.filters.form.expire')">
      <el-select v-model="filterExpire" value-key="value">
        <el-option v-for="exp in expires" :key="exp.value" :label="exp.label" :value="exp"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('settings.filters.form.context')">
      <template>
        <el-checkbox-group v-model="filterContext">
          <el-checkbox label="home"></el-checkbox>
          <el-checkbox label="notifications"></el-checkbox>
          <el-checkbox label="public"></el-checkbox>
          <el-checkbox label="thread"></el-checkbox>
          <el-checkbox label="account"></el-checkbox>
        </el-checkbox-group>
      </template>
    </el-form-item>
    <el-form-item>
      <el-checkbox v-model="filterIrreversible">{{ $t('settings.filters.form.irreversible') }}</el-checkbox>
    </el-form-item>
    <el-form-item>
      <el-checkbox v-model="filterWholeWord">{{ $t('settings.filters.form.whole_word') }}</el-checkbox>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit" v-loading="loading">{{ $t('settings.filters.form.submit') }}</el-button>
      <el-button @click="cancel">{{ $t('settings.filters.form.cancel') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'FilterForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object
    }
  },
  data() {
    return {
      expires: [
        {
          label: this.$t('settings.filters.expires.never'),
          value: null
        },
        {
          label: this.$t('settings.filters.expires.30_minutes'),
          value: 60 * 30
        },
        {
          label: this.$t('settings.filters.expires.1_hour'),
          value: 3600
        },
        {
          label: this.$t('settings.filters.expires.6_hours'),
          value: 3600 * 6
        },
        {
          label: this.$t('settings.filters.expires.12_hours'),
          value: 3600 * 12
        },
        {
          label: this.$t('settings.filters.expires.1_day'),
          value: 3600 * 24
        },
        {
          label: this.$t('settings.filters.expires.1_week'),
          value: 3600 * 24 * 7
        }
      ]
    }
  },
  computed: {
    filter: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    filterPhrase: {
      get() {
        return this.filter.phrase
      },
      set(value) {
        this.filter = Object.assign({}, this.filter, {
          phrase: value
        })
      }
    },
    filterExpire: {
      get() {
        return this.filter.expires_at
      },
      set(value) {
        this.filter = Object.assign({}, this.filter, {
          expires_at: value
        })
      }
    },
    filterContext: {
      get() {
        return this.filter.context
      },
      set(value) {
        this.filter = Object.assign({}, this.filter, {
          context: value
        })
      }
    },
    filterIrreversible: {
      get() {
        return this.filter.irreversible
      },
      set(value) {
        this.filter = Object.assign({}, this.filter, {
          irreversible: value
        })
      }
    },
    filterWholeWord: {
      get() {
        return this.filter.whole_word
      },
      set(value) {
        this.filter = Object.assign({}, this.filter, {
          whole_word: value
        })
      }
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    onSubmit() {
      this.$emit('onSubmit')
    }
  }
}
</script>

<style lang="scss" scoped>
.section /deep/ {
  margin-bottom: 40px;

  .el-form-item__label {
    color: var(--theme-primary-color);
  }

  .el-checkbox__label {
    color: var(--theme-primary-color);
  }
}
</style>
