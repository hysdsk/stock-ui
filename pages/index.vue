<template>
  <h1 class="">出来高増加銘柄一覧</h1>
  <div class="">
    <table class="">
      <thead>
      <tr>
        <th>銘柄コード</th>
        <th>銘柄名</th>
        <th>業種名</th>
        <th>直近出来高</th>
        <th>過去出来高</th>
        <th>増加率</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="symbol in data.increaseVolumeSymbols" :key="symbol.code">
        <td>
          <NuxtLink :to="`/symbol/${symbol.symbolCode}`" target="_blank">
            {{ symbol.symbolCode }}
          </NuxtLink>
        </td>
        <td>{{ symbol.symbolName }}</td>
        <td>{{ symbol.bisCategoryName }}</td>
        <td style="text-align: end;">{{ symbol.recentVolume.toLocaleString() }}</td>
        <td style="text-align: end;">{{ symbol.averageVolume.toLocaleString() }}</td>
        <td style="text-align: end;">+ {{ symbol.increaseRate }}%</td>
      </tr>
      </tbody>
    </table>
  </div>

  <h1 class="">上昇銘柄一覧</h1>
  <div class="">
    <table class="">
      <thead>
      <tr>
        <th>銘柄コード</th>
        <th>銘柄名</th>
        <th>業種名</th>
        <th>平均出来高</th>
        <th>終値</th>
        <th>増加率</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="symbol in data.increasePriceSymbols" :key="symbol.code">
        <td>
          <NuxtLink :to="`/symbol/${symbol.symbolCode}`" target="_blank">
            {{ symbol.symbolCode }}
          </NuxtLink>
        </td>
        <td>{{ symbol.symbolName }}</td>
        <td>{{ symbol.bisCategoryName }}</td>
        <td style="text-align: end;">{{ symbol.averageVolume.toLocaleString() }}</td>
        <td style="text-align: end;">{{ symbol.closingPrice.toLocaleString() }}</td>
        <td style="text-align: end;">+ {{ symbol.increaseRate }}%</td>
      </tr>
      </tbody>
    </table>
  </div>

  <h1 class="">踏み上げ期待銘柄一覧</h1>
  <div class="">
    <table class="">
      <thead>
      <tr>
        <th>銘柄コード</th>
        <th>銘柄名</th>
        <th>業種名</th>
        <th>平均出来高</th>
        <th>信用売り残</th>
        <th>信用買い残</th>
        <th>信用倍率</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="symbol in data.increaseSellBalance" :key="symbol.code">
        <td>
          <NuxtLink :to="`/symbol/${symbol.symbolCode}`" target="_blank">
            {{ symbol.symbolCode }}
          </NuxtLink>
        </td>
        <td>{{ symbol.symbolName }}</td>
        <td>{{ symbol.bisCategoryName }}</td>
        <td style="text-align: end;">{{ symbol.averageVolume.toLocaleString() }}</td>
        <td style="text-align: end;">{{ symbol.sellBalance.toLocaleString() }}</td>
        <td style="text-align: end;">{{ symbol.buyBalance.toLocaleString() }}</td>
        <td style="text-align: end;">+ {{ symbol.balanceRate }}%</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  const { data } = await useFetch("/api/symbols");
</script>
