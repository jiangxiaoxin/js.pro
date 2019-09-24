# Steps

如果 item 是固定宽度的，那很简单，就是设定父容器宽度后，搞个点和线，然后再加个文字。

如果 item 是居中显示，那各个 item 平分父容器的空间，文本区域`text-align:center`居中显示，然后 node 在父容器水平居中`left:50%;transform:translateX(-50%);`,tail 的`width:100%`,第一个和最后一个 tail 要单独设置下，第一个右移 50%，最后一个左移 50%，设置外层容器`overflow:hidden`

如果 item 不设置宽度，那就自适应父容器。这时父容器`display:flex`，然后根据 step 的个数，设置除最后一个，前面的 item 的`flex-basis`为`100/(step-1)%`,并且设置`flex-shrink:1`,其实默认也是 1.比如 4 个步骤就设置`33.333%`.设置最后一个 item`flex-basis`为`auto`.flex-basis 是期望的宽度，这样在计算尺寸时，前面的 item 的宽度加起来就已经是`100%`，再加上最后一个 item 就超出了父容器尺寸。这时就要根据实际尺寸，前面的 item 都相应的分担一样的尺寸缩放（因为 flex-shrink 都是 1），拿出来的尺寸组成最后一个 item 的尺寸，这样既保证了所有的 item 都能显示，又保证了前面的 item 尺寸一致。`white-space:nowrap`, 让文本不换行，很重要，不然最后一个 item 的文本就会换行。

居中显示的

```js
<template>
  <div class="step">
    <div
      class="step-item"
      v-for="item in steps"
      :key="item"
      :style="{width: itemWidth}"
    >
      <div class="header">
        <div class="node"></div>
        <div class="tail"></div>
      </div>
      <div class="body">
        <p class="title">title</p>
        <p class="desc">a long long long desc</p>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      steps: 4
    };
  },
  computed: {
    itemWidth: function() {
      return 100 / this.steps + "%";
    }
  }
};
</script>

<style lang='scss' scoped>
.step {
  margin: 20px 0;
  background: lightsalmon;

  .step-item {
    box-sizing: border-box;
    display: inline-block;
    overflow: hidden;

    &:first-child {
      .tail {
        left: 50%;
      }
    }

    &:last-child {
      .tail {
        left: -50%;
      }
    }

    .header {
      width: 100%;
      position: relative;
      .node {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        box-sizing: border-box;
        background: red;
        z-index: 2;
        left: 50%;
        transform: translateX(-50%);
      }

      .tail {
        position: absolute;
        width: 100%;
        height: 2px;
        background: blue;
        top: 9px;
        z-index: 1;
      }
    }

    .body {
      text-align: center;
      margin-top: 25px;

      .title {
        font-size: 20px;
        color: aqua;
      }

      .desc {
        font-size: 14px;
        color: aliceblue;
      }
    }
  }
}
</style>
```

自适应父容器宽度

```js
<template>
  <div>
    <div class="steps-wrapper">
      <div class="steps2">
        <div
          class="steps2-item"
          v-for="item in steps"
          :key="item"
        >
          <div class="tail"></div>
          <div class="node"></div>
          <div class="content">
            <p class="title">步骤</p>
            <p class="desc">长长的说明长长的说明长长的说明</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: 2,
      steps: 5
    };
  }
};
</script>

<style lang="scss">
.steps2 {
  list-style: none;
  display: flex;
  white-space: nowrap; // 文本不换行，

  .steps2-item {
    background: lightgreen;
    flex-basis: 25%; // 根据总的step的个数，除了最后一个，前面的item希望的宽度的百分比是 100/(step-1)
    flex-shrink: 1; // 按照25%来计算，总的宽度是不够的，最后一个flex-basis: auto;在除去这最后一个的尺寸之后，剩下的空间要压缩，就让其余的item同样去分担这块压缩的尺寸
    position: relative;
    display: inline-block;

    &:last-child {
      flex-basis: auto; //  最后一个设置为auto之后，就不会给它分配期望的宽度，而是以它的实际宽度来计算
      .tail {
        display: none;
      }
    }

    .node {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      box-sizing: border-box;
      background: red;
      z-index: 10;
    }

    .tail {
      position: absolute;
      width: 100%;
      height: 2px;
      background: #c0c4cc;
      top: 9px;
      z-index: 1;
    }

    .content {
      margin-top: 20px;
      background: lightpink;
      font-size: 20px;
    }
  }
}
</style>
```
