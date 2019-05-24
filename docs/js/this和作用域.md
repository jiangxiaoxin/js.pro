
> <<you don't know js 上卷>>

### this

```html
<script>
  var arr = [];
  arr.push(function() {
    console.log(this);
  });
  arr[0]();
  var func = arr[0];
  func();
  console.log(window.func);
</script>
```

上面的例子很有趣，同样的调用了那个匿名的函数，却一个打印 arr，一个打印 window，这就是 this 与函数调用时那个对象有关。var func = arr[0]的实质是在全局作用域下创建了个变量并给它赋值了一个函数，所以在调用这个函数时，其内部的 this 绑定对象是全局对象，也就是 window。【如果是在严格模式下，并不会打印出 window 而是 undefined】



### 作用域
