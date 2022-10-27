// 例子
const rawObj = {
    text: 'text',
    show: true,
    foo: 1,
    bar: 2,
    count: 1

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
watch(() => obj.count, (newVal, oldVal) => {
    console.log(oldVal)
    console.log(newVal)
    console.log('watch 改变')
}, {
    immediate: true,
    flush: 'post'
})

// setTimeout(() => {
//     obj.count++
// }, 2000)