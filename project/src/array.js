const arr = reactive([])
effect(() => {
    arr.push(1)
})
effect(() => {
    arr.push(2)
})

setTimeout(() => {
    console.log(arr)
}, 2000)

// arr[1] = 'bar'