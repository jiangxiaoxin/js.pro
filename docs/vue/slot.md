# Slot 插槽

## 基本用法

在子组件里设置一些 slot 块，在父组件使用时，指定要展示的内容渲染在子组件的哪个部分

```html
// 子组件
<template>
  <div class="child-component">
    <h1>child component</h1>
    <slot>
      <!-- 这里就可以显示父组件传进来的内容了 -->
    </slot>
  </div>
</template>

// 父组件
<template>
  <div class="parent-component">
    <h1>parent component</h1>
    <child-component>
      <!-- 这里的内容都将显示在子组件里 -->
      <p>content from parent to child</p>
    </child-component>
  </div>
</template>
```

说明：

在组件内，Slot 可以有一个，也可以有很多个。不同的 slot 之间为了区分，给 slot 加上 name。比如上面的例子中，可以在子组件里继续添加，`<slot name="a"></slot>`,`<slot name="b"></slot>`。在父组件里就可以用`v-slot:a`,`v-slot:b`指定要渲染到哪个 slot 里了。

要注意一点，在上面的例子里，父组件中`<p>content from parent to child</p>`并没有指定要渲染的 slot，这种情况下就会采用默认的方式，会渲染到子组件的`default`slot 里。在子组件里，可以明确写明某个 slot 就是`default`,也可以不写。不写的那个 slot 就会默认的认定是`default`。

如果要指定渲染的 slot 名，那么必须将内容包裹在`template`里。

```html
<template v-slot:aa>
  <!-- 把要显示的内容放到这里 -->
</template>
```

在父组件里使用 slot 时，对于同一个 slot，绑定多个 template 并不会显示多个，也不会把所有的内容合并然后显示在 slot 里，而是只显示最后一个 template 的内容

`slot`不支持嵌套，所在在子组件里，不可以在一个 slot 里面再写一个 slot，[虽然这样子不会报错，但从父组件里没法设置要显示的内容]

`<template v-slot> can only appear at the root level inside the receiving the component`

## 进阶用法

使用场景：父组件可以访问子组件内部的数据

写一个组件，根据数据渲染一个列表。列表项有默认的渲染方式，但是也可以从父组件指定如何去渲染列表项，这样子整个组件就更加的通用。

```html
<!-- 子组件 -->
<template>
  <div class="list-wrapper">
    <ul class="list">
      <!-- items 可以是从外部通过props传进来的数据，也可以自己去获取的数据 -->
      <li v-for="item in items" :key="item.id">
        <!-- name="listItem" 给这个slot命名 -->
        <!-- v-bind:item="item" 向父组件开放一个叫item的属性，对应的数据就是v-for遍历出来的item -->
        <slot name="listItem" v-bind:item="item">
          <p>default content</p>
        </slot>
      </li>
    </ul>
  </div>
</template>

<template>
  <div class="parent">
    <child-component :items="items">
      <!-- 绑定到 listItem 这个slot，并通过 slotProps 去引用子组件暴露的属性-->
      <template v-slot:listItem="slotProps">
        <!-- 设置子组件里如何去具体的显示 -->
        <p>from parent:{{slotPorps.item.id}}-{{slotPorps.item.name}}</p>
      </template>
    </child-component>
  </div>
</template>
```
