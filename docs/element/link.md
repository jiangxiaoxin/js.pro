# Link

基本组成就是`a`标签下展示 icon 和文字。里面有个 slot 叫 icon，也能添加 icon，不过文档里没说明。

`v-bind="$attrs"`将在父组件里使用子组件时，在子组件上绑定的属性值，绑定到子组件上。默认情况下会绑到子组件的根标签元素下，通过这种方式也可以绑到其他地方。在子组件里设置`inheritAttrs: false`可以不使用默认下的绑定规则。

```css
display: inline-flex;
flex-direction: row;
align-items: center;
justify-content: center;
vertical-align: middle;
position: relative;
```

flex 布局
