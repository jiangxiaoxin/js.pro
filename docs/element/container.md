# Container

使用时由多个布局组件一起用`container`,`header`，`footer`,`main`,`aside`,几个组件间可以嵌套使用。依靠`flex`布局的便利

```js
isVertical() {
  if (this.direction === 'vertical') {
    return true;
  } else if (this.direction === 'horizontal') {
    return false;
  }
  return this.$slots && this.$slots.default
    ? this.$slots.default.some(vnode => {
      const tag = vnode.componentOptions && vnode.componentOptions.tag;
      return tag === 'el-header' || tag === 'el-footer';
    })
    : false;
}
```

通过`$slots.default`下的判断，`vnode.componentOptions.tag`,确定是否有`header`或者`footer`组件。
