// 数据驱动
// 响应式的核心原理
// 发布订阅模式和观察者模式

/*数据驱动
数据响应式，双向绑定，数据举动
数据响应式
数据模型是普通的javascript对象，而当我们修改数据时，视图会进行更新，避免了繁琐的DOM操作
，提高开发的效率
双向绑定
数据改变 视图改变，视图改变数据也改变
数据驱动是vue的独特的特性之一
开发过程中仅仅关注数据本身，不需要关心数据是如何渲染到视图

数据挟持，当访问一些类中的属性的时候，可以做一些干预


Vue模拟
Vue       Observer
                     Dep
compiler  watcher

$el 
$data
$options
*/

class Vue {
    constructor(options) {
        // save the options data by the attribute
        this.$options = options || {}
        this.$data = options.data || {}
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
            // transform the member of data to getter and setter ,inject into the instance of the vue 
        this._proxyData(this.$data)
            // call the observer object ,and listen the change of the data
        new Observer(this.$data)
            // call the compiler ,intercept the instrument and expression 
    }

    _proxyData(data) {
        //loop through all the attributes inside the data
        Object.keys(data).forEach(key => {
            //inject the attribute into the instance of the vue
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newValue) {
                    if (newValue == data[key]) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }


}