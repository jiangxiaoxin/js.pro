# Radio

核心是利用 input，设置其 type 为 radio 实现的。有几点需要注意的：

`v-model`是个特殊的指令，可以简化代码，最常见的使用就是下面这样给 input 添加。

```js
<input type="text" v-model="foo" />
```

```js
foo: 'input value'
```

其作用相当于自动给 input 绑定 value 值,并且在发生 input 事件时改变 value 的值.大致相当于下面

```js
<input type="text" :value="foo" @input="handleInput" />

handleInput(val) {
  this.foo = val
}
```

注意：由于已经自动绑定了 value 值，所以就不需要再自己绑了。并且如果是`value="123"`这种简单的绑数据不会报错，还是 value 的值还是会绑定到 foo 这个变量上。但是如果`:value="foo[或者bar]"`这样就会报错，说是`v-model`已经帮你绑定了 value 值，不可以再自己绑，否则就会冲突

but，如果像下面这样子，修改 input 的类型成 radio，就不一样了:

```js
<input type="radio" :value="radioValue" v-model="radioValue2">

radioValue: 111111
radioValue2: 222222
```

这样子`value`和`v-model`并不会冲突，而且此时 input 的 value 还真是 radioValue 的值，而不是 radioValue2 的值。在点击 input 之后，就会触发 input 事件，神奇的一幕，radioValue 就会变成 undefined，而 radioValue2 变成了 111111，所以如果 watch 里监视 radioValue2，就会看到发生了变化.
其实就是前面的`:value`的确绑定了 radioValue 的值，`v-model="radioValue2"`此时虽然没有修改 input 的值，但当发生 input 事件时，会自动去修改 radioValue2 的值。

更多玄乎的：

```js
<input type="radio" ref="r1" :value="val1" v-model="val">
<input type="radio" ref="r2" :value="val2" v-model="val">

val1:'1'
val2:'2'
val:'1'
```

两个 radio 都正确的显示了被选中的状态，并且此时 input 标签的 checked 状态（this.\$refs.[r1/r2].checked）也是没问题的，分别是对应的 true 和 false。但是此时点击 r2 ，val 就触发了改变，val 的值变成了 r2 对应的 val2 的值，选中状态的显示倒也是没问题的，一个有圆点，一个没有，但是，**此时去访问 input 标签的 checked 状态，两个都成了 true，r1 并没有变回 false**。也就是说 radio 的 checked 属性会主动的去获取选中的状态，而不会主动撤销这个状态。但是对于多个 radio 项一起来切换的情况，选中某个时，其余的必须主动修改，达到视觉上和数据上一致才行

要解决问题，就要在 val 的值发生改变的时候，手动重置 r1 和 r2 的 checked 状态。

```js
<input type="radio" ref="r1" :value="val1" v-model="val">
<input type="radio" ref="r2" :value="val2" v-model="val">

val1: '1111'
val2: '2222'
current: '1111'

computed: {
  val: {
    get() {
      return this.current
    },
    set(val) {
      this.current = val
      this.$refs.r1.checked = this.current === this.val1
      this.$refs.r2.checked = this.current === this.val2
    }
  }

  watch: {
    val: function(next) {
      console.log('val changed', next)
    }
  }
}
```

添加一个中间变量 current，把 val 变成 computed 变量。初始时，val 返回 current 的值，此时一切跟上面一样，显示正确，状态也正确。点击切换后，由于 v-model 触发了对 val 的修改，然后调用了 computed 里 val 的 set 方法，此时更新 current，并且重置正确的 checked 状态。由于更新了 current，那就引起 computed 的重新计算，所以 val 的值变了（虽然 val 并不是单纯的变量，但有 get 和 set 方法，它对外就是个普通的变量一样使用），进而触发了 watch 方法，显示最新的 val 的值。

```js
<input
  ref="radio"
  class="el-radio__original"
  :value="label"
  type="radio"
  aria-hidden="true"
  v-model="model"
  @focus="focus = true"
  @blur="focus = false"
  @change="handleChange"
  :name="name"
  :disabled="isDisabled"
  tabindex="-1"
>

model: {
  get() {
    return this.isGroup ? this._radioGroup.value : this.value;
  },
  set(val) {
    if (this.isGroup) {
      this.dispatch('ElRadioGroup', 'input', [val]);
    } else {
      this.$emit('input', val);
    }
    this.$refs.radio && (this.$refs.radio.checked = this.model === this.label);
  }
},


handleChange() {
  this.$nextTick(() => {
    this.$emit('change', this.model);
    this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model);
  });
}
```

上面的`handleChange`是 change 事件的回调，当`<input type="radio">`发生 change 事件时，会向外层再发出一个 change 事件，注意这俩都是`change`事件，但不是同一个时间。在组件外使用该组件时，如果绑定 change 回调，此时就会触发这个回调了，这也就是 api 上写的那个 change，带的参数是选中的 radio 的 label 值。这里边有个点要注意：对于`<input type="radio">`来说，change 事件是发生在自己被选中的时候，也就是 checked 从 false 变成 true 的时候会触发，而从 true 变成 false 并不会触发。所以只有被选中的那个才会执行 handleChange 这个方法，这就是为啥一个 radio-group 只会监听到一次 change 事件，而不是多次。

下面是一个基本的使用：点击可以切换不同的选项，radio 的值就是当前选中的项

```
<el-radio v-model="radio" label="1">aaa</el-radio>
<el-radio v-model="radio" label="2">bbb</el-radio>

radio: '1'
```

`v-model="radio"`说明两件事，一是会给组件内部传递一个 prop 进去，就叫 value。二是组件内部会发出 input 事件，并且带有新的 value，当监听到 input 事件是就自动修改 radio 的值。这也就是 element 里做的。同时这也说明了为啥 input 的真实值传递不用 value 而用 label，因为 value 被`v-model`占用了。

```
props: {
  value: {},
  label: {},
},

// 在model的set方法里发出的
this.$emit('input', val);
```

初始好后，向组件内部传入了 value 和 label 值，input 本身的 value 属性绑定了 label，而判断 input 此时的状态，其余 span 的样式是根据 model 和 label 来比较，model 的 get 返回的是传进来的 value，所以 aaa 显示的样子是选中，而 bbb 是未被选中。当点击 bbb 时，内部真实的 input 元素状态发生改变,就触发了 model 的 set 方法，进而`emit('input')`，之后父容器里就会修改绑定的 radio 的值为最新的值，然后因为都绑定到这个 radio，并且值发生了变化，所以所有的组件又会重新收到新的 props 值，然后 model 是个 computed 属性，并且有 get 方法，它实际依赖的就是传进来的 props 里的 value 值，所以 model 的 get 方法会被重新触发，进而修改了组件的样式。

```
<input
  type="radio"
  value="1"
  ref="a"
  v-model="current"
  @change="handleChange"
>
<input
  type="radio"
  value="2"
  ref="b"
  v-model="current"
  @change="handleChange"
>
<input
  type="radio"
  value="3"
  ref="c"
  v-model="current"
  @change="handleChange"
>
```

如果只是单纯的实现状态切换，并且获取当前的选定值，上面就已经可以实现了。element 里是为了封装更多东西，样式而写的复杂。input 来实现功能，span 实现样式
