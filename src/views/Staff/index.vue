<template>
    <el-container>
        <el-header>
            <el-form inline>
                <el-form-item label="员工姓名：">
                    <el-input v-model="search.stf_name" placeholder="请输入要搜索的员工姓名"></el-input>
                </el-form-item>
                <el-form-item label="员工类型：">
                    <el-select v-model="search.stf_category">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('staff_category')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" size="medium" type="primary" @click="beginSearch">搜索</el-button>
                    <el-button icon="el-icon-plus" size="medium" type="success" @click="beginAdd">新增用户</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="list" border >
                <el-table-column fixed="left" align="center" label="#" type="index" width="50"></el-table-column>
                <el-table-column fixed="left" align="center" label="姓名" width="150" >
                    <template slot-scope="{row}">
                        <el-tag
                            type="primary"
                            disable-transitions
                            v-text="row.stf_name"
                        ></el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="职务类型" width="200" >
                    <template slot-scope="{row}">
                        <span v-text="dicList.find(item => item.dic_id === row.stf_category).dic_name"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="备注">
                    <template slot-scope="{row}">
                        <span v-if="row.stf_remark === null || row.stf_remark === ''" style="color: #999999">暂无相关备注</span>
                        <span v-else v-text="row.stf_remark"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="员工状态" width="150" >
                    <template slot-scope="{row}">
                        <span v-if="row.stf_invalid === 0" style="color: red">离职</span>
                        <span v-else style="color: #67c23a;">在职</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="200" >
                    <template slot-scope="{row}">
                        <el-button class="el-icon-edit" size="mini" type="primary" @click="beginUpdate(row)">编辑</el-button>
                        <el-button v-if="row.stf_invalid === 0" size="mini" type="success" @click="reinstate(row)">入职</el-button>
                        <el-button v-else size="mini" type="danger" @click="dimission(row)">离职</el-button>
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
                @size-change="getStafftList()"
                @current-change="getStafftList(false)"
            >
            </el-pagination>
        </el-footer>
        <el-dialog :modal="false" :visible.sync="edit.isEdit" title="员工编辑 ">
            <el-form ref="form" :model="edit.model" :rules="edit.rules" label-width="100px">
                <el-form-item label="员工姓名：" prop="stf_name">
                    <el-input v-model="edit.model.stf_name"></el-input>
                </el-form-item>
                <el-form-item label="员工类型：" prop="stf_category">
                    <el-select v-model="edit.model.stf_category">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('staff_category')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="员工备注：">
                    <el-input type="textarea" v-model="edit.model.stf_remark"></el-input>
                </el-form-item>
                <el-form-item>
                    <div style="text-align: right">
                        <el-button type="primary" @click="save">确认</el-button>
                        <el-button @click="edit.isEdit = false">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>
    </el-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import fa from 'element-ui/src/locale/lang/fa'
export default {
    name: "Staff",
    data() {
        return {
            list: [],
            edit: {
                isEdit: false,
                model: {
                    stf_name: '',
                    stf_category: 0,
                    stf_remark: null
                },
                rules: {
                    stf_name: [
                        {required: true, message: '学生姓名不能为空！', trigger: "blur"},
                        {min: 2, max: 15, message: '学生姓名长度 2 - 15 ！', trigger: 'blur'}
                    ],
                    stf_category: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0)
                                    callback(new Error('请选择班级！'));
                                else
                                    callback();
                            },
                            trigger: 'change',
                        }
                    ]
                }
            },
            search: {
                stf_name: '',
                stf_category: 0
            },
            pagination: {
                currentPage: 1,
                total: 0,
                pageSize: 5
            },
        }
    },
    computed: {
        ...mapState('dictionary', { 'dicList' : 'list' }),
        ...mapGetters('dictionary', ['getGroupByKey']),

    },
    methods: {
        ...mapActions('dictionary', ['init']),
        async getStafftList(isFormPage1 = true) {
            if (isFormPage1) this.pagination.currentPage = 1;
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/staff/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                });
                this.list = result.list;
                console.log(this.list);
                this.pagination.total = result.total;
            } catch (e) {}
        },
        // 搜索
        async beginSearch() {
            if(this.search.stf_name === '' && this.search.stf_category === 0 ) {
                this.$message.error('请输入搜索内容！');
                return;
            }
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/staff/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                });
                this.list = result.list;
                console.log(this.list);
                this.pagination.total = result.total;
            } catch (e) {}
        },
        // 新增
        beginAdd() {
            if(this.$refs.form) this.$refs.form.resetFields();
            this.edit.model = {
                stf_id: 0,
                stf_name: '',
                stf_category: 0,
                stf_remark: null
            };
            this.edit.isEdit = true;
        },
        // 编辑
        beginUpdate(row) {
            if(this.$refs.form) this.$refs.form.resetFields();
            this.edit.model = { ...row };
            console.log(row);
            this.edit.isEdit = true;
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                if(this.edit.model.stu_id === 0) {   //新增
                    let result = await this.$http({
                        method: 'post',
                        url: '/staff/add',
                        data: { ...this.edit.model }
                    });
                    this.pagination.total = result;
                } else {    // 修改
                    let result = await this.$http({
                        method: 'post',
                        url: '/staff/update',
                        data: { ...this.edit.model }
                    });
                }
                this.$message({
                    type:'success',
                    message: '编辑完成！'
                });
                await this.getStafftList();
                this.edit.isEdit = false;
            } catch (e) {}

        },
        // 离职
        async dimission(row) {
            try {
                await this.$confirm(`确定 "${row.stf_name}" 离职吗?`, '提示', {type: 'warning'})
                await this.$http({ url: '/staff/dimission/' + row.stf_id });
                this.$message({
                    type:'success',
                    message: `"${row.stf_name}"离职成功！`
                });
                await this.getStafftList();
            } catch (e) {}
        },
        // 入职
        async reinstate(row) {
            try {
                await this.$confirm(`确定 "${row.stf_name}" 重新入职吗?`, '提示', {type: 'warning'})
                await this.$http({ url: '/staff/reinstate/' + row.stf_id });
                this.$message({
                    type:'success',
                    message: `"${row.stf_name}"入职成功！`
                });
                await this.getStafftList();
            } catch (e) {}
        },
    },
    async created() {
        await this.init();
        await this.getStafftList();
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