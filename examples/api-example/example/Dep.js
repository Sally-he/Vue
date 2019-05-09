
let uid = 0

/**
 * 订阅中心
 * data 中的每个属性(包括子属性)都对应一个 Dep 实例，监听该属性的 watcher 实例会被添加到 this.subs 中；
 * 属性值一旦变化，就会通知这些订阅该属性的 watcher 实例  
 */
class Dep {
    constructor() {
        // id 用来识别 Dep 实例
        this.id = uid++
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    removeSub(sub) {
        const index = this.subs.indexOf(sub)
        if (index !== -1) {
            this.subs.splice(index, 1)
        }
    }

    depend() {
        // 控制依赖反转，Dep.target 为 Watcher 实例
        // 把某属性对应的 Dep 实例传递给 Watcher 实例进行操作
        Dep.target.applyDep(this)
    }

    notify() {
        // 某属性变化，通知订阅的 Watcher 实例
        this.subs.forEach(sub => sub.update())
    }
}

// 全局属性，Watcher 实例在获取订阅的属性值时，Dep.target 指向该实例
// 其它时刻 Dep.target 都为 null
Dep.target = null

export default Dep
