<template>
  <el-table :data="props.symbol.timeLines" max-height="768">
    <el-table-column
      property="hhmm"
      label="時間"
      header-align="center"
      align="center"
      width="70"
    />
    <el-table-column
      property="close"
      label="終値"
      header-align="center"
      align="right"
      width="100"
    />
    <el-table-column
      property="close_rate"
      label="現値変化率"
      header-align="center"
      align="right"
      width="100"
    >
      <template #default="scope">
        <div :class="colorRate(scope.row.close_rate)">{{ formatRate(scope.row.close_rate) }}</div>
      </template>
    </el-table-column>
    <el-table-column label="一般" header-align="center">
      <el-table-column
        label="代金"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundStyleVolume(scope.row.small_sell + scope.row.small_buy, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.small_sell + scope.row.small_buy) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="買率"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundStrengthRatio(scope.row.small_buy, scope.row.small_sell + scope.row.small_buy)"
          >
            {{ scope.row.small_sell + scope.row.small_buy > 0 ? formatRate(calcRatio(scope.row.small_buy, scope.row.small_sell)) : "-" }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      :label="`中級（${formatVolume(props.symbol.threshold / 6)}）`"
      header-align="center"
    >
      <el-table-column
        label="代金"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundStyleVolume(scope.row.middle_sell + scope.row.middle_buy, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.middle_sell + scope.row.middle_buy) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="買率"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="
              backgroundStrengthRatio(scope.row.middle_buy, scope.row.middle_sell + scope.row.middle_buy)
            "
          >
            {{ scope.row.middle_sell + scope.row.middle_buy > 0 ? formatRate(calcRatio(scope.row.middle_buy, scope.row.middle_sell)) : "-" }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      :label="`大口（${formatVolume(props.symbol.threshold / 2)}）`"
      header-align="center"
    >
      <el-table-column
        label="代金"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundStyleVolume(scope.row.large_sell + scope.row.large_buy, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.large_sell + scope.row.large_buy) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="買率"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundStrengthRatio(scope.row.large_buy, scope.row.large_sell + scope.row.large_buy)"
          >
            {{ scope.row.large_sell + scope.row.large_buy > 0 ? formatRate(calcRatio(scope.row.large_buy, scope.row.large_sell)) : "-" }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { formatVolume, formatRate } from "@/modules/ValueFormatter";
import { colorRate, backgroundStrengthRatio, backgroundStyleVolume } from "@/modules/StyleHelper";
interface Props {
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});


const calcRatio = (buy, sell) => {
  const value = buy + sell;
  return buy / value * 100;
}
</script>
