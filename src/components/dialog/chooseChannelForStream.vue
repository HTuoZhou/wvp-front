<template>
  <div id="chooseChannelFoStream" v-loading="loading">
    <div style="font-size: 17px; color: #606060; white-space: nowrap; line-height: 30px; font-family: monospace;">
      <span v-if="catalogId == null">{{ catalogName }}的直播通道</span>
      <span v-if="catalogId != null">{{ catalogName }}({{ catalogId }})的直播通道</span>
    </div>
    <div
      style="background-color: #FFFFFF; margin-bottom: 1rem; position: relative; padding: 0.5rem; text-align: left;font-size: 14px;">

      搜索:
      <el-input v-model="searchSrt" clearable placeholder="关键字" prefix-icon="el-icon-search"
                size="mini" style="margin-right: 1rem; width: auto;" @input="getChannelList"></el-input>

      <!--      流媒体: <el-select size="mini" @change="getChannelList" style="margin-right: 1rem;" v-model="mediaServerId" placeholder="请选择" default-first-option>-->
      <!--      <el-option label="全部" value=""></el-option>-->
      <!--      <el-option-->
      <!--        v-for="item in mediaServerList"-->
      <!--        :key="item.id"-->
      <!--        :label="item.id"-->
      <!--        :value="item.id">-->
      <!--      </el-option>-->
      <!--      </el-select>-->
      推流状态:
      <el-select v-model="pushing" default-first-option placeholder="请选择" size="mini" style="margin-right: 1rem;"
                 @change="getChannelList">
        <el-option label="全部" value=""></el-option>
        <el-option label="推流进行中" value="true"></el-option>
        <el-option label="推流未进行" value="false"></el-option>
      </el-select>
      <el-button v-if="catalogId !== null" :disabled="gbStreams.length === 0 || multipleSelection.length === 0" icon="el-icon-delete" size="mini"
                 style="margin-right: 1rem;" type="danger" @click="batchDel">
        批量移除
      </el-button>
      <el-button v-if="catalogId === null" :disabled="gbStreams.length === 0 || multipleSelection.length === 0" icon="el-icon-plus" size="mini"
                 style="margin-right: 1rem;" @click="batchAdd">批量添加
      </el-button>
      <el-button v-if="catalogId === null" icon="el-icon-plus" size="mini" style="margin-right: 1rem;" @click="add()">
        全部添加
      </el-button>
      <el-button v-if="catalogId !== null" icon="el-icon-delete" size="mini" style="margin-right: 1rem;" type="danger"
                 @click="remove()">全部移除
      </el-button>
    </div>
    <el-table ref="gbStreamsTable" :data="gbStreams" :height="winHeight" :row-key="(row)=> row.app + row.stream" border
              style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column :reserve-selection="true" align="center" type="selection" width="55">
      </el-table-column>
      <el-table-column align="center" label="名称" prop="name" show-overflow-tooltip>
      </el-table-column>
      <el-table-column align="center" label="应用名" prop="app" show-overflow-tooltip>
      </el-table-column>
      <el-table-column align="center" label="流ID" prop="stream" show-overflow-tooltip>
      </el-table-column>
      <el-table-column align="center" label="国标编码" prop="gbId" show-overflow-tooltip>
      </el-table-column>
      <el-table-column align="center" label="流来源" width="100">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <el-tag v-if="scope.row.streamType == 'proxy'" size="medium">拉流代理</el-tag>
            <el-tag v-if="scope.row.streamType == 'push'" size="medium">推流</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button-group>
            <el-button v-if="catalogId === null" icon="el-icon-plus" size="mini" @click="add(scope.row, scope)">添加
            </el-button>
            <el-button v-if="catalogId !== null" icon="el-icon-delete" size="mini" type="danger"
                       @click="remove(scope.row, scope)">移除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="currentPage" :page-size="count"
                   :page-sizes="[10, 20, 30, 50]" :total="total" layout="total, sizes, prev, pager, next"
                   style="float: right;margin-top: 1rem;" @size-change="handleSizeChange" @current-change="currentChange">
    </el-pagination>
    <getCatalog ref="getCatalog" :platformId="platformId"></getCatalog>
  </div>
</template>

<script>
import MediaServer from './../service/MediaServer'
import getCatalog from './getCatalog'

export default {
  name: 'chooseChannelFoStream',
  computed: {
    // getPlayerShared: function () {
    //     return {
    //         sharedUrl: window.location.host + '/' + this.videoUrl,
    //         sharedIframe: '<iframe src="' + window.location.host + '/' + this.videoUrl + '"></iframe>',
    //         sharedRtmp: this.videoUrl
    //     };
    // }
  },
  props: ['platformId', 'catalogId', 'catalogName'],
  created() {
    this.initData();
    console.log(this.catalogId)
  },
  components: {
    getCatalog,
  },
  data() {
    return {
      loading: false,
      gbStreams: [],
      gbChoosechannel: {},
      channelType: "",
      online: "",
      choosed: "",
      currentPage: 1,
      count: 10,
      total: 0,
      searchSrt: "",
      pushing: "",
      mediaServerId: "",
      mediaServerList: [],
      mediaServerObj: new MediaServer(),
      eventEnable: false,
      multipleSelection: [],
      winHeight: window.innerHeight - 350,

    };
  },
  watch: {
    platformId(newData, oldData) {
      this.getChannelList()
    },
    catalogId(newData, oldData) {
      this.getChannelList()
    },
  },
  methods: {
    initData: function () {
      this.mediaServerObj.getOnlineMediaServerList((data) => {
        this.mediaServerList = data.data;
      })
      this.getChannelList();
    },
    currentChange: function (val) {
      this.currentPage = val;
      this.getChannelList();
    },
    handleSizeChange: function (val) {
      this.count = val;
      console.log(val)
      this.getChannelList();

    },
    add: function (row, scope) {
      let all = typeof (row) === "undefined"
      this.getCatalogFromUser((catalogId) => {
        let task = null;
        this.$axios({
          method: "post",
          url: "/api/gbStream/add",
          data: {
            platformId: this.platformId,
            catalogId: catalogId,
            all: all,
            gbStreams: all ? [] : [row],
          }
        }).then((res) => {
          console.log("保存成功")
          window.clearTimeout(task);
          this.loading = false;
          // this.gbStreams.splice(scope.$index,1)
          this.getChannelList();
        }).catch(function (error) {
          window.clearTimeout(task);
          this.loading = false;
          console.log(error);
        });
        task = setTimeout(() => {
          this.loading = true;
        }, 200)
      })


    },
    remove: function (row, scope) {
      let all = typeof (row) === "undefined"
      this.$confirm(`确定移除${all ? "所有通道" : ""}吗？`, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$axios({
          method: "delete",
          url: "/api/gbStream/del",
          data: {
            platformId: this.platformId,
            all: all,
            gbStreams: all ? [] : [row],
          }
        }).then((res) => {
          console.log("移除成功")
          // this.gbStreams.splice(scope.$index,1)
          this.getChannelList();
        }).catch(function (error) {
          console.log(error);
        });
      }).catch(() => {

      });

    },
    getChannelList: function () {
      let that = this;

      this.$axios({
        method: 'get',
        url: `/api/gbStream/list`,
        params: {
          page: that.currentPage,
          count: that.count,
          query: that.searchSrt,
          platformId: that.platformId,
          catalogId: that.catalogId,
          mediaServerId: that.mediaServerId
        }
      })
        .then(function (res) {
          if (res.data.code === 0) {
            that.total = res.data.data.total;
            that.gbStreams = res.data.data.list;
            that.gbChoosechannel = {};
            // 防止出现表格错位
            that.$nextTick(() => {
              that.$refs.gbStreamsTable.doLayout();
              // 默认选中
              that.eventEnable = true;
            })
          }
        })
        .catch(function (error) {
          console.log(error);
        });

    },
    batchDel: function () {
      this.$confirm(`确认这${this.multipleSelection.length}个通道吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: "delete",
          url: "/api/gbStream/del",
          data: {
            platformId: this.platformId,
            gbStreams: this.multipleSelection,
          }
        }).then((res) => {
          console.log("移除成功")
          this.$refs.gbStreamsTable.clearSelection()
          this.getChannelList();
        }).catch(function (error) {
          console.log(error);
        });
      }).catch(() => {
      });

    },
    batchAdd: function () {
      this.getCatalogFromUser((catalogId) => {
        this.$axios({
          method: "post",
          url: "/api/gbStream/add",
          data: {
            platformId: this.platformId,
            catalogId: catalogId,
            gbStreams: this.multipleSelection,
          }
        }).then((res) => {
          console.log("保存成功")
          this.$refs.gbStreamsTable.clearSelection()
          this.getChannelList();
        }).catch(function (error) {
          console.log(error);
        });
      })
    },
    getCatalogFromUser(callback) {
      this.$refs.getCatalog.openDialog(callback)
    },
    handleSelectionChange: function (val) {
      this.multipleSelection = val;
    },
  }
};
</script>

<style>

</style>
