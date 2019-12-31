1. position 与 left、top

2. width、height

3. negative margin

4. height 和 line-height

5. margin padding 百分比

margin 和 padding 都是按照**父容器的宽度**为基准去百分比计算，**父容器必须有明确的宽度**。下例是无效的，会向上继续找父辈容器，直到找到页面根容器

```html
<div>
  <div class="margin:10%;padding:10%;"></div>
</div>
```
