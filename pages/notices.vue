<template>
  <br/>
  <el-row :gutter="10">
    <el-col :span="6" v-for="v, k in msgs">
      <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <el-tooltip
                content="Copied!!"
                trigger="click"
                placement="top"
                effect="light">
                <el-button size="large" text @click="copyToClipboard(k)">{{ k }}: {{ v[0].name }}</el-button>
              </el-tooltip>
            </div>
          </template>
        <el-table :data="v" style="width: 100%">
          <el-table-column prop="time" label="時刻" />
          <el-table-column prop="currentprice" label="現値" align="right" class-name="test" />
          <el-table-column label="前日比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.previouscloseratio)">{{ formatRate(scope.row.previouscloseratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="VWAP比" align="right">
            <template #default="scope">
              <span :class="colorRatio(scope.row.vwapratio)">{{ formatRate(scope.row.vwapratio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出来高" align="right">
            <template #default="scope">
              <span :class="colorVolume(scope.row.tradingvolume, scope.row.sob)">{{ formatVolume(scope.row.tradingvolume) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注文" align="right">
            <template #default="scope">
              <span v-if="scope.row.bidorder != null" :class="colorVolume(scope.row.bidorder.qty, -1)">{{ formatOrder(scope.row.bidorder) }}</span>
              <span v-if="scope.row.askorder != null" :class="colorVolume(scope.row.askorder.qty,  1)">{{ formatOrder(scope.row.askorder) }}</span>
              <span v-else></span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
  import { io } from "socket.io-client"
  import { ref, onMounted } from "vue";
  
  const config = useRuntimeConfig()
  const msgs = ref({})
  onMounted(() => {
    const socket = io(`${config.public.wsBaseURL}:${config.public.wsPort}`);
    socket.on("new-msg", msg => {
      for (const key in msg) {
        if (!msgs.value[key]) {
          msgs.value[key] = [];
        }
        while (msgs.value[key].length > 4) {
          msgs.value[key].shift();
        }
        msg[key].testflg = true
        msgs.value[key].push(msg[key]);

        setTimeout(() => {
          const i = msgs.value[key].indexOf(msg[key]);
          msg[key].testflg = false;
          msgs.value[key].splice(i, 1, msg[key]);
        }, 50);
      }
    });
  })
  const copyToClipboard = (v) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(v);
    }
  }
  const formatRate = (v) => {
    return `${Math.floor(v * 10) / 10}%`;
  }
  const formatVolume = (v) => {
    return v > 0 ? `${Math.round(v / 1000)}k` : null;
  }
  const formatOrder = (v) => {
    if (!v) {
      return null
    }
    const price = v.price ? v.price : "-----";
    const qty = formatVolume(v.qty);
    return `${price}:${qty}`;
  }
  const colorRatio = (v) => {
    if (v >  8) return  "text-red9";
    if (v >  7) return  "text-red8";
    if (v >  6) return  "text-red7";
    if (v >  5) return  "text-red6";
    if (v >  4) return  "text-red5";
    if (v >  3) return  "text-red4";
    if (v >  2) return  "text-red3";
    if (v >  1) return  "text-red2";
    if (v >  0) return  "text-red1";
    if (v < -8) return "text-blue9";
    if (v < -7) return "text-blue8";
    if (v < -6) return "text-blue7";
    if (v < -5) return "text-blue6";
    if (v < -4) return "text-blue5";
    if (v < -3) return "text-blue4";
    if (v < -2) return "text-blue3";
    if (v < -1) return "text-blue2";
    if (v <  0) return "text-blue1";
    return ""
  }
  const colorVolume = (v, sob) => {
    if (sob > 0 && v > 80000) return "text-red9";
    if (sob > 0 && v > 70000) return "text-red8";
    if (sob > 0 && v > 60000) return "text-red7";
    if (sob > 0 && v > 50000) return "text-red6";
    if (sob > 0 && v > 40000) return "text-red5";
    if (sob > 0 && v > 30000) return "text-red4";
    if (sob > 0 && v > 20000) return "text-red3";
    if (sob > 0 && v > 10000) return "text-red2";
    if (sob > 0 && v >     0) return "text-red1";
    if (sob < 0 && v > 80000) return "text-blue9";
    if (sob < 0 && v > 70000) return "text-blue8";
    if (sob < 0 && v > 60000) return "text-blue7";
    if (sob < 0 && v > 50000) return "text-blue6";
    if (sob < 0 && v > 40000) return "text-blue5";
    if (sob < 0 && v > 30000) return "text-blue4";
    if (sob < 0 && v > 20000) return "text-blue3";
    if (sob < 0 && v > 10000) return "text-blue2";
    if (sob < 0 && v >     0) return "text-blue1";
    return ""
  }

  const tableRowClassName = (r, i) => {
    if (r.row.testflg) {
      return 'bg-highlight'
    }
    return ''
  }
</script>
