<template>
    <el-container>
        <el-header style="height: 100px">
            <el-form ref="search" inline class="header-form">
                <el-form-item label="学生姓名：">
                    <el-input v-model="search.stu_name" placeholder="学生姓名"></el-input>
                </el-form-item>
                <el-form-item label="所在班级：">
                    <el-select v-model="search.stu_cls_id">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option :value="null" label="- 无班级 -"></el-option>
                        <el-option v-for="item in classList" :key="item.cls_id"
                                   :label="item.cls_name" :value="item.cls_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="学生学历：">
                    <el-select v-model="search.stu_qualification">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button size="medium" icon="el-icon-search" type="primary" @click="beginSearch">搜索</el-button>
                    <el-button size="medium" icon="el-icon-plus" type="success" @click="beginAdd">新增用户</el-button>
                    <el-button size="medium" icon="el-icon-share" type="success" @click="batch" >批量分班</el-button>
                    <el-button size="medium" icon="el-icon-download" type="warning" @click="exportExcel">导出学生信息</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="list" border stripe @select="select" id="out-table" height="300">
                <el-table-column fixed="left" align="center" label="#" type="index" width="50"></el-table-column>
                <el-table-column fixed="left" align="center" type="selection"></el-table-column>
                <el-table-column fixed="left" align="center" label="学生姓名" width="100" >
                    <template slot-scope="{row}">
                        <el-tag
                            type="primary"
                            disable-transitions
                            v-text="row.stu_name"
                        ></el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="班级" width="150">
                        <!-- 这里需要得到班级信息 -->
                    <template slot-scope="{row}">
                        <span v-if="row.stu_cls_id === null" style="color: #999">无班级</span>
                        <span v-else v-text="classList.find(item => item.cls_id === row.stu_cls_id).cls_name" style="color: deepskyblue"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="存档照片" width="100">
                    <template slot-scope="{row}">
                        <el-popover
                            placement="right"
                            width="200"
                            trigger="click">
                            <el-image :src="row.stu_avatar"></el-image>
                            <el-link slot="reference" type="primary" :underline="false">预览</el-link>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="性别" width="50">
                    <template slot-scope="{row}">
                        <div v-if="row.stu_sex === 1">
                            <el-tag
                                type="primary"
                                disable-transitions
                                style="height: 25px; padding: 5px; line-height: 15px"
                            >男</el-tag>
                        </div>
                        <div v-else>
                            <el-tag
                                type="danger"
                                disable-transitions
                                style="height: 25px; padding: 5px; line-height: 15px"
                            >女</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="联系电话" width="150" prop="stu_phone"></el-table-column>
                <el-table-column align="center" label="备用电话" width="150" prop="stu_phone2"></el-table-column>
                <el-table-column align="center" label="出生日期" width="120">
                    <template slot-scope="{row}">
                        <i class="el-icon-present" style="color: OrangeRed"></i>
                        <span v-text="row.stu_born"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="学历" width="150">
                    <template slot-scope="{row}">
                        <span v-if="row.stu_qualification === 1">本科及以上</span>
                        <span v-else-if="row.stu_qualification === 2">专科</span>
                        <span v-else>高中及以下</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="毕业院校" width="150" prop="stu_school"></el-table-column>
                <el-table-column align="center" label="专业" width="150" prop="stu_major"></el-table-column>
                <el-table-column align="center" label="家庭住址" width="250" prop="stu_address">
                    <template slot-scope="{row}">
                        <el-tooltip class="item" effect="dark" :content="row.stu_address" placement="top">
                            <span class="nowrap" v-text="row.stu_address"></span>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="备注" width="300">
                    <template slot-scope="{row}">
                        <span v-if="row.stu_remark !== ''">
                            <el-tooltip class="item" effect="dark" :content="row.stu_remark" placement="top">
                                <span class="nowrap" v-text="row.stu_remark"></span>
                            </el-tooltip>
                        </span>
                        <span v-else style="color: #999">暂无相关备注</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" width="300">
                    <template slot-scope="{row}">
                        <el-button class="el-icon-share" size="mini" type="success" @click="beginDic(row)">分班</el-button>
                        <el-button class="el-icon-picture-outline" size="mini" type="warning" @click="file(row)">照片存档</el-button>
                        <el-button class="el-icon-edit" size="mini" type="primary" @click="beginUpdate(row)">编辑</el-button>
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
                @size-change="getStudentList()"
                @current-change="getStudentList(false)"
            >
            </el-pagination>
        </el-footer>
        <!-- 新增 -->
        <el-dialog :modal="false" :visible.sync="edit.isEdit" title="班级编辑">
            <el-form ref="form" :model="edit.model" :rules="edit.rules" label-width="100px">
                <el-form-item label="学生姓名：" prop="stu_name">
                    <el-input class="input" v-model="edit.model.stu_name"></el-input>
                </el-form-item>
                <el-form-item label="性别：">
                    <el-radio-group v-model="edit.model.stu_sex">
                        <el-radio :label="1">男</el-radio>
                        <el-radio :label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="联系电话：" prop="stu_phone">
                    <el-input v-model="edit.model.stu_phone"></el-input>
                </el-form-item>
                <el-form-item label="备用电话：">
                    <el-input v-model="edit.model.stu_phone2"></el-input>
                </el-form-item>
                <el-form-item label="出生日期：" prop="stu_born" >
                    <el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择日期" v-model="edit.model.stu_born" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="学历：" prop="stu_qualification">
                    <el-select v-model="edit.model.stu_qualification">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id"
                                   :label="item.dic_name" :value="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="毕业院校：" prop="stu_school">
                    <el-input class="input" v-model="edit.model.stu_school"></el-input>
                </el-form-item>
                <el-form-item label="专业：" prop="stu_major">
                    <el-input class="input" v-model="edit.model.stu_major"></el-input>
                </el-form-item>
                <el-form-item label="家庭住址：" prop="stu_address">
                    <el-input class="input" v-model="edit.model.stu_address"></el-input>
                </el-form-item>
                <el-form-item label="备注：">
                    <el-input class="input" v-model="edit.model.stu_remark"></el-input>
                </el-form-item>
                <el-form-item>
                    <div  style="text-align: right">
                        <el-button type="primary" @click="save">确认</el-button>
                        <el-button @click="edit.isEdit = false">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :modal="false" :visible.sync="edit.dis" title="班级分配">
            <el-form ref="dic" :model="edit.model" :rules="edit.rules">
                <el-form-item label="班级：" prop="stu_cls_id">
                    <el-select class="select" v-model="edit.model.stu_cls_id">
                        <el-option v-for="item in classList" :key="item.cls_id"
                                   :label="item.cls_name" :value="item.cls_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <div class="btn-dis"  style="text-align: right">
                        <el-button type="primary" @click="distribution">分配</el-button>
                        <el-button @click="edit.dis = false">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog :modal="false" :visible.sync="avatar.isEdit" title="上传图片">
            <el-form>
                <el-form-item>
                    <el-upload
                        ref="upload"
                        accept=".jpg, .jpeg, .png"
                        :file-list="fileList"
                        action="/student/avatarupload"
                        name="avatar"
                        list-type="picture-card"
                        :headers="{ Authorization: token }"
                        :before-upload="beforeUploadHandler"
                        :on-success="uploadSuccessHandler"
                        :before-remove="function() {return false;}">
                        <i class="el-icon-plus avatar-uploader-icon"></i>
                        <div slot="tip" style="font-size: 12px; color: red; margin-left: 160px;">只能上传jpg/jpeg/png文件，且不超过500kb。</div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <div style="text-align: right">
                        <el-button type="primary" @click="avatarConfig">确认</el-button>
                        <el-button @click="avatar.isEdit = false">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>
    </el-container>
</template>

<script>
// 引入导出Excel表格依赖
import FileSaver from "file-saver";
import XLSX from "xlsx";

import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    name: "Student",
    data() {
        return {
            token: sessionStorage.getItem('token'),
            edit: {
                isEdit: false,
                dis: false,
                model: {
                    stu_id: null,
                    stu_cls_id: null,
                    stu_name: '',
                    stu_avatar: null,
                    stu_sex: 1,
                    stu_phone: '',
                    stu_phone2: '',
                    stu_born: '',
                    stu_qualification: 0,
                    stu_school: '',
                    stu_major: '',
                    stu_address: '',
                    stu_remark: ''
                },
                rules: {
                    stu_cls_id: [
                        {
                            validator: (rule, value, callback) => {
                                if (value === null)
                                    callback(new Error('请选择班级！'));
                                else
                                    callback();
                            },
                            trigger: 'change',
                        }
                    ],
                    stu_name: [
                        {required: true, message: '学生姓名不能为空！', trigger: "blur"},
                        {lmin: 2, max: 15, message: '学生姓名长度 2 - 15 ！', trigger: 'blur'}
                    ],
                    stu_phone: [
                        {required: true, message: '联系电话不能为空！', trigger: "blur"},
                        {min: 11, max: 11, message: '手机号格式有误！', trigger: 'blur'}
                    ],
                    stu_born: [
                        {required: true, message: '出生日期不能为空！', trigger: "blur"},
                    ],
                    stu_qualification: [
                        {
                            validator: (rule, value, callback) => {
                                if(value === 0)
                                    callback(new Error('学历不能为空！'));
                                else
                                    callback();
                            },
                            trigger: 'change',
                        }
                    ],
                    stu_school: [
                        {required: true, message: '学校名称不能为空！', trigger: "blur"},
                        {min: 4, max: 15, message: '学校名称长度 4 - 15 ！', trigger: 'blur'}
                    ],
                    stu_major: [
                        {required: true, message: '专业不能为空！', trigger: "blur"},
                        {min: 4, max: 15, message: '专业长度 4 - 15 ！', trigger: 'blur'}
                    ],
                    stu_address: [
                        {required: true, message: '家庭住址不能为空！', trigger: "blur"},
                        {min: 9, max: 20, message: '家庭住址长度 9 - 20 ！', trigger: 'blur'}
                    ],

                }
            },
            className: '',  // 辅助变量
            classList: [],
            list: [],
            search: {
                stu_name: '',
                stu_cls_id: 0,
                stu_qualification: 0,
            },
            pagination: {
                currentPage: 1,
                total: 0,
                pageSize: 5
            },
            avatar: {
                isEdit: false,
                model: {
                    stu_id: 0,
                    stu_avatar_old: null,
                    stu_avatar_new: null
                }
            },
            selectAll: [],     // 选中的
            edu: []     // 学历
        }
    },
    computed: {
        ...mapState('dictionary', { 'dicList': 'list' }),
        ...mapGetters('dictionary', ['getGroupByKey']),
        // 上传图片的列表
        fileList() {
            let avatarPath = this.avatar.model.stu_avatar_old;
            if(avatarPath === null) return [];
            return [{
               name: avatarPath.slice(avatarPath.lastIndexOf("/") + 1),
               url: avatarPath
            }];
        }
    },
    methods: {
        ...mapActions('dictionary', ['init']),

        async beginSearch() {
            if(this.search.stu_name === '' && this.search.stu_cls_id === 0 && this.search.stu_qualification === 0) {
                this.$message.error('请输入搜索内容！');
                return;
            }
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/student/list',
                    data: {
                        ...this.search,
                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                        pageSize: this.pagination.pageSize
                    }
                })
                this.list = result.list;
                console.log(this.list);
                this.pagination.total = result.total;
                this.$message({
                    type: "success",
                    message: `搜索完成！`
                });
            } catch (e) {}
        },
        // 新增按钮点击事件
        beginAdd() {
            if(this.$refs.form) this.$refs.form.resetFields();
            this.edit.model = {
                stu_id: null,
                stu_name: '',
                stu_avatar: null,
                stu_sex: 1,
                stu_phone: '',
                stu_phone2: '',
                stu_born: '',
                stu_qualification: 0,
                stu_school: '',
                stu_major: '',
                stu_address: '',
                stu_remark: ''
            };
            this.edit.isEdit = true;
        },
        //编辑按钮点击事件
        beginUpdate(row) {
            if(this.$refs.form) this.$refs.form.resetFields();
            this.edit.model = { ...row };
            this.edit.isEdit = true;
        },
        async save() {
            try {
                await this.$refs.form.validate();   // 表单验证
                if(this.edit.model.stu_id === null) {   //新增
                    let result = await this.$http({
                        method: 'post',
                        url: '/student/add',
                        data: {...this.edit.model}
                    });
                    this.pagination.total = result;
                } else { // 修改
                    let result = await this.$http({
                        method: 'post',
                        url: '/student/update',
                        data: {...this.edit.model}
                    });
                    console.log(result);
                }
                this.$message({
                    type: "success",
                    message: "用户编辑成功！"
                });
                await this.getStudentList();
                this.edit.isEdit = false;
            } catch (e) {}
        },
        // 复选框选中的回调函数
        select(selection, row) {
            this.selectAll = selection;
            console.log(this.selectAll)
        },
        // 批量分班按钮点击事件
        async batch() {
            if(this.selectAll.length === 0) {
                this.$message.error("请选择要分班的学生！");
                return;
            };
            this.edit.dis = true;
            this.$nextTick(() => {
                if(this.$refs.dic) this.$refs.dic.clearValidate();
            });
        },

        beginDic(row) {
            this.edit.dis = true;
            this.edit.model = {...row};
            console.log(row);
            this.$nextTick(() => {
                if(this.$refs.dic) this.$refs.dic.clearValidate();
            });
        },
        // 分班 分配点击事件
        async distribution() {
            // 表单验证
            await this.$refs.dic.validate();   // 表单验证

            if(this.edit.model.stu_id !== null) {  //普通分班
                try {
                    await this.$http({
                        method: 'post',
                        url: '/student/assignclass',
                        data: {
                            stu_ids: [],
                            ...this.edit.model
                        }
                    });
                    this.$message({
                        type: "success",
                        message: "分班操作已完成，菜单已更新，请刷新页面，启用新的菜单！"
                    });
                    this.edit.dis = false;
                } catch (e) {}
            } else {
                try {
                    let stu_ids = [];
                    this.selectAll.forEach(item => {
                        let id = item.stu_id;
                        stu_ids.push(id);
                    });

                    await this.$http({
                        method: 'post',
                        url: '/student/assignclass',
                        data: {
                            stu_ids,
                            ...this.edit.model
                        }
                    });
                    this.$message({
                        type: "success",
                        message: "批量分班操作已完成，菜单已更新，请刷新页面，启用新的菜单！"
                    });
                    this.edit.dis = false;
                } catch (e) {}
            }

        },

        // 照片存档点击事件
        file(row) {
            this.$refs.upload.clearFiles();
            this.avatar.model.stu_id = row.stu_id;    // 需要修改用户的id
            this.avatar.model.stu_avatar_old = row.stu_avatar;    // 图片回显
            this.avatar.isEdit = true;
        },
        // 文件上传前打开文件选择器后
        beforeUploadHandler(file) {
            // 引导用户选择指定样式
            const isJpgOrPngOrJpeg = file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg';
            const isLt500kb = file.size / 1024 < 500;
            // 判断用户选择的样式是否是指定的
            if(!isJpgOrPngOrJpeg) {
                this.$message.error('上传图片的格式只能是JPG/PNG/JPEG格式！');
            }
            // 判断用户选择的图片大小是否是指定的
            if(!isLt500kb) {
                this.$message.error('上传图片的大小不能能超过500kb！');
            }
            return isJpgOrPngOrJpeg && isLt500kb;
        },
        // 文件上传成功的钩子
        uploadSuccessHandler(response, file, fileList) {
            if(response.status === 200) {
                this.avatar.model.stu_avatar_new = response.data;
            }
            // 如果当前已经存在，就干掉（只能存在一个图片）
            if(fileList.length > 1) fileList.shift();
            // 如果原来存在图片
            // if(this.avatar.model.stu_avatar_old !== null && fileList.length > 2)
            //     fileList.splice(1, 1);
            // if(this.avatar.model.stu_avatar_old === null && fileList.length > 1)
            //     fileList.shift();
        },
        async avatarConfig() {
            // 需要判断有没有新图片
            if(this.avatar.model.stu_avatar_new === null)  {
                console.log(1)
                this.$message.error("未修改照片！");
                return
            }
            let newAvatarPath = await this.$http({
                method: 'post',
                url: '/student/avatarupdate',
                data: this.avatar.model
            });
            this.$message({
                type: "success",
                message: "照片存档成功！"
            });
            this.list.find(item => item.stu_id === this.avatar.model.stu_id).stu_avatar = newAvatarPath;
            this.avatar.isEdit = false;
        },
        async getStudentList(isFormPage1 = true) {
            if (isFormPage1) this.pagination.currentPage = 1;
            try {
                let result = await this.$http({
                    method: 'post',
                    url: '/student/list',
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
        async getClassList() {
            try {
                let result = await this.$http({ url: '/class/all' });
                this.classList = result;
                console.log(this.classList);
            } catch (e) {}
        },
        // 导出学生信息
        exportExcel() {
            /* 从表生成工作簿对象 */
            let wb = XLSX.utils.table_to_book(document.querySelector("#out-table"));
            /* 获取二进制字符串作为输出 */
            let wbout = XLSX.write(wb, {
                bookType: "xlsx",
                bookSST: true,
                type: "array"
            });
            try {
                FileSaver.saveAs(
                    //Blob 对象表示一个不可变、原始数据的类文件对象。
                    //Blob 表示的不一定是JavaScript原生格式的数据。
                    //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
                    //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
                    new Blob([wbout], { type: "application/octet-stream" }),
                    //设置导出文件名称
                    "学生信息.xlsx"
                );
            } catch (e) {
                if (typeof console !== "undefined") console.log(e, wbout);
            }
            return wbout;
        }

    },
    async created() {
        await this.init();
        await this.getClassList();
        await this.getStudentList();
    }

}
</script>

<style scoped>
.header-form {}

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

/*分配*/
.btn-dis {
    text-align: right;
    margin-top: 20px;
}
</style>