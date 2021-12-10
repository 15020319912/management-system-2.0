import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import store from './store';    // 导入总仓库
import App from './App.vue';
import './assets/reset.css';
import http from './util/http.js';
import optimization from './util/optimization'

Vue.prototype.$http = http;
Vue.use(optimization);
Vue.use(ElementUI);

// 创建根实力，并挂载渲染根组件
new Vue({
    el: "#app",
    components: {
        App
    },
    router,
    store,  // 总仓库
    template: "<App/>",
})