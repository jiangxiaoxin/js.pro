# asyncData & fetch

两者都可以异步获取数据，但使用场景上还是有所不同。

## asyncData

asyncData 是在 vue 页面组件实例话之前调用，此时还没有这个组件的实例，所以不能像通常的生命周期函数那样访问 this.xxxx。

另外很重要一点，异步获取到的数据会跟组件的 data 属性进行合并，所以最后在组件里会获得一份合并后的完整的数据。

就只是在本页面的 data 上做文章。

## fetch

同样能异步获取数据，但获取到的数据可以合并到 store 上，而不是在 data 上。相同的一点是，在 fetch 里面同样不能通过 this 访问 vue 实例，因为此时还没到实例化的时候。

总结就是一句话：

> When you need to fetch some data for the store especially for a specific page (like search results), use fetch, otherwise, use asyncData.

这俩方法是在客户端，每次进页面的时候都会调用，但是如果修改 url 里的 query 数据，则并不会重新调用，这是因为对 query 的监听默认是关闭的，可以通过 watchQuery 打开，这样监听后就可以重新调 asyncData 和 fetch。
