<template>
  <el-container>
    <el-main>
      <el-text size="large" tag="b" type="primary">{{ terms[camelize(key)].title }}</el-text>
      <el-card>
        <el-icon><InfoFilled /></el-icon> <b>抽出条件</b><br/>
        {{ terms[camelize(key)].desc }}
      </el-card>
      <el-descriptions>
        <el-descriptions-item label="件数">{{ data.symbols ? data.symbols.length : 0 }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="data.symbols" @row-click="moveTo">
        <el-table-column prop="symbolCode"      label="銘柄コード"   width="100"/>
        <el-table-column prop="symbolName"      label="銘柄名"/>
        <el-table-column prop="divisionName"    label="市場"         width="80"  :formatter="formatDivision" sortable/>
        <el-table-column prop="bisCategoryName" label="業種名"       width="180" sortable/>
        <el-table-column prop="closingPrice"    label="終値"         width="120" :formatter="formatNum" align="right" sortable/>
        <el-table-column prop="recentVolume"    label="直近売買代金" width="150" :formatter="formatNum"  align="right" sortable/>
        <el-table-column prop="averageVolume"   label="平均売買代金" width="150" :formatter="formatNum"  align="right" sortable/>
        <el-table-column prop="increaseRate"    label="増加率"       width="120" :formatter="formatRate" align="right" sortable/>
        <el-table-column prop="sellBalance"     label="信用売り残"   width="120" :formatter="formatNum" align="right" sortable/>
        <el-table-column prop="buyBalance"      label="信用買い残"   width="120" :formatter="formatNum" align="right" sortable/>
      </el-table>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
  import { InfoFilled } from '@element-plus/icons-vue'
  definePageMeta({
    validate: async(route) => {
      // const nuxtApp = useNuxtApp()
          return [
            "increase-volume",
            "increase-price",
            "increase-sell-balance",
            "low-rank"
            ].includes(route.params.key)
      }
  })
  const terms = {
    increaseVolume: {
      title: "出来高増加銘柄",
      desc: "直近一週間の平均売買高が50万株以上 かつ 過去三か月の平均売買高の倍以上の銘柄"
    },
    increasePrice: {
      title: "上昇中銘柄",
      desc: "直近三連騰陽線 かつ 三日間の平均売買高が10万株以上の銘柄"
    },
    increaseSellBalance: {
      title: "踏み上げ期待銘柄",
      desc: "直近半年間で貸株残高と信用買残が上昇傾向 かつ 直近の貸株残高が発行済株式数の15%以上"
    },
    lowRank: {
      title: "仕手上げ期待銘柄",
      desc: "時価総額300億円以下 かつ 直近終値500円以下 かつ 直近三か月の平均売買高30万株以下の価格変動が小さい銘柄"
    }
  }

  const moveTo = (e) => {
    window.open(`/symbol/${e.symbolCode}`, '_blank')
  }
  const camelize = (s) => {
    return s.replace(/-./g, x => x[1].toUpperCase())
  }
  const formatDivision = (r, c, v, i) => {
    return `東${v.substring(0, 1)}`;
  }
  const formatNum = (r, c, v, i) => {
    if (v) {
      return v.toLocaleString();
    }
    return "---"
  }
  const formatRate = (r, c, v, i) => {
    if (v) {
      return `+${v}%`;
    }
    return "---"
  }

  const { key } = useRoute().params;
  const { data, pending } = useFetch(`/api/search/${camelize(key)}`);
  useHead({title: `${terms[camelize(key)].title}`})
</script>
