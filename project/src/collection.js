let setFlag = 0
if (setFlag) {
    // set
    const s = new Set([1, 2, 3]);
    let c = reactive(s);


    effect(() => {})

    setTimeout(() => {
        // c.add(5)
        c.delete(1)
    }, 2000)
} else {
    // map
    const m = reactive(new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
    ]))
    effect(() => {
        for (const key of m.keys()) {
            console.log(key)
        }
    })
    setTimeout(() => {
        m.set('key2', 'value3')
    }, 2000)
}