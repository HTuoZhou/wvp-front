<template>
  <div id="configInfo">
    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :visible.sync="showDialog"
      title="系统信息"
      top="2rem"
      width="=80%"
      @close="close()"
    >
      <div id="shared" style="margin-top: 1rem;margin-right: 100px;">
        <el-descriptions v-if="configInfoData.sip" :span="2" title="国标服务信息">
          <el-descriptions-item label="编号">{{ configInfoData.sip.id }}</el-descriptions-item>
          <el-descriptions-item label="域">{{ configInfoData.sip.domain }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ configInfoData.sip.showIp }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ configInfoData.sip.port }}</el-descriptions-item>
          <el-descriptions-item label="密码">
            <el-tag size="small">{{ configInfoData.sip.password }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions v-if="configInfoData.version" title="版本信息">
          <el-descriptions-item label="版本">{{ configInfoData.version.version }}</el-descriptions-item>
          <el-descriptions-item label="编译时间">{{ configInfoData.version.BUILD_DATE }}</el-descriptions-item>
          <el-descriptions-item label="GIT版本">{{ configInfoData.version.GIT_Revision_SHORT }}</el-descriptions-item>
          <el-descriptions-item label="GIT最后提交时间">{{ configInfoData.version.GIT_DATE }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "configInfo",
  props: {},
  computed: {},
  created() {
  },
  data() {
    return {
      showDialog: false,
      configInfoData: {
        sip: {},

      }
    };
  },
  methods: {
    openDialog: function (data) {
      console.log(data)
      this.showDialog = true;
      this.configInfoData = data;
    },
    close: function () {
      this.showDialog = false;
    },
  },
};
</script>
