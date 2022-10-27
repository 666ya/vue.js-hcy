const count = ref(1)
const bol = ref(true)

const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    insert(el, parent, anchor = null) {
        return parent.insertBefore(el, anchor)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    patchProps(el, key, preveValue, nextValue) {
        if (/^on/.test(key)) {
            const invokers = el._vei || (el._vei = {})
            let invoker = invokers[key]
            const name = key.slice(2).toLowerCase()
            if (nextValue) {
                if (!invoker) {
                    invoker = el._vei[key] = (e) => {
                        console.log(e.timeStamp)
                        console.log(invoker.attached)
                        if (e.timeStamp < invoker.attached) return
                        if (Array.isArray(invoker.value)) {
                            invoker.value.forEach(fn => fn(e))
                        } else {
                            invoker.value(e)
                        }
                    }
                    invoker.value = nextValue
                    invoker.attached = performance.now()
                    el.addEventListener(name, invoker)
                } else {
                    invoker.value = nextValue
                }

            } else if (invoker) {
                el.removeEventListener(name, invoker)
            }
        } else if (key === 'class') {
            el.classNamee = nextValue || ''
        } else if (shouldSetAsProps(el, key, nextValue)) {
            console.log(el)
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    },
})

const Text = Symbol()
const newVnode = {
    type: Text,
    children: '我是文本内容'
}
const Comment = Symbol()
effect(() => {
    const vnode = {
        type: 'input',
        props: {
            disabled: false
        }
    }
    // const vnode = {
    //     type: 'div',
    //     props: bol.value ? {
    //         id: 'foo',
    //         onClick: [
    //             () => {
    //                 alert('父元素click')
    //             }
    //         ],
    //     } : {},
    //     children: bol.value ? [{
    //         type: 'p',
    //         props: {
    //             onClick: () => {
    //                 bol.value = false
    //             }
    //         },
    //         children: 'text'
    //     }] : 'hello world'
    // }
    renderer.render(vnode, document.getElementById('app'))
})

// setTimeout(() => {
//     count.value++
// }, 2000)