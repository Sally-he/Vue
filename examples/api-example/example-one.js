/* eslint-disable no-unused-vars */

// 将数据设置为observe
function observe(value, cb) {
    Object.keys(value).forEach((key)=>{
        defineReactive(value, key, value[key], cb)
    })
}

function defineReactive(obj, key, val,cb) {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: ()=>{
            return val
        },
        set: (newVal) => {
            val = newVal
            cb();
        }
    })
}

// 代理
function _proxy(data){
    const _that = this
    Object.keys(data).forEach(key =>{
        Object.defineProperty(_that,key, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter() {
                return _that._data[key]
            },
            set: function proxySetter(val) {
                _that._data[key] = val
            }   
        })
    })
}

class Vue  {
    constructor(options){
        this._data = options.data
        observe(this._data, options.render)
        // _proxy.call(this, options.data)
    }
}

let app = new Vue({
    el: '#app',
    data: {
        text: 'text',
        text2: 'text2'
    },
    render(){
        console.log('render')
    }
})
console.log(app._data.text)
// console.log(app.text)