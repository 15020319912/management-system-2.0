<template xmlns="">
    <el-container>
        <el-aside :class="menuCollapse ? 'collapse' : ''" width="250px">
            <div class="button-wrapper">
                <el-button
                    v-show="!menuCollapse"
                    icon="el-icon-d-arrow-left"
                    type="warning"
                    @click="menuCollapse = !menuCollapse"
                ></el-button>
                <el-button
                    v-show="menuCollapse"
                    icon="el-icon-d-arrow-right"
                    type="warning"
                    @click="menuCollapse = !menuCollapse"
                ></el-button>
            </div>
            <el-menu
                :collapse="menuCollapse"
                active-text-color="#FFD700"
                background-color="#303133"
                text-color="#fff"
                @select="addTab"
                :default-active="activeTab">
                <!-- :default-active="activeTab" 左右联动 -->
                <template v-for="item in userFuncs.filter(item => item.func_fid === 0)">
                    <el-submenu v-if="item.func_key === ''" :key="item.func_id" :index="item.func_id.toString()">
                        <template slot="title">
                            <i class="el-icon-setting"></i>
                            <span v-text="item.func_name"></span>
                        </template>
                        <el-menu-item v-for="item2 in userFuncs.filter(item2 => item2.func_fid === item.func_id)"
                                      :key="item2.func_id" :index="item2.func_key">
                            <i class="el-icon-menu"></i>
                            <span slot="title" v-text="item2.func_name"></span>
                        </el-menu-item>
                    </el-submenu>
                    <el-menu-item v-else :key="item.func_id" :index="item.func_key">
                        <i class="el-icon-menu"></i>
                        <span slot="title" v-text="item.func_name"></span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header height="60px">
                <h1>后台管理系统</h1>
            </el-header>
            <el-main>
                <!-- v-model="activeTab" 左右联动 -->
                <el-tabs v-if="tabs.length > 0" v-model="activeTab" closable type="card" @tab-remove="removeTab" @tab-click="toggleTab">
                    <el-tab-pane v-for="item in tabs" :key="item.func_key" :label="item.func_name"
                                 :name="item.func_key">
                        <component :is="viewsMap[item.func_key].component"></component>
                    </el-tab-pane>
                </el-tabs>
            </el-main>
            <el-footer height="30px">
                <p>&copy; 版权所有,违者必究</p>
            </el-footer>
        </el-container>
    </el-container>
</template>

<script>
import  viewsMap from '@/views';

export default {
    name: "Home",
    data() {
        return {
            viewsMap,   // 组件路由地图
            menuCollapse: false,
            activeTab: '',    // 标识激活tab的位置
            tabs: [],
            userFuncs: [], // 菜单
        }
    },
    methods: {
        addTab(func_key) {
            // 如果当前页面没有这个选项卡
            if(!this.tabs.some(item => (item.func_key === func_key))) {
                let func_name = this.userFuncs.find(item => item.func_key === func_key).func_name;
                this.tabs.push({func_key, func_name});
            }
            this.activeTab = func_key;  // 让当前新增的激活
        },
        // @tab-remove事件的回调参数是 被删除的标签的name！！！
        removeTab(func_key) {
           let i = this.tabs.findIndex(item => item.func_key === func_key);
           this.tabs.splice(i, 1);
           if(this.activeTab !== func_key) return;
           else if(this.tabs.length === 0) this.activeTab = "";
           else this.activeTab = this.tabs[i === 0 ? i : i - 1].func_key;
        },
        // @toggleTab事件的回调函数是 被选中的标签 tab 实例
        toggleTab(tab) {
            console.log(tab);
        }
    },
    async created() {
        try {
            this.userFuncs = await this.$http({
                method: "post",
                url: "/user/getmenu"
            });
        } catch(e) {}

    }
}
</script>

<style scoped>
.el-main {
    /*padding: 0;*/
}

.el-aside {
    background-color: #303133;
    transition: width .3s;
}

.el-aside.collapse {
    width: 64px !important;
}

.el-aside .el-button {
    margin-left: 4px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.el-menu {
    border: none;
}

.el-header {
    background-color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
}

.el-header h1 {
    color: #fff;
    font-size: 24px;
    font-weight: normal;
}

.el-footer {
    background-color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
}

.el-footer {
    font-size: 13px;
    font-weight: bold;
    color: #fff;
}
</style>