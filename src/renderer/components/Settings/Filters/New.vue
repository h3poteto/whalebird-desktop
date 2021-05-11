<template>
  <div id="new_filter">
    <h2>{{ $t('settings.filters.new.title') }}</h2>
    <FilterForm v-model="filter" @cancel="cancel" @onSubmit="onSubmit" :loading="loading"> </FilterForm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import FilterForm from './form'

export default {
  name: 'NewFilter',
  components: { FilterForm },
  computed: {
    ...mapState('Settings/Filters/New', {
      loading: state => state.loading
    }),
    filter: {
      get() {
        return this.$store.state.Settings.Filters.New.filter
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/New/editFilter', value)
      }
    }
  },
  methods: {
    cancel() {
      this.$router.go(-1)
    },
    onSubmit() {
      this.$store
        .dispatch('Settings/Filters/New/createFilter')
        .then(() => {
          this.$router.go(-1)
        })
        .catch(err => {
          console.error(err)
          this.$message({
            message: this.$t('message.create_filter_error'),
            type: 'error'
          })
        })
    }
  }
}
</script>
