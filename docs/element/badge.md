# Badge

```html
<el-badge :value="12">
  <el-button size="small">评论</el-button>
</el-badge>
```

里面的内容通过 slot 显示在 badge 的内部。利用`sup`上标元素，可以不用，用 div 也能实现，语义呀。

```
-div
|
--- slot
|
--- sup
```

外层的 div 是 relative 的，sup 是 absolute，translateX(100%)让整个 sup 的内容不会文字过长时遮挡到 slot 的内容显示，right：10px 让 sup 往左一点，跟 slot 的内容视觉上产生联系。sup 的 height 是 18px，还有上下俩 border 是 1px，所以整个高度是 20px，所以 border-radius 设置 10px，这样 sup 左右两端看起来是圆弧状的。
