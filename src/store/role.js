export default {
    namespaced: true,
    state: {
        list: [],
        isInit: false,
    },
    mutations: {
        _init(state, list) {
            state.list = list;
            state.isInit = true;
        },
        _remove(state, role_id) {
            let i = state.list.findIndex(item => item.role_id === role_id);
            state.list.splice(i, 1);
        },
        _add(state, role) {
            state.list.push(role);
        },
        _update(state, role) {
            let i = state.list.findIndex(item => item.role_id === role.role_id);
            state.list.splice(i, 1, role);
        }
    },
    actions: {
        async init({ state, commit, rootState: { http } }) {
            if(state.isInit) return;
            let list = await http({ url: '/role/all' });
            commit('_init', list);
        },
        async remove({ commit, rootState: {http}}, role_id) {
            await http({
                method: 'post',
                url: '/role/remove/' + role_id,
            });
            commit('_remove', role_id);
        },
        async add({ commit, rootState: {http}}, role) {
            role.role_id = await http({
                method: "post",
                url: "/role/add",
                data: role
            });
            commit('_add', role);
        },
        async update({ commit, rootState: {http}}, role) {
            await http({
                method: "post",
                url: "/role/update",
                data: role
            });
            commit('_update', role);
        }
    }
}