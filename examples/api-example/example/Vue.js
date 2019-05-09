import Watcher from './Watcher.js'
import Compiler from './Compiler.js'
import { observe } from './Observer.js'

class Vue {
  constructor(options = {}) {
    this.$options = options
    this.$data = options.data
    this.$el = options.el
    this._init()
    this.$compile = new Compiler(options.el || document.body, this)
  }

  _init() {
    this._proxyData()
    this._proxyComputed()
    this._bindMethods()
    observe(this.$data, this)
  }

  // data 代理，实现 vm.xxx, this.xxx -> vm.$data.xxx
  _proxyData() {
    const { $data } = this
    for (const key in $data) {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get() {
          return $data[key]
        },
        set(newVal) {
          $data[key] = newVal
        },
      })
    }
  }

  // computed 属性代理，实现 vm.xxx, this.xxx -> this.$options.computed.xxx
  _proxyComputed() {
    const computed = this.$options.computed
    if (typeof computed === 'object') {
      for (const key in computed) {
        Object.defineProperty(this, key, {
          get: typeof computed[key] === 'function' ? computed[key]: computed[key].get,
          set: function () { },
        })
      }
    }
  }

  // 绑定 options.methods 的方法到 this 上
  _bindMethods() {
    const methods = this.$options.methods
    if (typeof methods === 'object') {
      for (const key in methods) {
        Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(methods, key))
      }
    }
  }

  $watch(key, cb) {
    new Watcher(this, key, cb)
  }
}

export default Vue
