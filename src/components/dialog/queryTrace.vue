<template>
  <div id="queryTrace">
    <el-dialog
        :close-on-click-modal="false"
        :destroy-on-close="true"
        :visible.sync="showDialog"
        title="查询轨迹"
        top="2rem"
        width="40%"
        @close="close()"
    >
      <div v-loading="isLoging">
        <el-date-picker v-model="searchFrom" :picker-options="pickerOptions" align="right" default-time="00:00:00"
                        placeholder="选择开始日期时间" size="mini" style="width: 11rem;" type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        <el-date-picker v-model="searchTo" :picker-options="pickerOptions" align="right" default-time="00:00:00"
                        placeholder="选择结束日期时间" size="mini" style="width: 11rem;" type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        <el-button icon="el-icon-search" size="mini" type="primary" @click="onSubmit">查询</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import DeviceService from '../service/DeviceService'

export default {
  name: "deviceEdit",
  props: [],
  computed: {},
  created() {
  },
  data() {
    return {
      deviceService: new DeviceService(),
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },
      searchFrom: null,
      searchTo: null,
      listChangeCallback: null,
      showDialog: false,
      isLoging: false,
      channel: null,
      callback: null,
    };
  },
  methods: {
    openDialog: function (channel, callback) {
      console.log(channel)
      this.showDialog = true;
      this.callback = callback;
      this.channel = channel;
    },

    onSubmit: function () {
      console.log("onSubmit");
      this.isLoging = true;
      let url = `/api/position/history/${this.channel.deviceId}?start=${this.searchFrom}&end=${this.searchTo}`;
      if (this.channel.channelId) {
        url += "&channelId=${this.channel.channelId}"
      }
      this.$axios.get(url, {}).then((res) => {
        this.isLoging = false;
        if (typeof this.callback == "function") {
          if (res.data.code == 0) {
            this.callback(res.data.data)
            this.close()
          } else {
            this.$message.error(res.data.msg);
          }

        }
      }).catch(function (error) {
        this.isLoging = false;
        console.error(error);
      })
    },
    close: function () {
      this.showDialog = false;
      this.isLoging = false;
      this.callback = null;
      this.channel = null;
    },
  },
};
</script>
