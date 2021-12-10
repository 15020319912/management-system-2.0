import fa from 'element-ui/src/locale/lang/fa'

export default {
    namespaced: true,
    state: {
        list: [],
        isInit:false
    },
    mutations: {

    },
    actions: {
        async init({ state, commit, rootState: { http }, stu}) {
            if(state.isInit) return;
            let list = await http({
                url: '/student/list',
            })
        }
    }
}