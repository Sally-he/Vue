import Dep from './Dep.js'

// 返回获取嵌套属性值（如 a.b.c）的函数
function parseGetter(exp) {
    // 过滤不合法的属性访问表达式
    if (/[^\w.$]/.test(exp)) return

    const exps = exp.split('.')
    return obj => {
        let value = obj
        if (obj) {
            exps.forEach(key => (value = value[key]))
        }
        return value
    }
}

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        this.cb = cb
        this.expOrFn = expOrFn
        this.depIds = {}

        // expOrFn 可能是 xxx、xxx.xxx、fn()
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parseGetter(expOrFn.trim())
        }

        this.value = this._getValue()
    }

    // 获取 Wacher 实例监视的值
    _getValue() {
        // 访问监听的属性时把 Dep.target 指向自身，从而在 Observer 中把当前实例添加到属性订阅者中
        Dep.target = this
        const value = this.getter(this.vm)
        // 获取属性值后置空 Dep.target
        Dep.target = null
        return value
    }

    // 更新视图
    update() {
        const value = this._getValue()
        const oldVal = this.value
        // 如果值有变化调用 callback 更新值
        if (value !== oldVal) {
            this.value = value
            this.cb.call(this.vm, value, oldVal)
        }
    }

    /* 
     * 1. 每次调用 update() 的时候会触发相应属性的 getter，getter 里面会触发 dep.depend()，继而触发这里的addDep
     * 2. 假如相应属性的 dep.id 已经在当前 watcher 的 depIds 里，说明不是一个新的属性，仅仅是改变了其值而已,则不需要将当前 watcher 添加到该属性的 dep 里
     * 3. 假如相应属性是新的属性，则将当前 watcher 添加到新属性的dep里,如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
     *    则需要将当前 watcher(child.name) 加入到新的 child.name 的dep里; 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，
     *    如果不把 watcher 加入到新的 child.name 的dep中,通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
     * 4. 每个子属性的 watcher 在添加到子属性的 dep 的同时，也会添加到父属性的 dep; 监听子属性的同时监听父属性的变更，这样，父属性改变时，
     *    子属性的 watcher 也能收到通知进行 update; 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
     *    触发了 addDep(), 在整个 forEach 过程，当前 wacher 都会加入到每个父级过程属性的dep 
     *  
     *  例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher 
      */
    applyDep(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this)
            this.depIds[dep.id] = dep
        }
    }
}

export default Watcher
