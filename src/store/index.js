import Vue from 'vue';
import Vuex from 'vuex';
import http from '../util/http.js';
import func from './func.js';
import role from './role';
import classroom from './classroom';
import student from './student';
import cls from './cls';
import staff from './staff';
import dictionary from './dictionary'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        func,
        role,
        classroom,
        student,
        cls,
        staff,
        dictionary
    },
    state: {
        http
    }
})