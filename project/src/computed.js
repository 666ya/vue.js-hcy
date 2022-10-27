/**
 * example
 */
const rawObj = {
    text: 'text',
    show: true,
    foo: 1,
    bar: 2,

}
const obj = new Proxy(rawObj, {
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, newValue, recevier) {
        target[key] = newValue
        trigger(target, key)
    }
})
const count = computed(() => obj.foo + obj.bar)
effect(() => {
    console.log(count.value)
})
console.log(count.value)

setTimeout(() => {
    obj.foo++
}, 2000)