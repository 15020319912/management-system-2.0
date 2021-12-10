<template>
    <div class="login">
        <h1 class="logo">管理系统</h1>
        <el-form>
            <el-form-item>
                <el-input v-model.trim="model.user_name">
                    <template slot="prepend">
                        <i class="el-icon-user-solid"></i>
                        <span style="width: 60px; display: inline-block">用户名：</span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-input v-model="model.user_pwd" show-password>
                    <template slot="prepend">
                        <i class="el-icon-lock"></i>
                        <span style="width: 60px; display: inline-block">密码：</span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button class="btn-login" type="primary" round @click="login">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "Login",
    data() {
        return {
            model: {
                user_name: "",
                user_pwd: "",
            }
        }
    },
    methods: {
        async login() {
            try {
                let token = await this.$http({
                    method: "post",
                    url: "/user/login",
                    data: this.model,
                });
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('name', this.model.user_name);
                this.$router.replace('/home');
            } catch (e) {}
        },
    }

}
</script>

<style scoped>
.login {
    width: 100%;
    height: 100%;
    background-image: url("bg.jpg");
    background-size: 100% 100%;
}
.el-form {
    border-radius: 10px;
    padding: 50px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(0, -50%);
    box-shadow: 0 0 10px 1px white;
}
.btn-login {
    width: 100%;
}
    @keyframes entry {
        0% {
            opacity: 0;
            bottom: 100%;
        }
        40% {
            opacity: 1;
            left: 20%;
            bottom: 50%;
            /*text-shadow: 0px 0px 10px #333;*/
            /*transform: translate(-100%, 50%) rotate(0deg);*/
        }
        100% {
            opacity: 1;
            left: 45%;
            bottom: 50%;
            /*text-shadow: -15px 8px 10px #333;*/
            /*transform: translate(-100%, 50%) rotateY(50deg);*/
        }
    }

    h1.logo {
        color: #ffffff;
        animation-name: entry;
        animation-duration: 2s;
        animation-fill-mode: forwards;
        position: fixed;
        transform: translate(-150%, 40%);
        font-size: 50px;
    }
</style>