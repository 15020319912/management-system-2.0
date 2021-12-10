export default {
    namespaced: true,
    state: {
        list: [],
        isInit: false,
    },
    getters: {
        // 线性转树形
        treeOfList(state) {
            // 数据不足以支撑完成功能，人为创造一个数据完成功能9
            let result = [{ func_id: 0, func_name: 'ROOT', func_key: '', func_fid: -1, children: [] }],
                temp = null, children = null;
            state.list.filter(item => item.func_fid === 0).forEach(item => {
                temp = {...item};
                children = state.list.filter(item2 => item2.func_fid === item.func_id);
                if(children.length > 0) {
                    temp.children = [];
                    children.forEach(item2 => temp.children.push({...item2}));
                }
                result[0].children.push(temp);
            });
            return result;
        }
    },
    mutations: {
        _init(state, list) {
            state.list = list;
            state.isInit = true;
        },
        _remove(state, func_id) {
            let i = state.list.findIndex(item => item.func_id === func_id);
            state.list.splice(i, 1);
        },
        _add(state, func) {
            state.list.push(func);
        },
        _update(state, func) {
            let i = state.list.findIndex(item => item.func_id === func.func_id);
            state.list.splice(i, 1, func);
        }
    },
    actions: {
        async init({state, commit, rootState: {http}}) {
            if(state.isInit) return;
            let list = await http({ url: "/function/all" });
            commit("_init", list)
        },
        async remove({ commit, rootState: {http}}, func_id) {
            await http({
                method: 'post',
                url: '/function/remove/' + func_id,
            });
            commit('_remove', func_id);
        },
        async add({ commit, rootState: {http}}, func) {
            func.func_id = await http({
               method: "post",
                url: "/function/add",
                data: func
            });
            commit('_add', func);
        },
        async update({ commit, rootState: {http}}, func) {
            await http({
                method: "post",
                url: "/function/update",
                data: func
            });
            commit('_update', func);
        }
    }
};