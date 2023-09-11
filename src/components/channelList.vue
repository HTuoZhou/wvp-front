<template>
  <div id="channelList" style="width: 100%">
    <div class="page-header">
      <div class="page-title">
        <el-button icon="el-icon-back" size="mini" style="font-size: 20px; color: #000;" type="text"
                   @click="showDevice"></el-button>
        <el-divider direction="vertical"></el-divider>
        通道列表
      </div>
      <div class="page-header-btn">
        <div v-if="!showTree" style="display: inline;">
          通道编号:
          <el-input v-model="channelId" clearable placeholder="通道编号" prefix-icon="el-icon-search"
                    size="mini" style="margin-right: 1rem; width: auto;" @input="search"></el-input>

          通道类型:
          <el-select v-model="channelType" default-first-option placeholder="请选择" size="mini"
                     style="margin-right: 1rem;"
                     @change="search">
            <el-option label="全部" value=""></el-option>
            <el-option label="设备" value=false></el-option>
            <el-option label="子目录" value=true></el-option>
          </el-select>
          在线状态:
          <el-select v-model="online" default-first-option placeholder="请选择" size="mini" style="margin-right: 1rem;"
                     @change="search">
            <el-option label="全部" value=""></el-option>
            <el-option label="在线" value=true></el-option>
            <el-option label="离线" value=false></el-option>
          </el-select>
          清晰度:
          <el-select v-model="isSubStream" default-first-option placeholder="请选择" size="mini"
                     style="margin-right: 1rem;"
                     @change="search">
            <el-option :value="false" label="原画"></el-option>
            <el-option :value="true" label="流畅"></el-option>
          </el-select>
        </div>
        <el-button circle icon="el-icon-refresh-right" size="mini" @click="refresh()"></el-button>
        <el-button v-if="showTree" circle icon="iconfont icon-list" size="mini" @click="switchList()"></el-button>
        <el-button v-if="!showTree" circle icon="iconfont icon-tree" size="mini" @click="switchTree()"></el-button>
      </div>
    </div>
    <devicePlayer ref="devicePlayer"></devicePlayer>
    <el-container v-loading="isLoging" style="height: 82vh;">
      <el-aside v-if="showTree" style="height: 82vh; background-color: #ffffff; overflow: auto" width="auto">
        <DeviceTree ref="deviceTree" :clickEvent="treeNodeClickEvent" :device="device" :onlyCatalog="true"></DeviceTree>
      </el-aside>
      <el-main style="padding: 5px;">
        <el-table ref="channelListTable" :data="deviceChannelList" :height="winHeight"
                  header-row-class-name="table-header"
                  style="width: 100%">
          <el-table-column label="通道编号" min-width="200" prop="channelId">
          </el-table-column>
          <el-table-column label="设备编号" min-width="200" prop="deviceId">
          </el-table-column>
          <el-table-column label="通道名称" min-width="200" prop="name">
          </el-table-column>
          <el-table-column label="快照" min-width="120">
            <template slot-scope="scope">
              <el-image
                  :fit="'contain'"
                  :preview-src-list="['/debug/' + scope.row.snap]"
                  :src="'/debug/' + scope.row.snap"
                  style="width: 60px">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="子节点数" min-width="120" prop="subCount">
          </el-table-column>
          <el-table-column label="厂家" min-width="120" prop="manufacturer">
          </el-table-column>
          <el-table-column label="位置信息" min-width="200">
            <template slot-scope="scope">
              <span v-if="scope.row.longitude*scope.row.latitude > 0">{{
                  scope.row.longitude
                }},<br>{{ scope.row.latitude }}</span>
              <span v-if="scope.row.longitude*scope.row.latitude === 0">无</span>
            </template>
          </el-table-column>
          <el-table-column label="云台类型" min-width="120" prop="ptzTypeValue"/>
          <el-table-column label="开启音频" min-width="120">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.hasAudio" active-color="#409EFF" @change="updateChannel(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="120">
            <template slot-scope="scope">
              <div slot="reference" class="name-wrapper">
                <el-tag v-if="scope.row.status === true" size="medium">在线</el-tag>
                <el-tag v-if="scope.row.status === false" size="medium" type="info">离线</el-tag>
              </div>
            </template>
          </el-table-column>


          <el-table-column fixed="right" label="操作" min-width="280">
            <template slot-scope="scope">
              <el-button icon="el-icon-video-play" size="medium" type="text"
                         v-bind:disabled="device === null || !device.status" @click="sendDevicePush(scope.row)">播放
              </el-button>
<!--              <el-button v-if="!!scope.row.streamId" icon="el-icon-switch-button"-->
<!--                         size="medium" style="color: #f56c6c" type="text"-->
<!--                         v-bind:disabled="device == null || device.online === 0"-->
<!--                         @click="stopDevicePush(scope.row)">停止-->
<!--              </el-button>-->
              <el-divider direction="vertical"></el-divider>
              <el-button v-if="scope.row.subCount > 0 || scope.row.parental === 1" icon="el-icon-s-open" size="medium"
                         type="text"
                         @click="changeSubchannel(scope.row)">查看
              </el-button>
              <el-divider v-if="scope.row.subCount > 0 || scope.row.parental === 1" direction="vertical"></el-divider>
              <el-button icon="el-icon-video-camera" size="medium"
                         type="text" v-bind:disabled="device === null || !device.status"
                         @click="queryRecords(scope.row)">设备录像
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="count"
            :page-sizes="[10, 20, 40, 80]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            style="float: right"
            @size-change="handleSizeChange"
            @current-change="currentChange">
        </el-pagination>
      </el-main>
    </el-container>

    <!--设备列表-->

  </div>
</template>

<script>
import devicePlayer from './dialog/devicePlayer.vue'
import uiHeader from '../layout/UiHeader.vue'
import DeviceService from "./service/DeviceService";
import DeviceTree from "./common/DeviceTree";
import {snap} from "ol/geom/flat/simplify";

export default {
  name: 'channelList',
  components: {
    devicePlayer,
    uiHeader,
    DeviceTree
  },
  data() {
    return {
      deviceService: new DeviceService(),
      device: null,
      deviceId: this.$route.params.deviceId,
      parentChannelId: this.$route.params.parentChannelId,
      deviceChannelList: [],
      videoComponentList: [],
      currentPlayerInfo: {}, //当前播放对象
      updateLooper: 0, //数据刷新轮训标志
      channelId: "",
      channelType: "",
      online: "",
      isSubStream: false,
      winHeight: window.innerHeight - 200,
      currentPage: 1,
      count: 10,
      total: 0,
      beforeUrl: "/deviceList",
      isLoging: false,
      showTree: false,
      loadSnap: {}
    };
  },

  mounted() {
    if (this.deviceId) {
      this.deviceService.getDevice(this.deviceId, (result) => {
        this.device = result.data;
      }, (error) => {
        console.log("获取设备信息失败")
        console.error(error)
      })
    }
    this.initData();
  },
  destroyed() {
    this.$destroy('videojs');
    clearTimeout(this.updateLooper);
  },
  methods: {
    snap,
    initData: function () {
      this.getDeviceChannelList();
    },
    initParam: function () {
      this.deviceId = this.$route.params.deviceId;
      this.parentChannelId = this.$route.params.parentChannelId;
      this.currentPage = 1;
      this.count = 10;
      if (this.parentChannelId === "" || this.parentChannelId === "0") {
        this.beforeUrl = "/deviceList"
      }

    },
    currentChange: function (val) {
      this.currentPage = val;
      this.initData();
    },
    handleSizeChange: function (val) {
      this.count = val;
      this.getDeviceChannelList();
    },
    getDeviceChannelList: function () {
      let that = this;
      if (typeof (this.$route.params.deviceId) == "undefined") return;
      this.$axios({
        method: 'post',
        url: `/webapi/gbDevice/channel/page`,
        data: {
          pageNum: that.currentPage,
          pageSize: that.count,
          queryParam: {
            deviceId: that.deviceId,
            channelId: that.channelId,
            parentChannelId: that.parentChannelId === "0" ? "" : that.parentChannelId,
            channelType: that.channelType === "" ? null : that.channelType === 'true',
            status: that.online === "" ? null : that.online === 'true'
          }
        }
      }).then(function (res) {
        if (res.data.code === 2000000) {
          that.total = res.data.data.total;
          that.deviceChannelList = res.data.data.records;
          // 防止出现表格错位
          that.$nextTick(() => {
            that.$refs.channelListTable.doLayout();
          })
        }

      }).catch(function (error) {
        console.log(error);
      });
    },

    //通知设备上传媒体流
    sendDevicePush: function (itemData) {
      let deviceId = this.deviceId;
      this.isLoging = true;
      let channelId = itemData.channelId;
      console.log("通知设备推流：" + deviceId + " : " + channelId);
      let that = this;
      this.$axios({
        method: 'get',
        url: '/webapi/gbDevice/channel/play/' + deviceId + '/' + channelId,
        // params: {
        //   isSubStream: this.isSubStream
        // }
      }).then(function (res) {
        console.log(res)
        that.isLoging = false;
        if (res.data.code === 2000000) {
          // setTimeout(() => {
          //   let snapId = deviceId + "_" + channelId;
          //   that.loadSnap[deviceId + channelId] = 0;
          //   that.getSnapErrorEvent(snapId)
          // }, 5000)
          itemData.streamId = res.data.data.stream;
          that.$refs.devicePlayer.openDialog("media", deviceId, channelId, {
            streamInfo: res.data.data,
            hasAudio: itemData.hasAudio
          });
          setTimeout(() => {
            that.initData();
          }, 1000)

        } else {
          that.$message.error(res.data.msg);
        }
      }).catch(function (e) {
        console.error(e)
        that.isLoging = false;
        // that.$message.error("请求超时");
      });
    },
    queryRecords: function (itemData) {
      let deviceId = this.deviceId;
      let channelId = itemData.channelId;

      this.$router.push(`/gbRecordDetail/${deviceId}/${channelId}`)
    },
    // stopDevicePush: function (itemData) {
    //   var that = this;
    //   this.$axios({
    //     method: 'get',
    //     url: '/webapi/gbDevice/stopPlay/' + this.deviceId + "/" + itemData.channelId,
    //     params: {
    //       isSubStream: this.isSubStream
    //     }
    //   }).then(function (res) {
    //     that.initData();
    //   }).catch(function (error) {
    //     if (error.response.status === 402) { // 已经停止过
    //       that.initData();
    //     } else {
    //       console.log(error)
    //     }
    //   });
    // },
    // getSnap: function (row) {
    //   let baseUrl = window.baseUrl ? window.baseUrl : "";
    //   return ((process.env.NODE_ENV === 'development') ? process.env.BASE_API : baseUrl) + '/' + row.deviceId + '_' + row.channelId + "_snap.jpg";
    // },
    // getBigSnap: function (row) {
    //   return [this.getSnap(row)]
    // },
    // getSnapErrorEvent: function (deviceId, channelId) {
    //
    //   if (typeof (this.loadSnap[deviceId + channelId]) != "undefined") {
    //     console.log("下载截图" + this.loadSnap[deviceId + channelId])
    //     if (this.loadSnap[deviceId + channelId] > 5) {
    //       delete this.loadSnap[deviceId + channelId];
    //       return;
    //     }
    //     setTimeout(() => {
    //       let baseUrl = window.baseUrl ? window.baseUrl : "";
    //       let url = ((process.env.NODE_ENV === 'development') ? process.env.BASE_API : baseUrl) + '/' + deviceId + '_' + channelId + "_snap.jpg";
    //       this.loadSnap[deviceId + channelId]++
    //       document.getElementById(deviceId + channelId).setAttribute("src", url + '?' + new Date().getTime())
    //     }, 1000)
    //
    //   }
    // },
    showDevice: function () {
      this.$router.push(this.beforeUrl).then(() => {
        this.initParam();
        this.initData();
      })
    },
    changeSubchannel(itemData) {
      this.beforeUrl = this.$router.currentRoute.path;

      var url = `/${this.$router.currentRoute.name}/${this.$router.currentRoute.params.deviceId}/${itemData.channelId}`
      this.$router.push(url).then(() => {
        this.channelId = "";
        this.channelType = "";
        this.online = "";
        this.initParam();
        this.initData();
      })
    },
    showSubchannels: function () {
      if (!this.showTree) {
        this.$axios({
          method: 'get',
          url: `/webapi/gbDevice/query/sub_channels/${this.deviceId}/${this.parentChannelId}/channels`,
          params: {
            page: this.currentPage,
            count: this.count,
            query: this.searchSrt,
            online: this.online,
            channelType: this.channelType
          }
        }).then((res) => {
          if (res.data.code === 0) {
            this.total = res.data.data.total;
            this.deviceChannelList = res.data.data.list;
            // 防止出现表格错位
            this.$nextTick(() => {
              this.$refs.channelListTable.doLayout();
            })
          }

        }).catch(function (error) {
          console.log(error);
        });
      } else {
        this.$axios({
          method: 'get',
          url: `/api/device/query/tree/channel/${this.deviceId}`,
          params: {
            parentId: this.parentChannelId,
            page: this.currentPage,
            count: this.count,
          }
        }).then((res) => {
          if (res.data.code === 0) {
            this.total = res.data.total;
            this.deviceChannelList = res.data.list;
            // 防止出现表格错位
            this.$nextTick(() => {
              this.$refs.channelListTable.doLayout();
            })
          }
        }).catch(function (error) {
          console.log(error);
        });
      }

    },
    search: function () {
      this.currentPage = 1;
      this.total = 0;
      this.initData();
    },
    updateChannel: function (row) {
      this.$axios({
        method: 'put',
        url: `/webapi/gbDevice/channel/switchAudio/${row.id}`,
      }).then(function (res) {
        console.log(JSON.stringify(res));
      });
    },
    refresh: function () {
      this.initData();
    },
    switchTree: function () {
      this.showTree = true;
      this.deviceChannelList = [];
      this.parentChannelId = "0";
      this.currentPage = 1;
    },
    switchList: function () {
      this.showTree = false;
      this.deviceChannelList = [];
      this.parentChannelId = 0;
      this.currentPage = 1;
      this.initData();
    },
    treeNodeClickEvent: function (data, isCatalog) {
      this.parentChannelId = data.channelId;
      this.initData();
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
