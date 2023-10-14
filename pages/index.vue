<template>
  <el-container>
    <el-main>
      <el-text size="large" tag="b" type="primary">市場別売買代金推移</el-text>
      <canvas id="chart" style="width: 100%; height: 1024px"></canvas>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
  import Chart from "chart.js/auto";
  import { onMounted } from "vue";

  const { data } = await useFetch("/api/market/tradingValues");
  const barData = {
    labels: data._value.prime.openingDate,
    datasets: [
      {label: "Prime", data: data._value.prime.tradingValue, backgroundColor: "#ff4569"},
      {label: "Standard", data: data._value.standard.tradingValue, backgroundColor: "#33eb91"},
      {label: "Growth", data: data._value.growth.tradingValue, backgroundColor: "#33eaff"},
    ]
  }

  const options = {
    responsive: false,
    title: {
      text: "",
    },
    scales: {
      y: {
        title: { display: true, text: "売買代金（千円）" },
        stacked: true
      },
      x: {
        title: { display: true, text: "開場日"},
        stacked: true
      },
    },
    plugins: {
      legend: {
        position: "top"
      }
    }
  }

  onMounted(() => {
    new Chart(document.getElementById("chart"), {
      type: "bar",
      data: barData,
      options: options,
    })
  });
</script>
