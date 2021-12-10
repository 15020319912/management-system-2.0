export default {
    install: function (Vue) {
        Vue.prototype.$debounce = function (fun, time) {
            let timer = null;
            return function (...args) {
                if(time !== null) { clearTimeout(time); }
                timer = setTimeout(() => {
                    fun.call(this, ...args);
                    timer = null;
                }, time)
            };
        };
        Vue.prototype.$throttle = function(fun, time) {
            let lock = false;  // true为开启
            return function (...args) {
                if(lock) return;
                lock = true;
                fun.apply(this, args);
                setTimeout(() => lock = false,time);
            }
        }
    }
}