import Dep from './Dep.js'

class Observer {
    constructor(data) {
        this.data = data
        this.defineReactive(data)
    }

    defineReactive(data) {
        Object.keys(data).forEach(key => {
            let val = data[key]
            // 每一个 key （包括嵌套）绑定一个 Dep 实例
            const dep = new Dep()
            // 如果值是对象，递归劫持
            observe(val)

            Object.defineProperty(data, key, {
                enumerable: true, // 可枚举
                configurable: false, // 不能再define
                get() {
                    // 访问该 key 时如果 Dep.target 指向 Watcher 实例，把该 key 对应的 Dep 实例传递给 Watcher 实例
                    // 也可以直接 dep.addSub(Dep.target)
                    Dep.target && dep.depend()
                    return val
                },
                set(newVal) {
                    if (newVal === val) {
                        return
                    }
                    val = newVal
                    // 新的值是object的话，进行监听
                    observe(newVal)
                    // 通知订阅该 key 的 Watcher 实例
                    dep.notify()
                },
            })
        })
    }
}

/**
 * 导出 observe 函数，内部实例化 Observer
 */
export function observe(data) {
    // data 不是对象无法劫持，忽略
    if (!data || typeof data !== 'object') {
        return
    }

    return new Observer(data)
}
