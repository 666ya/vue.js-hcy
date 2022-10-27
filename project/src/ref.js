const refVal = ref(1)
const reactiveVal = reactive({
    value: 1
})
// effect(() => {
//     console.log(refVal.value)
// })

// setTimeout(() => {
//     refVal.value = 2
// }, 2000)



// toRrefs
const reactiveObj = reactive({
    foo: 1,
    bar: 1
})
const refsObj1 = toRefs(reactiveObj)
const refsObj2 = {
    ...toRefs(reactiveObj)
}
const refsObj3 = proxyRefs(toRefs(reactiveObj))


effect(() => {
    console.log(refsObj3.foo)
})

setTimeout(() => {
    refsObj3.foo++
}, 2000)