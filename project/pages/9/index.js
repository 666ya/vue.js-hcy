const options = {
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    createText(text) {
        return document.createTextNode(text)
    },
    setText(el, text) {
        el.nodeValue = text
    },
    patchProps(el, key, prevValue, nextValue) {
        if (/^on/.test(key)) {
            const invokers = el._vei || (el._vei = {})
            let invoker = invokers[key]
            const name = key.slice(2).toLowerCase()
            if (nextValue) {
                if (!invoker) {
                    invoker = el._vei[key] = (e) => {
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
            el.className = nextValue || ''
        } else if (shouldAsProps(el, key, nextValue)) {
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }

        } else {
            el.setAttribute(key, nextValue)
        }
    }
}

const render = createRenderer(options).render


// diff
const bol = ref(true)
effect(() => {
    const vnode = {
        type: 'div',
        props: {
            props: {
                class: 'box'
            },
            onClick: () => {
                bol.value = false
            }
        },
        children: bol.value ? [{
            type: 'p',
            children: '1',
            key: 1
        }, {
            type: 'p',
            children: '2',
            key: 2
        }, {
            type: 'p',
            children: 'hello',
            key: 3
        }, {
            type: 'p',
            children: '4',
            key: 4
        }] : [{
            type: 'p',
            children: 'world',
            key: 3
        }, {
            type: 'p',
            children: '1',
            key: 1
        }, {
            type: 'p',
            children: '2',
            key: '2',
            key: 2
        }]
    }
    render(vnode, document.getElementById('app'))
})