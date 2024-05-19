<template>
  <el-row style="text-align: center">
    <el-col :span="6">
      <div>現値（前日比）</div>
      <div
        style="font-size: 1.5em; padding: 5px"
        :class="colorRate(props.symbol.previouscloserate)"
      >
        {{
          props.symbol.currentprice == null
            ? " - "
            : props.symbol.currentprice.toLocaleString()
        }}（{{ formatRate(props.symbol.previouscloserate) }}）
      </div>
    </el-col>
    <el-col :span="6">
      <div>始値比</div>
      <div
        style="font-size: 1.5em; padding: 5px"
        :class="colorRate(props.symbol.openingrate)"
      >
        {{ formatRate(props.symbol.openingrate) }}
      </div>
    </el-col>
    <el-col :span="6">
      <div>VWAP比</div>
      <div
        style="font-size: 1.5em; padding: 5px"
        :class="colorRate(props.symbol.vwaprate)"
      >
        {{ formatRate(props.symbol.vwaprate) }}
      </div>
    </el-col>
    <el-col :span="6">
      <div>買指値率（総指値量）</div>
      <div style="font-size: 1.5em; padding: 5px">
        <el-progress
          :percentage="props.symbol.avgLimitOrderRatio"
          :color="progressColors"
          :text-inside="true"
          :stroke-width="25"
        >
          {{ formatVolume(props.symbol.avgLimitOrderQty) }}
        </el-progress>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { formatVolume, formatRate } from "@/modules/ValueFormatter";
import { colorRate, progressColors } from "@/modules/StyleHelper";
interface Props {
  symbol: object;
}
const props = withDefaults(defineProps<Props>(), {});
</script>
