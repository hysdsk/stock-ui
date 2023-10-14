<script lang="ts" setup>
  definePageMeta({
    middleware: [
      function (to, from) {
        const route = useRoute();
        const { code } = route.params;
        return navigateTo(`/symbol/${code}/daily-price`);
      }
    ]
  })
</script>
