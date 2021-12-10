<template>
    <div>
        <el-tree
            :data="treeOfList"
            default-expand-all
            :expand-on-click-node="false"
            class="custom-tree"
        >
            <div
                slot-scope="{ node, data }"
                class="custom-tree-node"
                :class="{root: data.func_id === 0, leaf: data.func_key !== ''}"
            >
                <i class="empty el-icon-remove-outline" v-if="data.func_key === '' && !data.children"></i>
                <span v-text="data.func_name"></span>
                <el-button @click="beginAdd(data)" icon="el-icon-plus" v-if="data.func_key === ''"></el-button>
                <template v-if="data.func_id > 2">
                    <el-button icon="el-icon-edit" @click="beginUpdate(data)" ></el-button>
                    <el-button icon="el-icon-delete"
                               :disabled="!!data.children"
                               @click="removeHandler(data)"
                    ></el-button>
                </template>
                </div>
        </el-tree>
        <el-dialog :modal="false" :visible.sync="isEdit" title="编辑">
            <el-form label-width="120px" :model="model" :rules="rules" ref="form" status-icon>
                <el-form-item label="上级功能">
                    <el-select v-model="model.func_fid" :disabled="model.func_id === 0 || model.func_key === ''">
                        <el-option v-for="item in noLeafFunc" :key="item.func_id" :label="item.func_name" :value="item.func_id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="功能节点类型">
                    <el-radio-group :disabled="model.func_id !== 0 || model.func_fid > 0" v-model="isLeaf">
                        <el-radio :label="false">非叶子节点</el-radio>
                        <el-radio :label="true">叶子节点</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="功能名称：" prop="func_name">
                    <el-input v-model.trim="model.func_name" placeholder="请输入功能名称.."></el-input>
                </el-form-item>
                <el-form-item label="绑定组件：" v-show="isLeaf" prop="func_key">
                    <el-select v-model="model.func_key">
                        <el-option
                            v-for="(item, key) in views"
                            :key="key" :label="key" :value="key"
                            :disabled="list.some(func => func.func_key === key && func.func_id !== model.func_id )"

                        >
                            <el-tooltip placement="right" :content="item.remark">
                                <span v-text="key"></span>
                            </el-tooltip>
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button type="primary" @click="save">确定</el-button>
                <el-button @click="isEdit = false">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {mapState,mapGetters, mapActions} from 'vuex';
import views from '@/views';

export default {
    name: "Func",
    data() {
        return {
            views,
            isEdit: false,   // 编辑状态
            isLeaf: true,   // 叶子还是非叶子
            model: {
                func_id: 0,
                func_name: "",
                func_key: "",
                func_fid: -1
            },
            rules: {
                func_name: [
                    {
                        validator: (rule, value, callback) => {
                            if(value.length === 0)
                                callback(new Error('功能名称不能为空'));
                            else if(value.length < 2 || value.length > 15)
                                callback(new Error('功能名称长度 2 - 15'));
                            else if(this.list.some(item => item.func_name === value && item.func_id !== this.model.func_id))
                                callback(new Error('功能名称已存在'));
                            else
                                callback();
                        },
                        trigger: "blur"
                    }
                ],
                func_key: [
                    {
                        validator: (rule, value, callback) => {
                            if(this.isLeaf && value === "")
                                callback(new Error('叶子节点必须绑定组件'));
                            else
                                callback();
                        },
                        trigger: 'change',
                    }
                ]
            }
        }
    },
    computed: {
        ...mapState('func', ['list']),
        ...mapGetters('func', ['treeOfList']),
        noLeafFunc() {
            return [
                {func_id: 0, func_name: 'ROOT', func_key: "", func_fid: -1 },
                ...this.list.filter(item => item.func_key === "")
            ];
        }
    },
    methods: {
        ...mapActions("func", ["init", "remove", "add", "update"]),
        async removeHandler(func) {
            try {
                await this.$confirm(`确定删除"${func.func_name}"功能吗？`, '提示', { type: "warning" })
                await this.remove(func.func_id);
                this.$message({
                    type: "success",
                    message: `成功删除"${func.func_name}"功能, 系统功能菜单已更新，请刷新页面，启用新的功能菜单！`
                })
            } catch(e) {}
        },
        beginAdd(parentFunc) {
            this.isLeaf = true;
            this.model = { func_id: 0, func_name: "", func_key: "", func_fid: parentFunc.func_id };
            this.$nextTick(() => {
                if(this.$refs.form) this.$refs.form.clearValidate();
            });
            this.isEdit = true;
        },
        beginUpdate(func) {
            this.isLeaf = func.func_key !== "";
            this.model = {...func};
            this.$nextTick(() => {
                if(this.$refs.form) this.$refs.form.clearValidate();
            });
            this.isEdit = true;
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                await this[this.model.func_id === 0 ? "add" : "update"](this.model);
                this.isEdit = false;
                this.$message({
                    type: "success",
                    message: "功能编辑成功，系统功能菜单已更新，请刷新页面，启用新的功能菜单！"
                });
            } catch (e) {}
        }
    },
    async created() {
        this.init();
    }
}
</script>

<style scoped>
.custom-tree {
    width: 600px;
    font-weight: bold;

}

.custom-tree-node {
    width: 100%;
    display: flex;
    align-items: center;
}
.custom-tree-node.root {
    font-size: 18px;
    color: Orange;
}
.custom-tree-node.leaf {
    font-size: 13px;
    font-weight: normal;
    color: #000;
}
.custom-tree-node span {
    flex-grow: 1;
}

.custom-tree-node .el-button {
    padding: 8px 10px;
    border: none;
    background-color: transparent;
    margin-left: 0;
}
.custom-tree-node i.empty {
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    font-size: 14px;
}

/* 绑定组件下拉框 */
.el-select-dropdown__item {
    padding: 0;
}
.el-select-dropdown__item span {
    display: block;
    padding: 0 20px;
}
</style>