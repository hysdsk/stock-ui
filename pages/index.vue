<template>
  <el-container>
    <el-main>
      <el-tabs>
        <el-tab-pane label="出来高増加銘柄">
          <el-card>
            <el-icon><InfoFilled /></el-icon> <b>抽出条件</b><br/>
            直近一週間の平均売買高が50万株以上 かつ 過去三か月の平均売買高の倍以上の銘柄
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
            <el-icon><InfoFilled /></el-icon> <b>抽出条件</b><br/>
            直近三連騰陽線 かつ 三日間の平均売買高が10万株以上の銘柄
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
            <el-icon><InfoFilled /></el-icon> <b>抽出条件</b><br/>
            現在の信用買い残が五週前より減っている かつ 現在の信用売り残が五週前より増えている かつ 現在の信用買い残が100万株以上の銘柄
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
        <el-tab-pane label="仕手上げ期待銘柄">
          <el-card>
            <el-icon><InfoFilled /></el-icon> <b>抽出条件</b><br/>
            時価総額300億円以下 かつ 直近終値500円以下 かつ 直近三か月の平均売買高30万株以下の価格変動が小さい銘柄
          </el-card>
          <el-table :data="data.lowRankSymbols" @row-click="moveTo">
            <el-table-column prop="symbolCode" label="銘柄コード"/>
            <el-table-column prop="symbolName" label="銘柄名"/>
            <el-table-column prop="divisionName" label="市場" :formatter="formatDivision"/>
            <el-table-column prop="bisCategoryName" label="業種名"/>
            <el-table-column prop="closingPrice" label="直近終値" align="right" :formatter="formatNum"/>
            <el-table-column prop="averageVolume" label="平均出来高" align="right" :formatter="formatNum"/>
            <el-table-column prop="marketPrice" label="時価総額" align="right" :formatter="formatNum"/>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup>
  import { InfoFilled } from '@element-plus/icons-vue'

  const { data } = useFetch("/api/symbols");

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
