<template>
  <div id="app" style="width: 100%">
    <div class="page-header">
      <div class="page-title">
        <el-page-header v-if="recordDetail" content="云端录像" @back="backToList"></el-page-header>
        <div v-if="!recordDetail">云端录像</div>
      </div>

      <div class="page-header-btn">
        节点选择:
        <el-select v-model="mediaServerId" :disabled="recordDetail" placeholder="请选择"
                   size="mini" style="width: 16rem; margin-right: 1rem;" @change="chooseMediaChange">
          <el-option
              v-for="item in mediaServerList"
              :key="item.id"
              :label="item.id"
              :value="item.id">
          </el-option>
        </el-select>
        <el-button v-if="!recordDetail" :loading="loading" circle icon="el-icon-refresh-right" size="mini"
                   @click="getRecordList()"></el-button>
      </div>
    </div>
    <div v-if="!recordDetail">

      <!--设备列表-->
      <el-table :data="recordList" :height="winHeight" style="width: 100%">
        <el-table-column label="应用名" prop="app">
        </el-table-column>
        <el-table-column label="流ID" prop="stream">
        </el-table-column>
        <el-table-column label="时间" prop="time">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="360">
          <template slot-scope="scope">
            <el-button icon="el-icon-folder-opened" size="medium" type="text" @click="showRecordDetail(scope.row)">
              查看
            </el-button>
            <!--                  <el-button size="mini" icon="el-icon-delete" type="danger"  @click="deleteRecord(scope.row)">删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          :current-page="currentPage"
          :page-size="count"
          :page-sizes="[15, 25, 35, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          style="float: right"
          @size-change="handleSizeChange"
          @current-change="currentChange">
      </el-pagination>
    </div>
    <cloud-record-detail v-if="recordDetail" ref="cloudRecordDetail" :mediaServerId="mediaServerId"
                         :mediaServerPath="mediaServerPath" :recordFile="chooseRecord"></cloud-record-detail>

  </div>
</template>

<script>
import uiHeader from '../layout/UiHeader.vue'
import cloudRecordDetail from './CloudRecordDetail.vue'
import MediaServer from './service/MediaServer'

export default {
  name: 'app',
  components: {
    uiHeader, cloudRecordDetail
  },
  data() {
    return {
      mediaServerList: [], // 滅体节点列表
      mediaServerId: null, // 媒体服务
      mediaServerPath: null, // 媒体服务地址
      recordList: [], // 设备列表
      chooseRecord: null, // 媒体服务

      updateLooper: 0, //数据刷新轮训标志
      winHeight: window.innerHeight - 250,
      currentPage: 1,
      count: 15,
      total: 0,
      loading: false,
      mediaServerObj: new MediaServer(),
      recordDetail: false

    };
  },
  computed: {},
  mounted() {
    this.initData();
  },
  destroyed() {
    // this.$destroy('videojs');
  },
  methods: {
    initData: function () {
      // 获取媒体节点列表
      this.getMediaServerList();
      // this.getRecordList();
    },
    currentChange: function (val) {
      this.currentPage = val;
      this.getRecordList();
    },
    handleSizeChange: function (val) {
      this.count = val;
      this.getRecordList();
    },
    getMediaServerList: function () {
      let that = this;
      that.mediaServerObj.getOnlineMediaServerList((data) => {
        that.mediaServerList = data.data;
        if (that.mediaServerList.length > 0) {
          that.mediaServerId = that.mediaServerList[0].id
          that.setMediaServerPath(that.mediaServerId);
          that.getRecordList();
        }
      })
    },
    setMediaServerPath: function (serverId) {
      let that = this;
      let i;
      for (i = 0; i < that.mediaServerList.length; i++) {
        if (serverId === that.mediaServerList[i].id) {
          break;
        }
      }
      let port = that.mediaServerList[i].httpPort;
      if (location.protocol === "https:" && that.mediaServerList[i].httpSSlPort) {
        port = that.mediaServerList[i].httpSSlPort
      }
      that.mediaServerPath = location.protocol + "//" + that.mediaServerList[i].streamIp + ":" + port
      console.log(that.mediaServerPath)
    },
    getRecordList: function () {
      let that = this;
      this.$axios({
        method: 'get',
        url: `/record_proxy/${that.mediaServerId}/api/record/list`,
        params: {
          page: that.currentPage,
          count: that.count
        }
      }).then(function (res) {
        console.log(res)
        if (res.data.code === 0) {
          that.total = res.data.data.total;
          that.recordList = res.data.data.list;
        }
        that.loading = false;
      }).catch(function (error) {
        console.log(error);
        that.loading = false;
      });
    },
    backToList() {
      this.recordDetail = false;
    },
    chooseMediaChange(val) {
      console.log(val)
      this.total = 0;
      this.recordList = [];
      this.setMediaServerPath(val);
      this.getRecordList();
    },
    showRecordDetail(row) {
      this.recordDetail = true;
      this.chooseRecord = row;
      // 查询是否存在录像
      // this.$axios({
      //   method: 'delete',
      //   url:`/record_proxy/api/record/delete`,
      //   params: {
      //     page: this.currentPage,
      //     count: this.count
      //   }
      // }).then((res) => {
      //   console.log(res)
      //   this.total = res.data.data.total;
      //   this.recordList = res.data.data.list;
      // }).catch(function (error) {
      //   console.log(error);
      // });

    },
    deleteRecord() {
      // TODO
      let that = this;
      this.$axios({
        method: 'delete',
        url: `/record_proxy/api/record/delete`,
        params: {
          page: that.currentPage,
          count: that.count
        }
      }).then(function (res) {
        console.log(res)
        if (res.data.code === 0) {
          that.total = res.data.data.total;
          that.recordList = res.data.data.list;
        }
      }).catch(function (error) {
        console.log(error);
      });
    },


  }
};
</script>

<style>

</style>
