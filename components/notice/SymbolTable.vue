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
        <div :class="colorRate(scope.row.close_rate)">{{ scope.row.close_rate }} %</div>
      </template>
    </el-table-column>
    <el-table-column label="一般" header-align="center">
      <el-table-column
        property="small_sell"
        label="売"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.small_sell, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.small_sell) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="small_buy"
        label="買"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBullRatio(scope.row.small_buy, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.small_buy) }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      :label="`中級（${formatVolume(props.symbol.threshold / 6)}）`"
      header-align="center"
    >
      <el-table-column
        property="middle_sell"
        label="売"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.middle_sell, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.middle_sell) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="middle_buy"
        label="買"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="
              backgroundBullRatio(scope.row.middle_buy, props.symbol.baseValue)
            "
          >
            {{ formatVolume(scope.row.middle_buy) }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      :label="`大口（${formatVolume(props.symbol.threshold / 2)}）`"
      header-align="center"
    >
      <el-table-column
        property="large_sell"
        label="売"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBearRatio(scope.row.large_sell, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.large_sell) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        property="large_buy"
        label="買"
        header-align="center"
        align="right"
      >
        <template #default="scope">
          <div
            :style="backgroundBullRatio(scope.row.large_buy, props.symbol.baseValue)"
          >
            {{ formatVolume(scope.row.large_buy) }}
          </div>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { formatVolume } from "@/modules/ValueFormatter";
import { colorRate, backgroundBearRatio, backgroundBullRatio } from "@/modules/StyleHelper";
interface Props {
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});
</script>
