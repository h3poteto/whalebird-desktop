<template>
  <el-form ref="form" class="section" label-width="200px" label-position="right" size="default">
    <el-form-item :label="$t('settings.filters.form.phrase')">
      <el-input v-model="filterPhrase"></el-input>
    </el-form-item>
    <el-form-item :label="$t('settings.filters.form.expire')">
      <el-select v-model="filterExpire" value-key="value">
        <el-option v-for="exp in expires" :key="exp.value" :label="exp.label" :value="exp"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('settings.filters.form.context')">
      <el-checkbox-group v-model="filterContext">
        <el-checkbox label="home"></el-checkbox>
        <el-checkbox label="notifications"></el-checkbox>
        <el-checkbox label="public"></el-checkbox>
        <el-checkbox label="thread"></el-checkbox>
        <el-checkbox label="account" :disabled="accountDisabled"></el-checkbox>
      </el-checkbox-group>
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

<script lang="ts">
import { defineComponent, computed, toRefs, PropType } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Entity } from 'megalodon'

export default defineComponent({
  name: 'FilterForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object as PropType<Entity.Filter>,
      required: true
    },
    sns: {
      type: String,
      default: 'mastodon'
    }
  },
  setup(props, ctx) {
    const { t } = useTranslation()
    const { modelValue, sns } = toRefs(props)

    const expires = [
      {
        label: t('settings.filters.expires.never'),
        value: null
      },
      {
        label: t('settings.filters.expires.30_minutes'),
        value: 60 * 30
      },
      {
        label: t('settings.filters.expires.1_hour'),
        value: 3600
      },
      {
        label: t('settings.filters.expires.6_hours'),
        value: 3600 * 6
      },
      {
        label: t('settings.filters.expires.12_hours'),
        value: 3600 * 12
      },
      {
        label: t('settings.filters.expires.1_day'),
        value: 3600 * 24
      },
      {
        label: t('settings.filters.expires.1_week'),
        value: 3600 * 24 * 7
      }
    ]

    const filter = computed({
      get: () => modelValue.value,
      set: value => ctx.emit('update:modelValue', value)
    })
    const filterPhrase = computed({
      get: () => filter.value.phrase,
      set: value => {
        filter.value = Object.assign({}, filter.value, {
          phrase: value
        })
      }
    })
    const filterExpire = computed({
      get: () => filter.value.expires_at,
      set: value => {
        filter.value = Object.assign({}, filter.value, {
          expires_at: value
        })
      }
    })
    const filterContext = computed({
      get: () => filter.value.context,
      set: value => {
        filter.value = Object.assign({}, filter.value, {
          context: value
        })
      }
    })
    const filterIrreversible = computed({
      get: () => filter.value.irreversible,
      set: value => {
        filter.value = Object.assign({}, filter.value, {
          irreversible: value
        })
      }
    })
    const filterWholeWord = computed({
      get: () => filter.value.whole_word,
      set: value => {
        filter.value = Object.assign({}, filter.value, {
          whole_word: value
        })
      }
    })
    const accountDisabled = computed(() => sns.value === 'pleroma')

    const cancel = () => ctx.emit('cancel')
    const onSubmit = () => ctx.emit('onSubmit')

    return {
      expires,
      filter,
      filterPhrase,
      filterExpire,
      filterContext,
      filterIrreversible,
      filterWholeWord,
      cancel,
      onSubmit,
      accountDisabled
    }
  }
})
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: 40px;
}

.section :deep() {
  .el-form-item__label {
    color: var(--theme-primary-color);
  }

  .el-checkbox__label {
    color: var(--theme-primary-color);
  }
}
</style>
