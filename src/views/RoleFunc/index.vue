<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="6" v-for="item in list" :key="item.role_id">
                <el-card shadow="hover">
                    <div class="card-content">
                        <span v-text="item.role_name"></span>
                        <div>
                            <el-button type="text" icon="el-icon-edit" @click="beginUpdate(item)"></el-button>
                            <el-button type="text" icon="el-icon-delete" @click="removeHandler(item)"></el-button>
                            <el-button type="text" icon="el-icon-setting" @click="beginConfig(item.role_id)"></el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card @click.native="beginAdd" shadow="hover" style="background-color: transparent; border: 1px dashed Orange">
                    <div class="card-add">
                            <!-- + -->
                        <el-button type="text" icon="el-icon-plus"></el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog :modal="false" :visible.sync="isEdit" title="编辑">
            <el-form label-width="120px" :model="model" :rules="rules" ref="form" status-icon>
                <el-form-item label="角色名称：" prop="role_name">
                    <el-input v-model.trim="model.role_name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button type="primary" @click="save">确定</el-button>
                <el-button @click="isEdit = false">取消</el-button>
            </div>
        </el-dialog>
        <el-drawer class="custom-drawer" title="角色功能分配"
            :visible.sync="isConfig" :modal="false">
            <!-- isOpen表示按钮准备状态（true-false） -->
            <el-tree :data="treeOfList" default-expand-all
                :expand-on-click-node="false" class="custom-tree">
                <div slot-scope="{ node, data }" class="custom-tree-node"
                    :class="{ level1 : data.func_fid === 0, root : data.func_fid === -1 }">
                    <span v-text="data.func_name"></span>
                        <!--   这里出错了！！！    -->
                    <el-switch
                        :value="config.role_func_ids.indexOf(data.func_id) !== -1"
                        @change="isOpen => swithChange(data, isOpen)"
                        v-if="data.func_id !== 0"
                    ></el-switch>
                </div>
            </el-tree>
            <div class="btn">
                <el-button type="primary" @click="configFunc">确定</el-button>
                <el-button @click="isConfig = false">取消</el-button>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    name: "RoleFunc",
    data() {
        return {
            isEdit: false,
            model: {
                role_id: 0,
                role_name: "",
            },
            rules: {
                role_name: [
                    {
                        validator: (rule, value, callback) => {
                            if(value.length === 0)
                                callback(new Error('角色名称不能为空'));
                            else if(value.length < 2 || value.length > 15)
                                callback(new Error('功能名称长度 2 - 15'));
                            else if(this.list.some(item => item.role_name === value && item.role_id !== this.model.role_id))
                                callback(new Error('角色名称已存在'));
                            else
                                callback();
                        },
                        trigger: "blur"
                    }
                ],
            },
            isConfig: false,    //抽屉驱动数据
            config: {
                role_id: 0,
                role_func_ids: []
            }
        }
    },
    computed: {
        ...mapState('role', ['list']),
        ...mapGetters('func', ['treeOfList']),
    },
    methods: {
        ...mapActions('role', ['init', 'remove', 'add', 'update']),
        ...mapActions('func', { "funcInit" : "init" } ),
        async removeHandler(role) {
            try {
                await this.$confirm("确定删除吗？", '提示', {type: "warning"})
                await this.remove(role.role_id);
                this.$message({
                    type: "success",
                    message: "删除成功！"
                })
            } catch (e) {
            }
        },
        beginAdd() {
            if (this.$refs.form) this.$refs.form.clearValidate();
            this.model = {role_id: 0, role_name: ""};
            this.isEdit = true;
        },
        beginUpdate(role) {
            if (this.$refs.form) this.$refs.form.clearValidate();
            this.model = {...role}
            this.isEdit = true;
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                await this[this.model.role_id === 0 ? "add" : "update"](this.model);
                this.isEdit = false;
                this.$message({
                    type: "success",
                    message: "角色编辑成功!"
                });
            } catch (e) {}
        },
        async beginConfig(role_id) {
            this.config.role_id = role_id;  //必须先存，不然后面保存的时候找不到
            this.config.role_func_ids = [];
            let roleFuncs = await this.$http({ url: '/role_function/list/' + role_id });
            roleFuncs.forEach(item => this.config.role_func_ids.push(item.func_id));
            this.isConfig = true;
        },
        swithChange(func, isOpen) {
            let { children, ...temp } = func;
            if(isOpen) {    // 打开
                // 让自己打开
                this.config.role_func_ids.push(func.func_id);
                // 打开关联节点
                if(func.func_key === "") {  // 打开的是非叶子
                    // 打开的是非叶子且有儿子(那就同步打开儿子)
                    if(children) children.forEach(item => this.config.role_func_ids.push(item.func_id));
                } else { // 打开的是叶子
                    // 是一级节点
                    if(func.func_fid === 0) return;
                    // 同步打开父节点
                    if(this.config.role_func_ids.indexOf(func.func_fid) === -1)
                        this.config.role_func_ids.push(func.func_fid);
                }
            } else {    // 关闭
                // 关闭自己
                let i = this.config.role_func_ids.indexOf(func.func_id);
                this.config.role_func_ids.splice(i, 1);
                // 关闭关联节点
                if(func.func_key === "") {  // 非叶子
                    // 且有儿子
                    if(children) children.forEach(item => {
                        let i = this.config.role_func_ids.indexOf(item.func_id);
                        if(i !== -1) this.config.role_func_ids.splice(i, 1);
                    });
                } else {    // 叶子
                    // 一级节点，啥也不干
                    if(func.func_fid === 0) return;
                    // 非一级节点（判断还有没有其他兄弟打开，没有就把父亲关了）
                    let isCloseParent = true;
                    this.treeOfList[0].children.find(item => item.func_id === func.func_fid).children.forEach(item => {
                            if(this.config.role_func_ids.indexOf(item.func_id) !== -1) isCloseParent = false;
                    });
                    if(isCloseParent) {
                        let i = this.config.role_func_ids.indexOf(func.func_fid);
                        if(i !== -1) this.config.role_func_ids.splice(i,1);
                    }
                }
            }
        },
        async configFunc() {
            await  this.$http({
                method: "post",
                url: "/role_function/config",
                data: {
                    role_id: this.config.role_id,
                    role_func_ids: this.config.role_func_ids.join(',')
                }
            });
            this.$message({
                type: "success",
                message: "角色功能配置成功.."
            });
            this.isConfig = false;
        }

    },
    created() {
        this.init();
        this.funcInit();
    }
}
</script>

<style scoped>
    .el-card {
        background-color: Gold;
    }
    .card-content {
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;

    }
    .card-content button {
        color: #fff;
    }
    .card-add {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
    }
    .custom-tree-node {
        width: 100%;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
    }
    .custom-tree-node.level1 {
        padding-right: 40px;
    }
    .custom-tree-node.root {
        padding-right: 80px;
    }
    .btn {
        margin-top: 50px;
        text-align: center;
    }
</style>