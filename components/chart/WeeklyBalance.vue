<template>
  <canvas id="chart-weekly-balance"></canvas>
</template>

<script lang="ts" setup>
  import Chart from "chart.js/auto";
  import { onMounted } from "vue";
  import dayjs from "dayjs";
  dayjs.locale("ja");

  interface Props {
    code: string,
    from: string,
    to: string
  }

  const props = withDefaults(defineProps<Props>(), {})
  const { data, pending } = useFetch(
    `/api/symbol/metrics/weeklyBalance`, {
      params: {
        code: props.code,
        from: dayjs(props.from).format("YYYYMMDD"),
        to: dayjs(props.to).format("YYYYMMDD")
      }
    }
  );

  onMounted(() => {
    new Chart(document.getElementById("chart-weekly-balance"), {
      data: {
        labels: data.value?.weeklyInfoForChart.weekendDate,
        datasets: [{
          type: 'line',
          label: "貸付残高回帰直線",
          data: data.value?.weeklyInfoForChart.lendBalanceRegressionLine,
          pointRadius: 0,
          borderColor: "#2979FF"
        },{
          type: 'line',
          label: "信用買残回帰直線",
          data: data.value?.weeklyInfoForChart.buyBalanceRegressionLine,
          pointRadius: 0,
          borderColor: "#ff1744"
        },{
          type: "bar",
          label: "信用売残",
          data: data.value?.weeklyInfoForChart.sellBalance,
          backgroundColor: "#B9F6CA"
        },{
          type: 'bar',
          label: "信用買残",
          data: data.value?.weeklyInfoForChart.buyBalance,
          backgroundColor: "#ff8a80"
        },{
          type: 'bar',
          label: "貸付残高",
          data: data.value?.weeklyInfoForChart.lendBalance,
          backgroundColor: "#82b1ff"
        }]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      },
    });
  });
</script>
