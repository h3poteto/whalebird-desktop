<template>
  <div id="edit_filter">
    <h2>{{ $t('settings.filters.edit.title') }}</h2>
    <el-form ref="form" class="section" label-width="200px" label-position="right" size="medium">
      <el-form-item :label="$t('settings.filters.edit.form.phrase')">
        <el-input v-model="filterPhrase"></el-input>
      </el-form-item>
      <el-form-item :label="$t('settings.filters.edit.form.expire')">
        <el-select v-model="filterExpire" value-key="value">
          <el-option v-for="exp in expires" :key="exp.value" :label="exp.label" :value="exp"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('settings.filters.edit.form.context')">
        <template>
          <el-checkbox-group v-model="filterContexts">
            <el-checkbox label="home"></el-checkbox>
            <el-checkbox label="notifications"></el-checkbox>
            <el-checkbox label="public"></el-checkbox>
            <el-checkbox label="thread"></el-checkbox>
            <el-checkbox label="account"></el-checkbox>
          </el-checkbox-group>
        </template>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="filterIrreversible">{{ $t('settings.filters.edit.form.irreversible') }}</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="filterWholeWord">{{ $t('settings.filters.edit.form.whole_word') }}</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" v-loading="loading">{{ $t('settings.filters.edit.form.submit') }}</el-button>
        <el-button @click="cancel">{{ $t('settings.filters.edit.form.cancel') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'EditFilter',
  props: ['filter_id'],
  data() {
    return {
      expires: [
        {
          label: this.$t('settings.filters.edit.expires.never'),
          value: null
        },
        {
          label: this.$t('settings.filters.edit.expires.30_minutes'),
          value: 60 * 30
        },
        {
          label: this.$t('settings.filters.edit.expires.1_hour'),
          value: 3600
        },
        {
          label: this.$t('settings.filters.edit.expires.6_hours'),
          value: 3600 * 6
        },
        {
          label: this.$t('settings.filters.edit.expires.12_hours'),
          value: 3600 * 12
        },
        {
          label: this.$t('settings.filters.edit.expires.1_day'),
          value: 3600 * 24
        },
        {
          label: this.$t('settings.filters.edit.expires.1_week'),
          value: 3600 * 24 * 7
        }
      ]
    }
  },
  computed: {
    ...mapState('Settings/Filters/Edit', {
      loading: state => state.loading
    }),
    filterPhrase: {
      get() {
        if (this.$store.state.Settings.Filters.Edit.filter !== null) {
          return this.$store.state.Settings.Filters.Edit.filter.phrase
        } else {
          return ''
        }
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', {
          phrase: value
        })
      }
    },
    filterExpire: {
      get() {
        if (this.$store.state.Settings.Filters.Edit.filter !== null) {
          return this.$store.state.Settings.Filters.Edit.filter.expires_at
        } else {
          return null
        }
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', {
          expires_at: value
        })
      }
    },
    filterContexts: {
      get() {
        if (this.$store.state.Settings.Filters.Edit.filter !== null) {
          return this.$store.state.Settings.Filters.Edit.filter.context
        } else {
          return []
        }
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', {
          context: value
        })
      }
    },
    filterIrreversible: {
      get() {
        if (this.$store.state.Settings.Filters.Edit.filter !== null) {
          return this.$store.state.Settings.Filters.Edit.filter.irreversible
        } else {
          return false
        }
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', {
          irreversible: value
        })
      }
    },
    filterWholeWord: {
      get() {
        if (this.$store.state.Settings.Filters.Edit.filter !== null) {
          return this.$store.state.Settings.Filters.Edit.filter.whole_word
        } else {
          return false
        }
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', {
          whole_word: value
        })
      }
    }
  },
  async created() {
    await this.$store.dispatch('Settings/Filters/Edit/fetchFilter', this.filter_id)
  },
  methods: {
    cancel() {
      this.$router.go(-1)
    },
    onSubmit() {
      this.$store
        .dispatch('Settings/Filters/Edit/updateFilter')
        .then(() => {
          this.$router.go(-1)
        })
        .catch(err => {
          console.error(err)
          this.$message({
            message: this.$t('message.update_filter_error'),
            type: 'error'
          })
        })
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

.notice {
  color: #c0c4cc;
  font-size: 12px;
}
</style>
