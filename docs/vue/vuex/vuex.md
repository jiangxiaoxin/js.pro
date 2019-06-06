# Vuex 源码分析

Vuex 充分利用了 Vue 的响应式原理和其提供的 api，写的真好呀.

### Vue 是怎么使用插件的？

```js
export function initUse(Vue: GlobalAPI) {
  // 传入Vue原始对象
  Vue.use = function(plugin: Function | Object) {
    // 传入的plugin可以是个object或者function
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []); //在Vue上查找插件列表
    if (installedPlugins.indexOf(plugin) > -1) {
      // 如果安装过了就不要再次安装了，所以如文档所写，插件只会安装一次
      return this;
    }

    // additional parameters
    /**
     * 这里截取start为1是有原因的，因为 Vue.use传入的参数（一般情况下就是插件自己，当然也可以有很多参数）就是arguments，里面最开始的
     * 参数就是plugin自己，如果不删除它，那在plugin.install.apply或者plugin.apply的时候就会通过args把plugin自己又传进去，实在是没必要
     */
    const args = toArray(arguments, 1);
    args.unshift(this); // 将Vue原始对象插入到数组的最开始
    if (typeof plugin.install === "function") {
      // 如果plugin是个object，就调用plugin的install方法
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      // 如果plugin是个function，就直接调用plugin这个function
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin); // 保存插件
    return this;
  };
}
```

在 Vue 里通过 `Vue.use` 启用插件，如果插件本身是个方法，就直接调用此方法，如果插件是个对象，则调用插件的 install 方法安装插件。

### Vuex 的入口

```js
// Vuex index.js
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
```

Vuex 入口文件里导出了一个对象`{ Store, install }`，所以启用插件时会调用这里的 install 方法，在 install 方法里，修改了 Vue 这个对象，添加了对应的方法
