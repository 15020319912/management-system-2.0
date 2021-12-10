<template>
    <el-container>
        <el-header style="height: 40px">
            <el-form class="header-form" inline>
                <el-form-item label="班级名称：">
                    <el-input v-model="search.cls_name" placeholder="班级名称"></el-input>
                </el-form-item>
                <el-form-item label="班级专业：">
                    <el-select v-model="search.cls_dic_id_major">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('class_major')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="班级状态：">
                    <el-select v-model="search.cls_status">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option :value="1" label="开课中"></el-option>
                        <el-option :value="2" label="未开课"></el-option>
                        <el-option :value="3" label="结课"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" type="primary" @click="beginSearch">搜索</el-button>
                    <el-button icon="el-icon-plus" type="success" @click="beginAdd">新增班级</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="list" border stripe>
                <el-table-column fixed="left" align="center" label="#" type="index" width="50"></el-table-column>
                <el-table-column fixed="left" align="center" label="班级名称" width="120">
                    <template slot-scope="{row}">
                        <el-tag
                            disable-transitions
                            type="primary"
                            v-text="row.cls_name"
                        ></el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="班级专业" width="100">
                    <template slot-scope="{row}">
                        <div class="major" v-if="row.cls_dic_id_major === 8">
                            <img src="/img/java.png"></img>
                            <span>Java</span>
                        </div>
                        <div class="major" v-if="row.cls_dic_id_major === 9">
                            <img src="/img/html5.png"></img>
                            <span>H5前端</span>
                        </div>
                        <div class="major" v-if="row.cls_dic_id_major === 10">
                            <img src="/img/UI.png"></img>
                            <span>UI设计</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="教学老师" width="100">
                    <template slot-scope="{row}">
                        <span v-text="staffListTeacher.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="教务老师" width="100">
                    <template slot-scope="{ row }">
                        <span v-text="staffListAdmin.find(item => item.stf_id === row.cls_stf_id_admin).stf_name"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="就业老师" width="150">
                    <template slot-scope="{ row }">
                        <span v-text="staffListJob.find(item => item.stf_id === row.cls_stf_id_job).stf_name"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="教室" width="120">
                    <template slot-scope="{row}">
                        <i class="el-icon-data-analysis" style="color: OrangeRed"></i>
                        <span v-if="row.cls_clsr_id === null"> 无教室 </span>
                        <span v-else v-text="clsrList.find(item => item.clsr_id === row.cls_clsr_id).clsr_name"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="开课时间" width="150">
                    <template slot-scope="{row}">
                        <div v-if=" row.cls_begin !== null && row.cls_begin !== '' " style="color: #67c23a">
                            <i class="el-icon-date"></i>
                            <span v-text="row.cls_begin"></span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="结课时间" width="150">
                    <template slot-scope="{row}">
                        <div v-if="row.cls_end !== null && row.cls_end !== ''" style="color: red">
                            <i class="el-icon-date"></i>
                            <span v-text="row.cls_end"></span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="班级状态" prop="cls_status" width="150">
                    <template slot-scope="{row}">
                        <span v-if="row.cls_begin !== null && row.cls_end === null || row.cls_begin !== '' && row.cls_end === '' " style="color: #67c23a">开课中</span>
                        <span v-else-if="row.cls_begin !== null && row.cls_end !== null && row.cls_begin !== '' && row.cls_end !== ''" style="color: red">结课</span>
                        <span v-else-if="row.cls_begin === null && row.cls_end === null || row.cls_begin === '' && row.cls_end === '' "
                              style="color: #999999">未开课</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="备注" width="300">
                    <template slot-scope="{row}">
                        <span v-if="row.cls_remark !== null">
                            <el-tooltip :content="row.cls_remark" class="item" effect="dark" placement="top">
                                <span class="nowrap" v-text="row.cls_remark"></span>
                            </el-tooltip>
                        </span>
                        <span v-else style="color: #999">暂无相关备注</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" width="180">
                    <template slot-scope="{row}">
                        <el-button class="el-icon-edit" size="mini" type="primary" @click="beginUpdate(row)">编辑
                        </el-button>
                        <el-button size="mini" type="success" @click="btnStart(row)"
                                   v-if="row.cls_begin === null && row.cls_end === null || row.cls_begin === '' && row.cls_end === ''">
                            开课
                        </el-button>
                        <el-button size="mini" type="danger" @click="end(row)"
                                   v-else-if="row.cls_begin !== null && row.cls_end === null || row.cls_begin !== '' && row.cls_end === ''">
                            结课
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer style="height: 40px">
            <el-pagination
                :current-page.sync="pagination.currentPage"
                :page-size.sync="pagination.pageSize"
                :page-sizes="[5, 8, 10, 15]"
                :total="pagination.total"
                layout="prev, pager, next, jumper, ->, sizes, total"
                @size-change="getClassList()"
                @current-change="getClassList(false)"
            >
            </el-pagination>
        </el-footer>
        <el-dialog :modal="false" :visible.sync="edit.isEdit" title="班级编辑">
            <el-form ref="form" :model="edit.model" :rules="edit.rules" label-width="100px">
                <el-form-item label="班级名称：" prop="cls_name" v-if="this.edit.model.cls_id === 0">
                    <el-input class="input" v-model="edit.model.cls_name" placeholder="请输入班级名称"></el-input>
                </el-form-item>
                <el-form-item label="班级专业：" prop="cls_dic_id_major">
                    <el-select class="select" v-model="edit.model.cls_dic_id_major">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('class_major')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="教学老师：" prop="cls_stf_id_teacher">
                    <el-select class="select" v-model="edit.model.cls_stf_id_teacher">
                        <el-option :value="0" label="-- 请选择 --"></el-option>
                        <el-option v-for="item in staffListTeacher" :key="item.stf_id"
                                   :label="item.stf_name" :value="item.stf_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="教务老师：" prop="cls_stf_id_admin">
                    <el-select class="select" v-model="edit.model.cls_stf_id_admin">
                        <el-option :value="0" label="-- 请选择 --"></el-option>
                        <el-option v-for="item in staffListAdmin" :key="item.stf_id"
                                   :label="item.stf_name" :value="item.stf_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="就业老师：" prop="cls_stf_id_job">
                    <el-select class="select" v-model="edit.model.cls_stf_id_job">
                        <el-option :value="0" label="-- 请选择 --"></el-option>
                        <el-option v-for="item in staffListJob" :key="item.stf_id"
                                   :label="item.stf_name" :value="item.stf_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="班级备注：">
                    <el-input class="input" type="textarea" v-model="edit.model.cls_remark"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="save">确认</el-button>
                    <el-button @click="edit.isEdit = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :modal="false" :visible.sync="edit.isClsr" title="开课">
            <el-form ref="clsFrom" :model="edit.model" :rules="edit.rules" label-width="100px">
                <el-form-item label="所在教室：" prop="cls_clsr_id">
                    <el-select v-model="edit.model.cls_clsr_id">
                        <el-option :value="null" label="- 请选择 -"></el-option>
                        <el-option v-for="item in clsrList" :key="item.clsr_id"
                                   :label="item.clsr_name" :value="item.clsr_id"
                                   :disabled="item.clsr_occupy === 1"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="start">确认</el-button>
                    <el-button @click="edit.isClsr = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </el-container>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex';

export default {
    name: "Class",
    data() {
        return {
            edit: {         // 对话框驱动数据
                isEdit: false,
                isClsr: false,
                model: {
                    cls_id: 0,
                    cls_name: '', //班级名称
                    cls_dic_id_major: 0, // 班级专业
                    cls_clsr_id: 0, // 所在教室
                    cls_stf_id_teacher: 0, //教学老师
                    cls_stf_id_admin: 0, //教务老师
                    cls_stf_id_job: 0,  //就业老师
                    cls_remark: '',  // 班级备注
                },
                rules: {
                    cls_name: [
                        {
                            validator: async (rule, value, callback) => {
                                if (value.length === 0)
                                    callback(new Error('班级名称不能为空'));
                                else if (value.length < 2 || value.length > 20)
                                    callback(new Error('班级名称长度 2 - 20'));
                                else if (await this.$http({
                                    method: 'post',
                                    url: 'class/valid_name',
                                    data: {cls_name: value}
                                }))
                                    callback(new Error('班级名称已存在'));
                                else
                                    callback();
                            },
                            trigger: "blur"
                        }
                    ],
                    cls_clsr_id: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0) callback(new Error('教室不能为空！'));
                                else if(value === null) callback(new Error('教室不能为空！'));
                                else callback();
                            }
                        }
                    ],
                    cls_dic_id_major: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0) callback(new Error('班级专业不能为空！'));
                                else callback();
                            }
                        }
                    ],
                    cls_stf_id_teacher: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0) callback(new Error('教学老师不能为空！'));
                                else callback();
                            }
                        }
                    ], //教学老师
                    cls_stf_id_admin: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0) callback(new Error('教务老师不能为空！'));
                                else callback();
                            }
                        }
                    ], //教务老师
                    cls_stf_id_job: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0) callback(new Error('就业老师不能为空！'));
                                else callback();
                            }
                        }
                    ],  //就业老师
                }
            },
            list: [],
            classMajor: [], //班级专业
            staffListTeacher: [],
            staffListAdmin: [],
            staffListJob: [],
            search: {
                cls_name: '',
                cls_dic_id_major: 0,
                cls_status: 0
            },
            pagination: {
                currentPage: 1,
                total: 0,
                pageSize: 5
            },
        }
    },

    computed: {
        ...mapState('classroom', {'clsrList': 'list'}),
        ...mapState('dictionary', {'dicList': 'list'}),
        ...mapGetters('dictionary', ['getGroupByKey']),
    },
    methods: {
        ...mapActions("classroom", ["init"]),
        ...mapActions('dictionary', {'dicInit': 'init'}),

        async beginSearch() {
            try {
                if(this.search.cls_name === '' && this.search.cls_dic_id_major === 0 && this.search.cls_status === 0) {
                    this.$message.error('请输入搜索内容！');
                    return;
                }

                let result = await this.$http({
                    method: 'post',
                    url: '/class/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                });
                this.list = result.list;
                this.pagination.total = result.total;
                this.$message({
                    type: 'success',
                    message: '搜索完成！'
                });
            } catch (e) {}
        },
        async getStaffList() {
            try {
                await this.$http({url: '/staff/listbycategory/4'}).then(list => this.staffListTeacher = list)
                await this.$http({url: '/staff/listbycategory/5'}).then(list => this.staffListAdmin = list)
                await this.$http({url: '/staff/listbycategory/6'}).then(list => this.staffListJob = list)
                console.log(this.staffListTeacher) 
            } catch (e) {}
        },
        async getClassList(isFormPage1 = true) {
            if (isFormPage1) this.pagination.currentPage = 1;
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/class/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                });
                this.list = result.list;
                console.log(this.list);
                this.pagination.total = result.total;
            } catch (e) {
            }
        },
        // 修改
        beginUpdate(row) {
            this.edit.model = {...row};
            this.edit.isEdit = true;
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.clearValidate();
            });
        },
        // 新增
        beginAdd() {
            this.edit.model = {
                cls_id: 0,
                cls_name: '', //班级名称
                cls_dic_id_major: 0, // 班级专业
                cls_clsr_id: null, // 所在教室
                cls_stf_id_teacher: 0, //教学老师
                cls_stf_id_admin: 0, //教务老师
                cls_stf_id_job: 0,  //就业老师
                cls_begin: '',   // 开课时间
                cls_end: '',    //结课时间
                cls_remark: '',  // 班级备注
            };
            this.edit.isEdit = true;
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.clearValidate();
            });
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                if(this.edit.model.cls_id === 0) {   // 新增
                    let result = await this.$http({
                        method: 'post',
                        url: '/class/add',
                        data: {
                            ...this.edit.model,
                        }
                    });
                    this.pagination.total = result;
                } else {    // 修改
                    let result = await this.$http({
                        method: 'post',
                        url: '/class/update',
                        data: {
                            ...this.edit.model,
                        }
                    });
                    console.log(result);
                }
                this.$message({
                    type: "success",
                    message: "用户编辑成功！"
                });
                await this.getClassList();
                this.edit.isEdit = false;

            } catch (e) {}
        },
        // 开课
        btnStart(row) {
            this.edit.isClsr = true;
            this.edit.model= {
                cls_id: row.cls_id,
                cls_clsr_id: row.cls_clsr_id
            }
            this.$nextTick(() => {
                if (this.$refs.clsFrom) this.$refs.clsFrom.clearValidate();
            });
        },
        async start() {
            try {
                await this.$refs.clsFrom.validate();   // 表单验证
                let result = await this.$http({
                    method: 'post',
                    url: '/class/begin',
                    data: {
                        cls_id: this.edit.model.cls_id,
                        cls_clsr_id: this.edit.model.cls_clsr_id
                    }
                });
                console.log(result);
                // await this.init();
                // console.log(this.clsrList);
                // let i = this.list.find(item => item.cls_id === this.edit.model.cls_id);
                this.list.find(item => item.cls_id === this.edit.model.cls_id).cls_begin = result;
                this.list.find(item => item.cls_id === this.edit.model.cls_id).cls_clsr_id = this.edit.model.cls_clsr_id;
                this.clsrList.find(item => item.clsr_id === this.edit.model.cls_clsr_id).clsr_occupy = 1;       // 教室状态
                this.$message({
                    type: "success",
                    message: "开课成功，请刷新页面启用新的菜单！！！",
                    duration: 5000,
                });
                this.edit.isClsr = false;
            } catch (e) {}
        },

        // 开课结课需要占用教室，但是通知通知教室仓库更新没有生效！！！！！
        // 导致应该被占用的教室还能继续被其他班级使用！！！

        // 结课
        async end(row) {
            await this.$confirm(`确定对"${row.cls_name}"结课吗？`, '提示', {type: "warning"});
            let result = await this.$http({
                method: 'post',
                url: '/class/end',
                data: {
                    cls_id: row.cls_id,
                }
            });
            this.list.find(item => item.cls_id === row.cls_id).cls_end = result;
            this.clsrList.find(item => item.clsr_id === row.cls_clsr_id).clsr_occupy = 0;       // 教室状态
            // await this.init();
            this.$message({
                type: "success",
                message: "结课成功，请刷新页面启用新的菜单！！！",
                duration: 5000,
            });
        }
    },
    async created() {
        await this.init();
        await this.dicInit();
        await this.getStaffList();
        await this.getClassList();
    }
}
</script>

<style scoped>
.header-form {
}

.header-form .el-input {
    width: 120px;
}

.header-form .el-select {
    width: 150px;
}

.header-form .el-button {
    padding: 10px 15px;
}

.header-form /deep/ .el-form-item__label {
    padding-right: 5px;
}

.el-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
}

/deep/ .el-table .el-table__cell {
    padding: 8px 0;
}

/* 备注 */
.nowrap {
    display: block;
    width: 100%;
    overflow: hidden;
    white-space: nowrap; /* 不换行 */
    text-overflow: ellipsis; /* 超出显示省略号 */
}

.major img {
    width: 20px;
    height: 20px;
    vertical-align: middle;

}

.major span {
    vertical-align: middle;

}

.select {
    width: 150px;
}

.input {
    width: 250px;
}

/deep/ .el-dialog {
    width: 40%;
}

/deep/ .el-dialog__header {
    background-color: #409EFF;

}

/deep/ .el-dialog__title {
    color: white;
}

/deep/ .el-dialog__close {
    color: white;

}

.el-form-item {
    margin-bottom: 15px;
    font-size: 13px;
}

.el-form-item /deep/ .el-input__inner {
    font-size: 13px;
}

.el-form-item /deep/ .el-form-item__label {
    font-size: 13px;
}

.el-form-item /deep/ .el-button {
    font-size: 13px;
}
</style>
