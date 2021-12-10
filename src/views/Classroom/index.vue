<template>
    <div>
        <div class="header">
            <span class="Gold"></span>已占用
            <span class="Green"></span>未占用
        </div>
        <el-row :gutter="20">
            <el-col :span="6" v-for="item in list">
                <el-card :class="item.clsr_occupy === 0 ? 'Green' : 'Gold' ">
                    <div>
                        <i class="el-icon-s-home"></i>
                        <span v-text="item.clsr_name"></span>
                    </div>
                    <div>
                        <el-button type="text" icon="el-icon-edit" @click="beginUpdate(item)"></el-button>
                        <el-button v-if="item.clsr_occupy === 0" type="text" icon="el-icon-delete" @click="removeHandler(item)"></el-button>
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
                <el-form-item label="角色名称：" prop="clsr_name">
                    <el-input v-model.trim="model.clsr_name"></el-input>
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
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    name: "Classroom",
    data() {
        return {
            isEdit: false,
            model: {
                clsr_id: 0,
                clsr_name: "",
                clsr_occupy: 0
            },
            rules: {
                clsr_name: [
                    {
                        validator: (rule, value, callback) => {
                            if(value.length === 0)
                                callback(new Error('角色名称不能为空'));
                            else if(value.length < 2 || value.length > 15)
                                callback(new Error('功能名称长度 2 - 15'));
                            else if(this.list.some(item => item.clsr_name === value && item.clsr_id !== this.model.clsr_id))
                                callback(new Error('角色名称已存在'));
                            else
                                callback();
                        },
                        trigger: "blur"
                    }
                ],
            },
        }
    },
    computed: {
        ...mapState('classroom', ['list']),
    },
    methods: {
        ...mapActions('classroom', ['init', 'add', 'update', 'remove']),
        async removeHandler(clsr) {
            try {
                await this.$confirm("确定删除吗？", '提示', {type: "warning"})
                await this.remove(clsr.clsr_id);
                this.$message({
                    type: "success",
                    message: "删除成功！"
                })
            } catch (e) {}
        },
        beginAdd() {
            if (this.$refs.form) this.$refs.form.clearValidate();
            this.model = {clsr_id: 0, clsr_name: "", clsr_occupy: 0};
            this.isEdit = true;
        },
        beginUpdate(clsr) {
            if (this.$refs.form) this.$refs.form.clearValidate();
            this.model = {...clsr}
            this.isEdit = true;
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                await this[this.model.clsr_id === 0 ? "add" : "update"](this.model);
                this.isEdit = false;
                this.$message({
                    type: "success",
                    message: "角色编辑成功!"
                });
            } catch (e) {}
        },
    },
    created() {
        this.init();

    }
}
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-bottom: 10px;
}
.header span {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 5px;
}
.header span:nth-child(2) {
    margin-left: 10px;
}
.Gold {
    background-color: Gold;
}
.Green {
    background-color: DeepSkyBlue;
}
/deep/ .el-card__body {
    height: 50px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #fff;
}
.el-col {
    padding: 10px 0;
}
.el-card i {
    font-size: 24px;
}
.el-card span {
    font-size: 18px;
    margin-left: 10px;
}
.el-card div {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.el-card .el-button {
    color: white;
    font-size: 18px;
}
.card-add .el-button {
    color: orange;
}
</style>