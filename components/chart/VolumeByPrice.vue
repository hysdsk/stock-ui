<template>
  <canvas id="chart-volume-by-price"></canvas>
</template>

<script lang="ts" setup>
  import Chart from "chart.js/auto";
  import { onMounted } from "vue";
  import { Link } from "@element-plus/icons-vue"

  interface Props {
    code: string,
    period: number
  }

  const props = withDefaults(defineProps<Props>(), { code: null, period: null })
  const { data, pending } = useFetch(
    `/api/symbol/metrics/volumeByPrice`, {
      params: {
        code: props.code,
        period: props.period
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-volume-by-price"), {
      data: {
        labels: data._value.dailyInfoForChart.price,
        datasets: [{
          type: "bar",
          label: "売買代金",
          data: data._value.dailyInfoForChart.tradingValue,
          backgroundColor: "#FFEE58",
          order: 2,
          yAxisID: "volume",
          stack: "Volume"
        }]
      },
      options: {
        indexAxis: "y",
        scales: {
          x: { }
        }
      },
    });
  });
</script>
