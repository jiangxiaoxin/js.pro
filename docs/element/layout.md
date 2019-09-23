# Layout

`el-row`和`el-col`都使用了 slot.

col 使用`float:left`，rol 就要清除浮动.

```css
.clearfix {
  &::before,
  &::after {
    display: table;
    content: '';
  }

  &::after {
    clear: both;
  }
}
```

col 根据 span 计算出 width 占父级容器的百分比。要设置 col 的`box-sizing: border-box;`

通过 padding 使两个 col 之间加上间隔，但是第一个左边和最后一个右边都有 padding 值，就会看起来跟父容器不对齐，所以要消除这种效果。第 1 种就是将他们的 padding 重置，但这样多个 col 之间。他们里面的显示容器宽度就会不一样，所以不能改 padding。那就让父容器 row 两边都伸出去个负的 margin，同时满足 col 之间宽度一致，又视觉上 col 顶着 row 来布局
