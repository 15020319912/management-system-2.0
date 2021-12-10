export default {
    namespaced: true,
    state: {
        list: [],


    },
    getters: {

    },
    mutations: {
        _init(state, list) {
            state.list = list;
            console.log(state.list);
            state.isInit = true;
        },
        _remove(state, clsr_id) {
            let i = state.list.findIndex(item => item.clsr_id === clsr_id);
            state.list.splice(i, 1);
        },
        _add(state, clsr) {
            state.list.push(clsr);
            console.log(clsr)
        },
        _update(state, clsr) {
            let i = state.list.findIndex(item => item.clsr_id === clsr.clsr_id);
            state.list.splice(i, 1, clsr);
        }
    },
    actions: {
        async init({ state, commit, rootState: { http } }) {
            if(state.isInit) return;
            let list = await http({ url: '/classroom/all' });
            commit('_init', list);
        },
        async remove({ commit, rootState: {http}}, clsr_id) {
            await http({
                method: 'get',
                url: '/classroom/remove/' + clsr_id,
            });
            commit('_remove', clsr_id);
        },
        async add({ commit, rootState: {http}}, clsr) {
            clsr.clsr_id = await http({
                method: "post",
                url: "/classroom/add",
                data: clsr
            });
            commit('_add', clsr);
        },
        async update({ commit, rootState: {http}}, clsr) {
            await http({
                method: "post",
                url: "/classroom/update",
                data: clsr
            });
            commit('_update', clsr);
        }
    }
}