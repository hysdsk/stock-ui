<template>
  <el-container>
    <el-main>
      <el-tabs>
        <el-tab-pane label="出来高増加銘柄">
          <el-card>
            <el-icon><InfoFilled /></el-icon>
            TODO:
          </el-card>
          <el-table :data="data.increaseVolumeSymbols" @row-click="moveTo">
            <el-table-column prop="symbolCode" label="銘柄コード"/>
            <el-table-column prop="symbolName" label="銘柄名"/>
            <el-table-column prop="divisionName" label="市場" :formatter="formatDivision"/>
            <el-table-column prop="bisCategoryName" label="業種名"/>
            <el-table-column prop="recentVolume" label="直近出来高" align="right" :formatter="formatNum"/>
            <el-table-column prop="averageVolume" label="過去出来高" align="right" :formatter="formatNum"/>
            <el-table-column prop="increaseRate" label="増加率" align="right" :formatter="formatRate"/>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="上昇銘柄">
          <el-card>
            <el-icon><InfoFilled /></el-icon>
            TODO:
          </el-card>
          <el-table :data="data.increasePriceSymbols" @row-click="moveTo">
            <el-table-column prop="symbolCode" label="銘柄コード"/>
            <el-table-column prop="symbolName" label="銘柄名"/>
            <el-table-column prop="divisionName" label="市場" :formatter="formatDivision"/>
            <el-table-column prop="bisCategoryName" label="業種名"/>
            <el-table-column prop="averageVolume" label="平均出来高" align="right" :formatter="formatNum"/>
            <el-table-column prop="closingPrice" label="終値" align="right" :formatter="formatNum"/>
            <el-table-column prop="increaseRate" label="増加率" align="right" :formatter="formatRate"/>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="踏み上げ期待銘柄">
          <el-card>
            <el-icon><InfoFilled /></el-icon>
            TODO:
          </el-card>
          <el-table :data="data.increaseSellBalance" @row-click="moveTo">
            <el-table-column prop="symbolCode" label="銘柄コード"/>
            <el-table-column prop="symbolName" label="銘柄名"/>
            <el-table-column prop="divisionName" label="市場" :formatter="formatDivision"/>
            <el-table-column prop="bisCategoryName" label="業種名"/>
            <el-table-column prop="averageVolume" label="平均出来高" align="right" :formatter="formatNum"/>
            <el-table-column prop="sellBalance" label="信用売り残" align="right" :formatter="formatNum"/>
            <el-table-column prop="buyBalance" label="信用買い残" align="right" :formatter="formatNum"/>
            <el-table-column prop="balanceRate" label="信用倍率" align="right" :formatter="formatRate"/>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup>
  import { InfoFilled } from '@element-plus/icons-vue'

  const { data } = await useFetch("/api/symbols");
  const moveTo = (e) => {
    window.open(`/symbol/${e.symbolCode}`, '_blank')
  }
  const formatDivision = (r, c, v, i) => {
    return `東${v.substring(0, 1)}`;
  }
  const formatNum = (r, c, v, i) => {
    return v.toLocaleString();
  }
  const formatRate = (r, c, v, i) => {
    return `+${v}%`;
  }
</script>
