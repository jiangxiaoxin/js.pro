# Dialog

将显示部分进行了拆分，主显示内容在`vue`文件里写，主要是 3 个 slot，用的时候，外部的内容通过 slot 传入`Dialog`进行显示。另外的弹出和关闭逻辑，包括模态框则是通过 mixin 导入外部的可复用功能。

`lock-scroll`可以设置在 Dialog 出现时将 body 滚动锁定，其实是在打开时设置 body 样式`overflow:hidden`消除滚动区域。同时修改 body 的`padding-right`属性:先通过`getScrollBarWidth`获取 body 的右侧滚动条的宽度，拿到后修改`padding-right`，这样子是为了防止当`overflow:hidden`后 body 没有了滚动，滚动条消失导致 body 抖动。

```js
// getScrollBarWidth
// 先放一个outer，并且设置overflow：scroll，记录此时outer.offsetWidth为widthNoScroll
// 再放一个inner在outer里，并且设置width = '100%'，记录inner.offsetWidth为widthWithScroll，其实就是outer内部可以用来填充内容的空间
// widthNoScroll - widthWithScroll就算出滚动条的宽度
let scrollBarWidth
export default function() {
  if (Vue.prototype.$isServer) return 0
  if (scrollBarWidth !== undefined) return scrollBarWidth

  const outer = document.createElement('div')
  outer.className = 'el-scrollbar__wrap'
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.position = 'absolute'
  outer.style.top = '-9999px'
  document.body.appendChild(outer)

  const widthNoScroll = outer.offsetWidth
  outer.style.overflow = 'scroll' // 这条可有可无，outer的overflow属性在el-scrollbar__wrap内已经设置为scroll

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth
  outer.parentNode.removeChild(outer)
  scrollBarWidth = widthNoScroll - widthWithScroll

  return scrollBarWidth
}
```

其实可以这么写。没必要设置 outer 的 class。outer 的高度不用设置，结果是一样的

```js
let scrollBarWidth
export default function() {
  if (Vue.prototype.$isServer) return 0
  if (scrollBarWidth !== undefined) return scrollBarWidth

  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.position = 'absolute'
  outer.style.top = '-9999px'
  document.body.appendChild(outer)

  const widthNoScroll = outer.offsetWidth
  outer.style.overflow = 'scroll' // 这条可有可无，outer的overflow属性在el-scrollbar__wrap内已经设置为scroll

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth
  outer.parentNode.removeChild(outer)
  scrollBarWidth = widthNoScroll - widthWithScroll

  return scrollBarWidth
}
```

关闭的时候是在`component.vue`里调用`hide`方法。很重要一点，发出了`update:visible`这个事件。

```js
hide(cancel) {
  if (cancel !== false) {
    this.$emit('update:visible', false);
    this.$emit('close');
    this.closed = true;
  }
},
```

在父组件的 `data` 里有个 `visible`，通过`:visible` 方式传递值给子组件 Dialog 内部。在 Dialog 内部，当关闭时，发出`update:visible`事件，父组件监听这个事件。收到事件后修改父组件里 `visible` 的值，然后再次传递给子组件，改变了子组件内部 `visible` 的值，进而触发 `watch`，执行后续关闭 Dialog 的逻辑

`sync`就是`update:myPropName`这种处理的简写方式

[sync 的说明](https://cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6)
