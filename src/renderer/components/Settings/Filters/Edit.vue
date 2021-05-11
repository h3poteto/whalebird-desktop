<template>
  <div id="edit_filter">
    <h2>{{ $t('settings.filters.edit.title') }}</h2>
    <FilterForm v-model="filter" @cancel="cancel" @onSubmit="onSubmit" :loading="loading"> </FilterForm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import FilterForm from './form'

export default {
  name: 'EditFilter',
  props: ['filter_id'],
  components: { FilterForm },
  computed: {
    ...mapState('Settings/Filters/Edit', {
      loading: state => state.loading
    }),
    filter: {
      get() {
        return this.$store.state.Settings.Filters.Edit.filter
      },
      set(value) {
        this.$store.dispatch('Settings/Filters/Edit/editFilter', value)
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
