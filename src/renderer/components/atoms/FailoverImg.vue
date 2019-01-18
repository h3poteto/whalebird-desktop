<template>
<img
  :src="originalSrc"
  :title="title"
  :alt="alt"
  v-on:error="failover"
  v-on:load="loading = false"
  :class="loading ? 'loading' : ''"
  @click="$emit('click')" />
</template>

<script>
export default {
  name: 'FailoverImg',
  props: {
    src: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    },
    failoverSrc: {
      type: String,
      default: 'data:image/png;base64,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8uyu8TbiNgXmedEw05izs7P8Fjrdad3pzMSyT9ylsyYpjwipvI2p/fBe+djEq1evGofN8qLr7PLptJane13xzkgK3Gjx2bn2BQ58QJVXf0yN6t9CeeDReNpz4Ltqy9jyucT6jwjNrtBOz5g+5rtowtnmtPB6fLPznZEU2NjhOAtMyt15/eflyw268WCm3MIG+JRA5ZbxrsPgxv9fo+/dbTnmNzY28CJaq+no3AJzh2l4mUqBafXHxppGj/r/MWM5ZWr8NG25Tf/69WuYUb180k7fp1R+bKLxCD9f7pu9jzSeMf/HOC6tP8E2/CJakwhrCpzb4cgLzCc2aq4jl1tYvjKeTqguOnsUG2L5/WLDfP9AumCdn7f86EOnYTB2LvUR5q/VmP2Yb/x7vgsi3VizaIiLRyizn+7d3nfGVmBlXjqJAlMnp6enLUebcu4693JZbJfl1c4h76jKO4X0Af8eE8vyXu1Fynlv5ZNNlVlxrP258/byK/C67i9u9UjYssDcYf3x1djEllcOIzXnP9JVmbLD/LHX9AUq5YQ2Rs4hb7OMd/Hu3buuf6v82ESbS03xZvOMIIa72H+Ve5m0iNKqj39Gh2mIjr+1tbV179696LacdMSP6vcXsVLa/H+j4zXUfEfGOkTYqcA8aZnWLu3k5KTxvHz6tXJ4j+1p0Z2NabMY/xcBl3PRljPn2LPkoSyiKitKH5nf29srK1q0d0sfEG98usFuexj1dLScPKyrll8oFNvN4eFh4zmP+LWjo6NJnPQrP8Lb8qaL8tdmT8/ETz9+/Nh4K1n8WiyiqX9b+XAj4XRvrYw1nfajbVZ27ODzd9rXZBYPFVtPuq5Y+SBf/Cjdi9z761hj281PPZtE+dOuN0zm86XlW4sXn/cU7W+hTsd+Naey0q4qLZ9Kpekt1JyzyUeenT6DsqqY/zk4OFjG41Zm4XGYMfDtRen76svD+pHfQJhe5+35OHm/RZT+RxRr9r62rNqRkN+tXUS+3gJECCIcxpAXu8zucEw4x9nZ2fn5+TDnSK+urm7JV1YiwrYGvlR694+NKV8XQYR/WZubhsAxISBCMB39W9K9V6N6q+t3pwUibNjix3yPGJiOAiIEEQIiBBGCCC0CECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBAQIYgQECGIEBAhiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBBECIgQRAiIEEQIiBDG6D8BBgBNIRvwsstoqwAAAABJRU5ErkJggg=='
    }
  },
  data () {
    return {
      loading: true,
      originalSrc: this.src
    }
  },
  watch: {
    src: function (newSrc, oldSrc) {
      this.originalSrc = newSrc
    }
  },
  methods: {
    failover () {
      this.originalSrc = this.failoverSrc
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  min-width: 1em;
  min-height: 1em;

  &.loading {
    background-image: url("../../assets/images/loading-spinner.svg");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
  }
}
</style>
