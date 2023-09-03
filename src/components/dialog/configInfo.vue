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
      <div id="shared" style="margin-top: 10px;margin-right: 100px;">
        <el-descriptions :span="2" title="SIP服务器信息">
          <el-descriptions-item label="ID">{{ configInfoData.id }}</el-descriptions-item>
          <el-descriptions-item label="域">{{ configInfoData.domain }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ configInfoData.ip }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ configInfoData.port }}</el-descriptions-item>
          <el-descriptions-item label="密码">
            <el-tag size="small">{{ configInfoData.password }}</el-tag>
          </el-descriptions-item>
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
      configInfoData: {}
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
