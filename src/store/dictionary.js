export default {
    namespaced: true,
    state: {
        list: [],
        isInit: false,

    },
    getters: {
        getGroupByKey(state) {
            return dic_group_key => state.list.filter(item => item.dic_group_key === dic_group_key)
        },




    },
    mutations: {
        _init(state, list) {
            state.list = list;
            console.log(state.list);
            state.isInit = true;
        },
    },
    actions: {
        async init({state, commit, rootState: {http}}) {
            if(state.isInit) return;
            let list = await http({ url: "/dictionary/all" });
            commit("_init", list)
        },
    }
}