let activeEffect
const bucket = new WeakMap()
const ITERATE_KEY = Symbol()
const effectStack = []
// 定义一个任务队列
// const jobQueue = new Set()
// const p = Promise.resolve()
// let isFlushing = false

// function flushJob() {
//     if (isFlushing) return
//     isFlushing = true
//     p.then(() => {
//         jobQueue.forEach(job => job())
//     }).finally(() => {
//         isFlushing = false
//     })
// }
const queue = new Set()
let isFlushing = false
const p = Promise.resolve()

function queueJob(job) {
    queue.add(job)
    if (!isFlushing) {
        isFlushing = true
        p.then(() => {
            try {
                queue.forEach(job => job())
            } finally {
                isFlushing = false
                queue.clear = 0
            }
        })
    }
}
// arrayInstument

const arrayInstumentations = {};
['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
    const orginMethond = Array.prototype[method]
    arrayInstumentations[method] = function (...args) {
        let res = orginMethond.apply(this, args)
        if (res === false || res === -1) {
            res = orginMethond.apply(this.raw, args)
        }
        return res
    }
})

let shoudlTrack = true;
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
    const orginMethond = Array.prototype[method]
    arrayInstumentations[method] = function (...args) {
        shoudlTrack = false
        const res = orginMethond.apply(this, args)
        shoudlTrack = true
        return res
    }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }

            if (Array.isArray(target) && arrayInstumentations.hasOwnProperty(key)) {
                return Reflect.get(arrayInstumentations, key, receiver)
            }

            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key)
            }
            const res = Reflect.get(target, key, receiver)
            if (isShallow) {
                return res
            }
            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        },
        set(target, key, newValue, recevier) {
            if (isReadonly) {
                console.log(`属性${key}是只读的`)
                return true
            }
            const oldValue = target[key]
            const type = Array.isArray(target) ? Number(key) < target.length ? 'SET' : 'ADD' :
                Object.prototype.hasOwnProperty.call(key) ? 'SET' : 'ADD'
            const res = Reflect.set(target, key, newValue, recevier)
            if (target === recevier.raw) {
                if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
                    trigger(target, key, type, newValue)
                }
                return res
            }

        },
        has(target, key) {
            track(target, key)
            return Reflect.has(target, key)
        },
        deleteProperty(target, key) {
            if (isReadonly) {
                console.log(`属性${key}是只读的`)
                return true
            }
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const res = Reflect.deleteProperty(target, key)
            if (res && hadKey) {
                trigger(target, key, 'DELETE')
            }
            return res
        },
        ownKeys(target) {
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        },
    })
}

function track(target, key) {
    if (!activeEffect || !shoudlTrack) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
}

function trigger(target, key, type, newVal) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)

    const effectToRun = new Set()
    effects && effects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectToRun.add(effectFn)
        }
    })

    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectToRun.add(effectFn)
            }
        })
    }
    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffects = depsMap.get('length')
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectToRun.add(effectFn)
            }
        })
    }
    if (Array.isArray(target) && key === 'length') {
        depsMap.forEach((effects, key) => {
            if (key >= newVal) {
                effects && effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectToRun.add(effectFn)
                    }
                })
            }
        })
    }
    effectToRun && effectToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const dep = effectFn.deps[i]
        dep.delete(effectFn)
    }
    effectFn.deps.length = 0
}
// 注册副作用
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        const res = fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
    effectFn.options = options
    effectFn.deps = []
    // 懒加载
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}
// computed
function computed(getter) {
    let _value, _dirty = true
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            _dirty = true
            trigger(obj,
                'value')
        }
    })
    const obj = {
        get value() {
            if (_dirty) {
                _value = effectFn()
                _dirty = false
            }
            track(obj, 'value')
            return _value
        }
    }
    return obj
}


// watch
function traverse(value, seen = new Set()) {
    if (typeof value !== 'objcet' || value === null || seen.has(value)) return
    seen.add(value)
    for (const key in value) {
        traverse(value[key], seen)
    }
    return value
}

function watch(source, cb, options = {}) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    let oldValue, newValue
    const job = () => {
        newValue = effectFn()
        cb(newValue, oldValue)
        oldValue = newValue
    }
    const effectFn = effect(
        () => getter(), {
            lazy: true,
            scheduler: () => {
                if (options.flush === 'post') {
                    const p = Promise.resolve()
                    p.then(job)
                } else {
                    job()
                }
            }
        })
    if (options.immediate) {
        job()
    } else {
        oldValue = effectFn()
    }

}



const reactiveMap = new Map()

function reactive(obj) {
    const existProxy = reactiveMap.get(obj)
    if (existProxy) return existProxy
    const proxy = createReactive(obj)
    reactiveMap.set(obj, proxy)
    return proxy
}

function shallowReactive(obj) {
    return createReactive(obj, true)
}

function readonly(obj) {
    return createReactive(obj, false, true /* 只读 */ )
}

function shallowReadonly(obj) {
    return createReactive(obj, true, true /* 只读 */ )
}
// ref
function ref(val) {
    const wrapper = {
        value: val
    }
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })
    return reactive(wrapper)
}

function isRef(r) {
    return !!(r && r.__v_isRef === true)
}

function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key]
        },
        set value(val) {
            obj[key] = val
        }
    }
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })
    return wrapper
}

function toRefs(obj) {
    const ret = {}
    for (const key in obj) {
        ret[key] = toRef(obj, key)
    }
    return ret
}

function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver)
            return value.__v_isRef ? value.value : value
        },
        set(target, key, newVal, receiver) {
            const value = target[key]
            if (value.__v_isRef) {
                value.value = newVal
                return true
            }
            return Reflect.set(target, key, newVal, receiver)
        }
    })
}