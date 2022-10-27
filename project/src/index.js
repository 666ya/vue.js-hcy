// example
const reactiveObj = reactive({
    foo: {
        bar: 1
    },
    count: 1
})
const shallowObj = shallowReactive({
    foo: {
        bar: 1
    },
    count: 1
})

const readonlyObj = readonly({
    foo: {
        bar: 1
    }
})
const shallowReadonlyObj = shallowReadonly({
    foo: {
        bar: 1
    }
})


// })
// 可调度行
// effect(() => {
//     console.log(obj.count)
// }, {
//     scheduler(fn) {
//         jobQueue.add(fn)
//         flushJob()
//     }
// })
// in 
//effect(() => {
//    console.log('count' in reactiveObj)
//})
//// for..in
//effect(() => {
//    for (const key in reactiveObj) {
//        console.log(key)
//    }
//})
//setTimeout(() => {
//    delete reactiveObj.count
//}, 2000)


// 可调度性
//effect(() => {
//    console.log('effect1' + ' '+ reactiveObj.count)
//}, {
//    scheduler(fn) {
//        jobQueue.add(fn)
//        flushJob()
//    }
//})
//effect(() => {
//    console.log('effect2' + ' '+reactiveObj.foo.bar)
//}, {
//    scheduler(fn) {
//        jobQueue.add(fn)
//        flushJob()
//    }
//})
//
//setTimeout(() => {
//    reactiveObj.count++
//    reactiveObj.foo.bar++
//    reactiveObj.count++
//    reactiveObj.foo.bar++
//},2000)




