<template>
  <div id="importChannelShowErrorData" v-loading="isLoging">
    <el-dialog
        :append-to-body="true"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        :visible.sync="showDialog"
        title="导入通道数据成功，但数据存在重复"
        top="2rem"
        width="30rem"
        @close="close()"
    >
      <div>
        重复国标ID:
        <el-button v-clipboard="gbIds.join(',')" icon="el-icon-document-copy" size="mini" style="float: right;"
                   title="点击拷贝"
                   type="primary" @success="$message({type:'success', message:'成功拷贝到粘贴板'})">复制
        </el-button>
        <ul class="errDataBox">
          <li v-for="id in gbIds">
            {{ id }}
          </li>
        </ul>
      </div>

      <div>
        重复App/stream:
        <el-button v-clipboard="streams.join(',')" icon="el-icon-document-copy" size="mini" style="float: right;"
                   title="点击拷贝"
                   type="primary" @success="$message({type:'success', message:'成功拷贝到粘贴板'})">复制
        </el-button>
        <ul class="errDataBox">
          <li v-for="id in streams">
            {{ id }}
          </li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: "importChannelShowErrorData",
  computed: {},
  created() {
  },
  props: ['gbIds', 'streams'],
  data() {
    return {
      isLoging: false,
      showDialog: false,
    };
  },
  methods: {
    openDialog: function () {
      this.showDialog = true;
    },
    close: function () {
      this.showDialog = false;
    },
  },
};
</script>
<style>
.errDataBox {
  max-height: 15rem;
  overflow: auto;
}
</style>
