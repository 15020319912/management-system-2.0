import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

let router = new VueRouter({
    routes: [
        { path: "/", redirect: "/login" },

        { path: "/login", component: () => import('../pages/Login'), },
        { path: "/home", component: () => import('../pages/Home'), meth: { needAuth: true } }
    ]
});

// router.beforeEach((to, from, next) => {
//    if(to.meta.needAuth && !sessionStorage.getItem('token'))
//        next('/login');
//    else next();
// });

export default router;