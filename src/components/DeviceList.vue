<template>
  <div id="app" style="width: 100%">
    <div class="page-header">
      <div class="page-title">设备列表</div>
      <div class="page-header-btn">
<!--        <el-button icon="el-icon-plus" size="mini" style="margin-right: 1rem;" type="primary" @click="add">添加设备-->
<!--        </el-button>-->
        <el-button :loading="getDeviceListLoading" circle icon="el-icon-refresh-right" size="mini"
                   @click="getDeviceList()"></el-button>
      </div>
    </div>
    <!--设备列表-->
    <el-table :data="deviceList" :height="winHeight" header-row-class-name="table-header"
              style="width: 100%;font-size: 12px;">
      <el-table-column label="名称" min-width="160" prop="name">
      </el-table-column>
      <el-table-column label="设备编号" min-width="200" prop="deviceId">
      </el-table-column>
      <el-table-column label="地址" min-width="160">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <el-tag v-if="scope.row.address" size="medium">{{ scope.row.address }}</el-tag>
            <el-tag v-if="!scope.row.address" size="medium">未知</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="厂家" min-width="120" prop="manufacturer">
      </el-table-column>
      <el-table-column label="信令传输模式" min-width="120" prop="transport">
      </el-table-column>
      <el-table-column label="流传输模式" min-width="160">
        <template slot-scope="scope">
          <el-select v-model="scope.row.streamMode" placeholder="请选择" size="mini"
                     style="width: 120px" @change="transportChange(scope.row)">
            <el-option key="UDP" label="UDP" value="UDP"></el-option>
            <el-option key="TCP-ACTIVE" label="TCP主动模式" value="TCP-ACTIVE"></el-option>
            <el-option key="TCP-PASSIVE" label="TCP被动模式" value="TCP-PASSIVE"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="通道数" min-width="120" prop="channels">
      </el-table-column>
      <el-table-column label="状态" min-width="120">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <el-tag v-if="scope.row.status" size="medium">在线</el-tag>
            <el-tag v-if="!scope.row.status" size="medium" type="info">离线</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最近心跳" min-width="160" prop="keepAliveTime">
      </el-table-column>
      <el-table-column label="最近注册" min-width="160" prop="registerTime">
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="240">
        <template slot-scope="scope">
          <!--          <el-button icon="el-icon-refresh" size="medium" type="text" v-bind:disabled="scope.row.online==0"-->
          <!--                     @click="refDevice(scope.row)"-->
          <!--                     @mouseover="getTooltipContent(scope.row.deviceId)">刷新-->
          <!--          </el-button>-->
          <!--          <el-divider direction="vertical"></el-divider>-->
          <el-button icon="el-icon-video-camera" size="medium" type="text"
                     @click="showChannelList(scope.row)">通道
          </el-button>
          <!--          <el-divider direction="vertical"></el-divider>-->
          <!--          <el-button icon="el-icon-location" size="medium" type="text"-->
          <!--                     @click="showDevicePosition(scope.row)">定位-->
          <!--          </el-button>-->
          <el-divider direction="vertical"></el-divider>
          <el-button icon="el-icon-edit" size="medium" type="text" @click="edit(scope.row)">编辑</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button icon="el-icon-delete" size="medium" style="color: #f56c6c" type="text"
                     @click="deleteDevice(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        :current-page="pageNum"
        :page-size="pageSize"
        :page-sizes="[10, 20, 40, 80]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="currentChange">
    </el-pagination>
    <deviceEdit ref="deviceEdit"></deviceEdit>
    <syncChannelProgress ref="syncChannelProgress"></syncChannelProgress>
  </div>
</template>

<script>
import uiHeader from '../layout/UiHeader.vue'
import deviceEdit from './dialog/deviceEdit.vue'
import syncChannelProgress from './dialog/SyncChannelProgress.vue'

export default {
  name: 'app',
  components: {
    uiHeader,
    deviceEdit,
    syncChannelProgress,
  },
  data() {
    return {
      deviceList: [], //设备列表
      currentDevice: {}, //当前操作设备对象

      videoComponentList: [],
      updateLooper: 0, //数据刷新轮训标志
      currentDeviceChannelsLenth: 0,
      winHeight: window.innerHeight - 200,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      getDeviceListLoading: false,
    };
  },
  computed: {
    getcurrentDeviceChannels: function () {
      let data = this.currentDevice['channelMap'];
      let channels = null;
      if (data) {
        channels = Object.keys(data).map(key => {
          return data[key];
        });
        this.currentDeviceChannelsLenth = channels.length;
      }
      return channels;
    }
  },
  mounted() {
    this.initData();
    this.updateLooper = setInterval(this.initData, 10000);
  },
  destroyed() {
    this.$destroy('videojs');
    clearTimeout(this.updateLooper);
  },
  methods: {
    initData: function () {
      this.getDeviceList();
    },
    currentChange: function (val) {
      this.pageNum = val;
      this.getDeviceList();
    },
    handleSizeChange: function (val) {
      this.pageSize = val;
      this.getDeviceList();
    },
    getDeviceList: function () {
      this.getDeviceListLoading = true;
      this.$axios({
        method: 'post',
        url: `/webapi/gbDevice/page`,
        data: {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
      }).then((res) => {
        if (res.data.code === 2000000) {
          this.total = res.data.data.total;
          this.deviceList = res.data.data.records;
        }
        this.getDeviceListLoading = false;
      }).catch((error) => {
        console.error(error);
        this.getDeviceListLoading = false;
      });
    },
    deleteDevice: function (row) {
      let msg = "确定删除此设备？"
      if (row.status) {
        msg = "在线设备删除后仍可通过注册再次上线。<br/>如需彻底删除请先将设备离线。<br/><strong>删除此设备将会连设备通道信息一起删除！</strong>"
      }
      this.$confirm(msg, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: 'delete',
          url: `/webapi/gbDevice/delete/${row.deviceId}`
        }).then((res) => {
          this.getDeviceList();
        }).catch((error) => {
          console.error(error);
        });
      }).catch(() => {

      });


    },
    showChannelList: function (row) {
      this.$router.push(`/channelList/${row.deviceId}/0`);
    },
    showDevicePosition: function (row) {
      this.$router.push(`/map?deviceId=${row.deviceId}`);
    },

    //gb28181平台对接
    //刷新设备信息
    refDevice: function (itemData) {
      console.log("刷新对应设备:" + itemData.deviceId);
      let that = this;
      this.$axios({
        method: 'get',
        url: '/webapi/gbDevice/syncDeviceChannel/' + itemData.deviceId
      }).then((res) => {
        console.log("刷新设备结果：" + JSON.stringify(res));
        if (res.data.code !== 2000000) {
          that.$message({
            showClose: true,
            message: res.data.msg,
            type: 'error'
          });
        } else {
          // that.$message({
          // 	showClose: true,
          // 	message: res.data.msg,
          // 	type: 'success'
          // });
          this.$refs.syncChannelProgress.openDialog(itemData.deviceId)
        }
        that.initData()
      }).catch((e) => {
        console.error(e)
        that.$message({
          showClose: true,
          message: e,
          type: 'error'
        });
      });

    },

    getTooltipContent: async function (deviceId) {
      let result = "";
      await this.$axios({
        method: 'get',
        async: false,
        url: `/api/device/query/${deviceId}/sync_status/`,
      }).then((res) => {
        if (res.data.code == 0) {
          if (res.data.data.errorMsg !== null) {
            result = res.data.data.errorMsg
          } else if (res.data.msg !== null) {
            result = res.data.msg
          } else {
            result = `同步中...[${res.data.data.current}/${res.data.data.total}]`;
          }
        }
      })
      return result;
    },
    transportChange: function (row) {
      console.log(`修改传输方式为 ${row.streamMode}：${row.deviceId} `);
      let that = this;
      this.$axios({
        method: 'post',
        url: '/api/device/query/transport/' + row.deviceId + '/' + row.streamMode
      }).then(function (res) {

      }).catch(function (e) {
      });
    },
    edit: function (row) {
      this.$refs.deviceEdit.openDialog(row, () => {
        this.$refs.deviceEdit.close();
        this.$message({
          showClose: true,
          message: "设备修改成功，通道字符集将在下次更新生效",
          type: "success",
        });
        setTimeout(this.getDeviceList, 200)

      })
    },
    add: function () {
      this.$refs.deviceEdit.openDialog(null, () => {
        this.$refs.deviceEdit.close();
        this.$message({
          showClose: true,
          message: "添加成功",
          type: "success",
        });
        setTimeout(this.getDeviceList, 200)

      })
    }


  }
};
</script>

<style>
.videoList {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.video-item {
  position: relative;
  width: 15rem;
  height: 10rem;
  margin-right: 1rem;
  background-color: #000000;
}

.video-item-img {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  height: 100%;
}

.video-item-img:after {
  content: "";
  display: inline-block;
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 3rem;
  height: 3rem;
  background-image: url("../assets/loading.png");
  background-size: cover;
  background-color: #000000;
}

.video-item-title {
  position: absolute;
  bottom: 0;
  color: #000000;
  background-color: #ffffff;
  line-height: 1.5rem;
  padding: 0.3rem;
  width: 14.4rem;
}

</style>
