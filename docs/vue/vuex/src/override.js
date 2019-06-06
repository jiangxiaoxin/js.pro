import { getWatcher, getDep } from "./util";

export default function(Vue) {
  const version = Number(Vue.version.split(".")[0]); //获取Vue的大版本

  if (version >= 2) {
    // 新版本的处理方式
    const usesInit = Vue.config._lifecycleHooks.indexOf("init") > -1; // _lifecycleHooks里并没有init这个钩子，所以useInit = false
    /**
     * _lifecycleHooks里所有的钩子函数
     * beforeCreate,
     * created,
     * beforeMount,
     * mounted,
     * beforeUpdate,
     * updated,
     * beforeDestroy,
     * destroyed,
     * activated,
     * deactivated,
     * errorCaptured,
     * serverPrefetch
     */
    Vue.mixin(usesInit ? { init: vuexInit } : { beforeCreate: vuexInit }); // useInit是false，所以会mixin（混入）beforeCreate这个钩子，注册后会影响每个创建的Vue实例
    /**
     * beforeCreate是在init events&lifecycle之后，init injections&reactivty之前
     */
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init;
    Vue.prototype._init = function(options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit() {
    const options = this.$options;
    const { store, vuex } = options; // 创建根vue实例时传入了store对象
    // store injection
    if (store) { // 这里会在每个实例的beforeCreate调用
      this.$store = store; //所以每个Vue实例都能 this.$store的方式去访问整个根的store了
    } else if (options.parent && options.parent.$store) { 
      this.$store = options.parent.$store; // 如果初始化根实例时没传入store对象（或者传错了，不叫这个名字）,那就使用“父容器”的。因为全局就只能有一个Store实例
    }
    // vuex option handling
    if (vuex) { // 如果传入了vuex，却没有传入store实例。
      if (!this.$store) { //TODO:这个先不看
        console.warn(
          "[vuex] store not injected. make sure to " +
            "provide the store option in your root component."
        );
      }
      const { state, actions } = vuex;
      let { getters } = vuex;
      // handle deprecated state option
      if (state && !getters) {
        console.warn(
          "[vuex] vuex.state option will been deprecated in 1.0. " +
            "Use vuex.getters instead."
        );
        getters = state;
      }
      // getters
      if (getters) {
        options.computed = options.computed || {};
        for (const key in getters) {
          defineVuexGetter(this, key, getters[key]);
        }
      }
      // actions
      if (actions) {
        options.methods = options.methods || {};
        for (const key in actions) {
          options.methods[key] = makeBoundAction(
            this.$store,
            actions[key],
            key
          );
        }
      }
    }
  }

  /**
   * Setter for all getter properties.
   */

  function setter() {
    throw new Error("vuex getter properties are read-only.");
  }

  /**
   * Define a Vuex getter on an instance.
   *
   * @param {Vue} vm
   * @param {String} key
   * @param {Function} getter
   */

  function defineVuexGetter(vm, key, getter) {
    if (typeof getter !== "function") {
      console.warn(
        `[vuex] Getter bound to key 'vuex.getters.${key}' is not a function.`
      );
    } else {
      Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get: makeComputedGetter(vm.$store, getter),
        set: setter
      });
    }
  }

  /**
   * Make a computed getter, using the same caching mechanism of computed
   * properties. In addition, it is cached on the raw getter function using
   * the store's unique cache id. This makes the same getter shared
   * across all components use the same underlying watcher, and makes
   * the getter evaluated only once during every flush.
   *
   * @param {Store} store
   * @param {Function} getter
   */

  function makeComputedGetter(store, getter) {
    const id = store._getterCacheId;

    // cached
    if (getter[id]) {
      return getter[id];
    }
    const vm = store._vm;
    const Watcher = getWatcher(vm);
    const Dep = getDep(vm);
    const watcher = new Watcher(vm, vm => getter(vm.state), null, {
      lazy: true
    });
    const computedGetter = () => {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
    getter[id] = computedGetter;
    return computedGetter;
  }

  /**
   * Make a bound-to-store version of a raw action function.
   *
   * @param {Store} store
   * @param {Function} action
   * @param {String} key
   */

  function makeBoundAction(store, action, key) {
    if (typeof action !== "function") {
      console.warn(
        `[vuex] Action bound to key 'vuex.actions.${key}' is not a function.`
      );
    }
    return function vuexBoundAction(...args) {
      return action.call(this, store, ...args);
    };
  }

  // option merging 合并规则
  const merge = Vue.config.optionMergeStrategies.computed;
  Vue.config.optionMergeStrategies.vuex = (toVal, fromVal) => {
    if (!toVal) return fromVal;
    if (!fromVal) return toVal;
    return {
      getters: merge(toVal.getters, fromVal.getters),
      state: merge(toVal.state, fromVal.state),
      actions: merge(toVal.actions, fromVal.actions)
    };
  };
}
