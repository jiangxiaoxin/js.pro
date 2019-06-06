import { mergeObjects, isObject, getNestedState, getWatcher } from "./util";
import devtoolPlugin from "./plugins/devtool";
import override from "./override";

let Vue;
let uid = 0;


/**
 * 最重要的Store类
 * 传入的参数是个object，有很多特定的字段：
 * state 全局初始状态
 * mutations 全局的mutation
 * modules 模块
 * plugins vuex的插件
 * strict 任何不是通过mutation去修改state的都会报错
 */
class Store {
  /**
   * @param {Object} options
   *        - {Object} state
   *        - {Object} actions
   *        - {Object} mutations
   *        - {Array} plugins
   *        - {Boolean} strict
   */

  constructor({
    state = {},
    mutations = {},
    modules = {},
    plugins = [],
    strict = false
  } = {}) {
    this._getterCacheId = "vuex_store_" + uid++;
    this._dispatching = false;
    this._rootMutations = this._mutations = mutations;
    this._modules = modules;
    this._subscribers = [];
    // bind dispatch to self
    const dispatch = this.dispatch;
    this.dispatch = (...args) => {
      dispatch.apply(this, args);
    };
    // use a Vue instance to store the state tree
    // suppress warnings just in case the user has added
    // some funky global mixins
    if (!Vue) {
      throw new Error(
        "[vuex] must call Vue.use(Vuex) before creating a store instance."
      );
    }
    const silent = Vue.config.silent; // true 取消 Vue 所有的日志与警告
    Vue.config.silent = true;
    this._vm = new Vue({
      data: { //通过创建Vue实例来实现响应式数据变化
        state
      }
    });
    Vue.config.silent = silent;
    this._setupModuleState(state, modules);
    this._setupModuleMutations(modules);
    // add extra warnings in strict mode
    if (strict) {
      this._setupMutationCheck();
    }
    // apply plugins
    devtoolPlugin(this);
    plugins.forEach(plugin => plugin(this));
  }

  /**
   * Getter for the entire state tree.
   * Read only.
   *
   * @return {Object}
   */

  get state() { // 可以通过 this.$store.state 方式访问所有的state数据
    return this._vm.state;
  }

  set state(v) { // 不可以直接设置state
    throw new Error(
      "[vuex] Use store.replaceState() to explicit replace store state."
    );
  }

  /**
   * Replace root state.
   *
   * @param {Object} state
   * 
   * 完整的替换整个state对象，所以如果有数据是通过模块引入的，那就要保证新的state对象按照正确的结构替换，否则替换后其他模块访问state时就会报错，因为数据丢失了
   * 这是个危险的操作，用好了也很好
   */

  replaceState(state) { 
    this._dispatching = true;
    this._vm.state = state;
    this._dispatching = false;
  }

  /**
   * Dispatch an action.
   *
   * @param {String} type
   * 
   * this.$store.dispatch('userIncrease')这种用法
   * dispatch可以用的格式：
   * dispatch('userIncrease', {})
   * dispatch({type: 'userIncrease', payload: {}})
   */

  dispatch(type, ...payload) {
    let silent = false;
    let isObjectStyleDispatch = false;
    // compatibility for object actions, e.g. FSA
    if (typeof type === "object" && type.type && arguments.length === 1) {
      isObjectStyleDispatch = true;
      payload = type;
      if (type.silent) silent = true;
      type = type.type;
    }
    const handler = this._mutations[type]; // 从全部的mutations列表里根据type找出对应的处理方法
    const state = this.state;
    if (handler) {
      this._dispatching = true; // 在调用mutation修改state之前设置为true
      // apply the mutation
      if (Array.isArray(handler)) { // 如果针对某个type的mutation有好多
        //TODO:这种一个type对应很多个mutation处理方法的应用场景是什么
        handler.forEach(h => {
          isObjectStyleDispatch ? h(state, payload) : h(state, ...payload);
        });
      } else {
        isObjectStyleDispatch
          ? handler(state, payload)
          : handler(state, ...payload);
      }
      this._dispatching = false;// 在修改完之后又恢复至false
      /**
       * mutation都是同步方法，所以在_dispatching设为true，进入mutation修改state数据后就会通过Watcher观察到state的变化，此时_dispatching仍然是true，这就是
       * 通过mutation修改的state。如果_dispatching是false，那就不是通过这里修改的state，就认定不是通过mutation修改state数据，然后就报错了。
       */
      if (!silent) { //如果不是静默模式，就执行所有的_subscriber
        const mutation = isObjectStyleDispatch ? payload : { type, payload };
        this._subscribers.forEach(sub => sub(mutation, state));
      }
    } else { // 找不到对应的处理方法就报错咯
      console.warn(`[vuex] Unknown mutation: ${type}`);
    }
  }

  /**
   * Watch state changes on the store.
   * Same API as Vue's $watch, except when watching a function,
   * the function gets the state as the first argument.
   *
   * @param {Function} fn
   * @param {Function} cb
   * @param {Object} [options]
   */

  watch(fn, cb, options) {
    if (typeof fn !== "function") {
      console.error("Vuex store.watch only accepts function.");
      return;
    }
    return this._vm.$watch(() => fn(this.state), cb, options);
  }

  /**
   * Subscribe to state changes. Fires after every mutation.
   * 
   * 这个方法很不错，通过作用域实现取消订阅功能
   */

  subscribe(fn) {
    const subs = this._subscribers;
    if (subs.indexOf(fn) < 0) {
      subs.push(fn);
    }
    return () => {
      const i = subs.indexOf(fn);
      if (i > -1) {
        subs.splice(i, 1);
      }
    };
  }

  /**
   * Hot update mutations & modules.
   *
   * @param {Object} options
   *        - {Object} [mutations]
   *        - {Object} [modules]
   */

  hotUpdate({ mutations, modules } = {}) {
    this._rootMutations = this._mutations = mutations || this._rootMutations;
    this._setupModuleMutations(modules || this._modules);
  }

  /**
   * Attach sub state tree of each module to the root tree.
   *
   * @param {Object} state
   * @param {Object} modules
   */

  _setupModuleState(state, modules) {
    if (!isObject(modules)) return;

    Object.keys(modules).forEach(key => {
      const module = modules[key];

      // set this module's state
      Vue.set(state, key, module.state || {});

      // retrieve nested modules
      this._setupModuleState(state[key], module.modules);
    });
  }

  /**
   * Bind mutations for each module to its sub tree and
   * merge them all into one final mutations map.
   *
   * @param {Object} updatedModules
   */

  _setupModuleMutations(updatedModules) {
    const modules = this._modules;
    Object.keys(updatedModules).forEach(key => {
      modules[key] = updatedModules[key];
    });
    const updatedMutations = this._createModuleMutations(modules, []);
    this._mutations = mergeObjects([this._rootMutations, ...updatedMutations]);
  }

  /**
   * Helper method for _setupModuleMutations.
   * The method retrieve nested sub modules and
   * bind each mutations to its sub tree recursively.
   *
   * @param {Object} modules
   * @param {Array<String>} nestedKeys
   * @return {Array<Object>}
   */

  _createModuleMutations(modules, nestedKeys) {
    if (!isObject(modules)) return [];

    return Object.keys(modules).map(key => {
      const module = modules[key];
      const newNestedKeys = nestedKeys.concat(key);

      // retrieve nested modules
      const nestedMutations = this._createModuleMutations(
        module.modules,
        newNestedKeys
      );

      if (!module || !module.mutations) {
        return mergeObjects(nestedMutations);
      }

      // bind mutations to sub state tree
      const mutations = {};
      Object.keys(module.mutations).forEach(name => {
        const original = module.mutations[name];
        mutations[name] = (state, ...args) => {
          original(getNestedState(state, newNestedKeys), ...args);
        };
      });

      // merge mutations of this module and nested modules
      return mergeObjects([mutations, ...nestedMutations]);
    });
  }

  /**
   * Setup mutation check: if the Vuex instance's state is mutated
   * outside of a mutation handler, we throw en error. This effectively
   * enforces all mutations to the state to be trackable and hot-reloadable.
   * However, this comes at a run time cost since we are doing a deep
   * watch on the entire state tree, so it is only enabled if the
   * strict option is set to true.
   */

  _setupMutationCheck() {
    const Watcher = getWatcher(this._vm);
    /* eslint-disable no-new */
    new Watcher(
      this._vm,
      "state",
      () => {
        if (!this._dispatching) { // 根据当前的_dispatching状态来判断是否是通过mutation修改的数据。每次要mutation修改数据时会设置_dispatching为true
          throw new Error(
            "[vuex] Do not mutate vuex store state outside mutation handlers."
          );
        }
      },
      { deep: true, sync: true }
    );
    /* eslint-enable no-new */
  }
}

function install(_Vue) {
  if (Vue) {
    console.warn(
      "[vuex] already installed. Vue.use(Vuex) should be called only once."
    );
    return;
  }
  Vue = _Vue;
  override(Vue);
}

// auto install in dist mode
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  Store,
  install
};
