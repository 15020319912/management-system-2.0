<template>
    <div>
        <el-form ref="form" :model="model" :rules="rules" label-width="100px">
            <el-form-item label="原始密码：" prop="oldPwd">
                <el-input v-model="model.oldPwd"></el-input>
            </el-form-item>
            <el-form-item label="新密码：" prop="newPwd">
                <el-input v-model="model.newPwd"></el-input>
            </el-form-item>
            <el-form-item label="确认新密码：" prop="configPwd">
                <el-input v-model="model.configPwd"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('form')">确认</el-button>
                <el-button @click="resetForm('form')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "ChangePwd",
    data() {
        return {
            model: {
                oldPwd: '',
                newPwd: '',
                configPwd: '',
            },
            rules: {
                oldPwd: [
                    {required: true, message: '密码不能为空', trigger: "blur"},
                    {min: 3, max: 16, message: '密码长度 3 - 16', trigger: 'blur'}
                ],
                newPwd: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length === 0)
                                callback(new Error('请输入密码'));
                            else if (value.length < 3 || value.length > 16)
                                callback(new Error('密码长度 3 - 16'));
                            else {
                                if (this.model.configPwd !== '')
                                    this.$refs.form.validateField('configPwd');
                                callback();
                            }
                        },
                        trigger: 'blur'
                    },
                ],
                configPwd: [
                    {
                        validator: (rule, value, callback) => {
                            if (value === '') {
                                callback(new Error('请再次输入密码'));
                            } else if (value !== this.model.newPwd) {
                                callback(new Error('两次输入密码不一致!'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    methods: {
        submitForm(form) {
            this.$refs[form].validate((valid) => {
                if(valid) {
                    try {
                        this.$http({
                            method: 'post',
                            url: 'user/pwdchange',
                            data: {
                                oldPwd: this.model.oldPwd,
                                newPwd: this.model.newPwd
                            }
                        })
                    } catch(e) {}
                    if(sessionStorage.getItem('name') === 'admin') return;
                    this.$refs[form].resetFields();
                    this.$message({
                        type: "success",
                        message: "密码修改成功"
                    });
                } else {
                    return false;
                }
            });
        },
        resetForm(form) {
            // this.$refs[form].clearValidate();
            this.$refs[form].resetFields();
        }
    }
}
</script>

<style scoped>
.el-form {
    width: 400px;
}
</style>