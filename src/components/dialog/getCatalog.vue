<template>
  <div id="getCatalog">

    <el-dialog v-if="showDialog" :append-to-body="true" :close-on-click-modal="false" :destroy-on-close="true"
               :visible.sync="showDialog" center title="选择要添加到的节点" width="50%"
               @close="close()">
      <div>
        <el-tree id="catalogTree"
                 ref="tree"
                 :expand-on-click-node="false"
                 :highlight-current="false"
                 :load="loadNode"
                 :props="props"
                 class="el-scrollbar"
                 default-expand-all
                 empty-text="未知节点"
                 lazy
                 node-key="id"
                 @node-click="nodeClickHandler">
       <span slot-scope="{ node, data }" class="custom-tree-node" style="width: 100%">
         <el-radio v-if="node.data.type === 0 || node.data.type === -1" v-model="chooseId" :label="node.data.id"
                   style="margin-right: 0">{{ '' }}</el-radio>
         <span v-if="node.data.type === -1 && node.level === 1" class="iconfont icon-ziyuan"
               style="font-size: 12px"></span>
         <span v-if="node.data.type === 0 && node.level === 1" class="el-icon-s-home"></span>
         <span v-if="node.data.type === 0 && node.level > 1" class="el-icon-folder-opened"></span>
         <span v-if="node.data.type === 1" class="iconfont icon-shexiangtou"></span>
         <span v-if="node.data.type === 2" class="iconfont icon-zhibo"></span>
        <span style=" padding-left: 1px">{{ node.label }}</span>
        <span>
          <i v-if="node.data.id === defaultCatalogIdSign"
             style="margin-left: 5rem; color: #9d9d9d; padding-right: 20px">默认</i>
        </span>
      </span>
        </el-tree>
      </div>
      <div style="float: right; height: 13rem">
        <el-button size="mini" type="primary" @click="submit()">确认</el-button>
        <el-button size="mini" @click="close()">取消</el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>

export default {
  name: 'getCatalog',
  beforeCreate() {

  },
  created() {
    this.chooseId = this.defaultCatalogId;
    this.defaultCatalogIdSign = this.defaultCatalogId;
    this.initData();
    setTimeout(() => {
      if (this.catalogIdChange) this.catalogIdChange(this.defaultCatalogId);
    }, 100)

  },
  props: ['platformId'],
  data() {
    return {
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      platformName: null,
      defaultCatalogId: null,
      catalogIdResult: null,
      showDialog: false,
      defaultCatalogIdSign: null,
      chooseNode: null,
      chooseId: "",
      catalogTree: null,
      contextmenuShow: false,

    };
  },
  methods: {
    openDialog(catalogIdResult) {
      console.log(this.chooseId)
      this.showDialog = true
      this.catalogIdResult = catalogIdResult
    },
    initData: function () {
      this.getCatalog();
    },

    getCatalog: function (parentId, callback) {
      let that = this;
      this.$axios({
        method: "get",
        url: `/api/platform/catalog`,
        params: {
          platformId: that.platformId,
          parentId: parentId
        }
      })
          .then((res) => {
            if (res.data.code === 0) {
              if (typeof (callback) === 'function') {
                callback(res.data.data)
              }
            }
          })
          .catch(function (error) {
            console.log(error);
          });

    },
    loadNode: function (node, resolve) {
      if (node.level === 0) {
        this.$axios({
          method: "get",
          url: `/api/platform/info/` + this.platformId,
        })
            .then((res) => {
              if (res.data.code === 0) {
                this.platformName = res.data.data.name;
                this.defaultCatalogId = res.data.data.catalogId;
                this.defaultCatalogIdSign = res.data.data.catalogId;
                this.chooseId = res.data.data.catalogId;
                resolve([
                  {
                    name: this.platformName,
                    id: res.data.data.deviceGBId,
                    type: 0
                  }
                ]);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
      }
      if (node.level >= 1) {
        this.getCatalog(node.data.id, resolve)
      }
    },
    nodeClickHandler: function (data, node, tree) {
      this.chooseId = data.id;
    },
    close: function () {
      this.chooseId = null;
      this.showDialog = false;
    },
    submit: function () {
      console.log(this.chooseId)
      if (this.chooseId === null) {
        this.$message({
          showClose: true,
          message: '未选择任何节点,',
          type: 'warning'
        });
        return;
      }
      if (this.catalogIdResult) this.catalogIdResult(this.chooseId)
      this.showDialog = false;
    },
  }
};
</script>

<style>
#catalogTree {
  display: inline-block;
}
</style>
