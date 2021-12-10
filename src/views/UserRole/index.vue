<template>
    <el-container>
        <el-header>
            <el-form inline>
                <el-form-item label="用户名：">
                    <el-input v-model="search.user_name" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="角色：">
                    <el-select v-model="search.role_id">
                        <el-option :value="-1" label="- 请选择 -"></el-option>
                        <el-option :value="0" label="- 无角色 -"></el-option>
                        <el-option v-for="item in roleList" :key="item.role_id"
                                   :label="item.role_name" :value="item.role_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" type="primary" @click="getUserList()">搜索</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-plus" type="success" @click="beginAdd">新增用户</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="list" border stripe>
                <el-table-column align="center" label="#" type="index" width="70"></el-table-column>
                <el-table-column label="用户名" prop="user_name" width="150"></el-table-column>
                <el-table-column label="密码" width="180">
                    <template slot-scope="{row}">
                        <el-tooltip :content="row.user_pwd" placement="right">
                            <el-button type="info" icon="el-icon-view" size="small">查看</el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="角色名" width="150">
                    <template slot-scope="{row}">
                        <span v-if="row.role_id === null" style="color: #aaa">无角色</span>
                        <span v-else v-text="roleList.find(item => item.role_id === row.role_id).role_name"></span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="{row}">
                        <el-button icon="el-icon-edit" size="small" type="warning" @click="beginUpdate(row)">修改
                        </el-button>
                        <el-button icon="el-icon-delete" size="small" type="danger" @click="remove(row.user_name)">删除
                        </el-button>
                        <el-button icon="el-icon-setting" size="small" type="primary" @click="beginSet(row)">角色分配
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer>
            <el-pagination
                :current-page.sync="pagination.currentPage"
                :page-size.sync="pagination.pageSize"
                :page-sizes="[5, 8, 10, 15]"
                :total="pagination.total"
                layout="prev, pager, next, jumper, ->, sizes, total"
                @size-change="getUserList()"
                @current-change="getUserList(false)"
            >
            </el-pagination>
        </el-footer>
        <el-dialog :modal="false" :visible="edit.mode !== 0"
                   class="custom-dialog" title="用户编辑"
                   @close="edit.mode = 0">
            <el-form ref="form" :model="edit.model" :rules="edit.rules" label-width="80px" status-icon>
                <el-form-item label="用户名：" prop="user_name">
                    <el-input v-model.trim="edit.model.user_name" :disabled="edit.mode !== 1"></el-input>
                </el-form-item>
                <el-form-item v-show="edit.mode !== 3" label="密码：" prop="user_pwd">
                    <el-input v-model="edit.model.user_pwd"></el-input>
                </el-form-item>
                <el-form-item v-show="edit.mode === 3" label="角色">
                    <el-select v-model="edit.model.role_id">
                        <el-option :value="0" label="- 无角色 -"></el-option>
                        <el-option v-for="item in roleList" :key="item.role_id"
                                   :label="item.role_name" :value="item.role_id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button type="primary" @click="save">确定</el-button>
                <el-button @click="edit.mode = 0">取消</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex';

export default {
    name: "UserRole",
    data() {
        return {
            list: [],
            search: {
                user_name: '',
                role_id: -1
            },
            pagination: {
                currentPage: 1,
                total: 0,
                pageSize: 5
            },
            edit: {
                // 0 -> 没进入编辑， 1 -> 新增， 2 -> 修改， 3 -> 角色分配
                mode: 0,
                model: {
                    user_name: '',
                    user_pwd: '',
                    role_id: null
                },
                rules: {
                    user_name: [
                        {
                            validator: async (rule, value, callback) => {
                                if (this.edit.mode !== 1)
                                    callback();
                                if (value.length === 0)
                                    callback(new Error('用户名不能为空'));
                                else if (value.length < 2 || value.length > 15)
                                    callback(new Error('用户名长度 2 - 15'));
                                else if (await this.$http({
                                    method: 'post',
                                    url: 'user/valid_name',
                                    data: {user_name: value}
                                }))
                                    callback(new Error('角色名称已存在'));
                                else
                                    callback();
                            },
                            trigger: "blur"
                        }
                    ],
                    user_pwd: [
                        {required: true, message: '密码不能为空', trigger: "blur"},
                        {min: 3, max: 15, message: '密码长度 3 - 15', trigger: 'blur'}
                    ]
                },
            },
        }
    },
    computed: {
        ...mapState('role', {'roleList': 'list'})
    },
    methods: {
        ...mapActions('role', {'roleInit': 'init'}),
        async getUserList(isFormPage1 = true) {
            if (isFormPage1) this.pagination.currentPage = 1;
            // isFormPage1 && (this.pagination.currentPage = 1);
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/user/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                });
                this.list = result.list;
                this.pagination.total = result.total;
            } catch (e) {
            }
        },
        async remove(user_name) {
            try {
                await this.$confirm(`确定删除用户"${user_name}"吗？`, '提示', {type: "warning"})
                await this.$http({
                    method: 'post',
                    url: '/user/remove/' + user_name,
                });
                this.$message({
                    type: "success",
                    message: `成功删除用户"${user_name}"！`
                });
                // 删除唯一一页的最后一条（无需发ajax请求数据）
                if (this.pagination.total === 1) this.list = [];
                // 删除最后一页的最后一条（页码-1，发ajax）
                else if (this.list.length === 1) {
                    this.pagination.currentPage -= 1;
                    this.getUserList(false);
                }
                // 删除最后一页的非最后一条（无需发ajax请求的数据补齐）
                else if (this.list.length < this.pagination.pageSize) {
                    let i = this.list.findIndex(item => item.user_name === user_name);
                    this.list.splice(i, 1);
                }
                // 说明后面还有数据可以补齐
                else this.getUserList(false);
            } catch (e) {
            }
        },
        beginAdd() {
            this.edit.model = {user_name: '', user_pwd: '', role_id: 0};
            // 只是清除表单上一次残留的校验结果和本次赋初始值产生的校验结果，而不重置表单
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.clearValidate();
            });
            this.edit.mode = 1;
        },
        beginUpdate(row) {
            this.edit.model = {
                user_name: row.user_name,
                user_pwd: row.user_pwd,
                role_id: row.role_id
            }
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.clearValidate();
            });
            this.edit.mode = 2;
        },
        beginSet(row) {
            this.edit.model = {
                user_name: row.user_name,
                user_pwd: row.user_pwd,
                role_id: row.role_id || 0
            };
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.clearValidate();
            });
            this.edit.mode = 3;
        },
        async save() {
            try {
                await this.$refs.form.validate();
                switch (this.edit.mode) {
                    case 1:
                        await this.$http({
                            method: 'post',
                            url: '/user/add',
                            data: this.edit.model
                        });
                        this.list.push(this.edit.model);
                        this.$message({
                            type: "success",
                            message: `新增用户："${this.edit.model.user_name}"成功！`
                        });
                    case 2:
                        await this.$http({
                            method: 'post',
                            url: '/user/change_pwd',
                            data: this.edit.model
                        });
                        let i = this.list.findIndex(item => item.user_name === this.edit.model.user_name);
                        this.list.splice(i, 1, this.edit.model);
                        this.$message({
                            type: "success",
                            message: `修改成功！`
                        });
                        break;
                    case 3:
                        await this.$http({
                            method: 'post',
                            url: '/user/config_role',
                            data: this.edit.model
                        });
                        i = this.list.findIndex(item => item.user_name === this.edit.model.user_name);
                        this.edit.model.role_id = this.edit.model.role_id || null;
                        this.list.splice(i, 1, this.edit.model);
                        this.$message({
                            type: "success",
                            message: `用户："${this.edit.model.user_name}"角色分配成功！`
                        });
                }
                this.edit.mode = 0;
            } catch (e) {
            }

        },
    },
    created() {
        this.getUserList = this.$throttle(this.getUserList, 500);
        this.roleInit();
        this.getUserList();
    }
}
</script>

<style scoped>
.el-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
}
</style>