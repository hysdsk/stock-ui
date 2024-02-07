<script lang="ts" setup>
  definePageMeta({
    middleware: [
      function (to, from) {
        return navigateTo(`/symbol/${to.params.code}/daily-price`);
      }
    ]
  })
</script>
