const options = {
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor) {
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
// 挂载子节点
// const vnode = {
//     type: 'div',
//     children: [{
//         type: 'p',
//         children: [{
//             type: 'span',
//             children: 'span1'
//         }]
//     }, {
//         type: 'p',
//         children: 'p2'
//     }]
// }
// 属性
// const vnode = {
//     type: 'div',
//     props: {
//         id: 'box',
//         class: 'box',
//         onClick: [() => {
//             alert('点击1')
//         }, () => {
//             alert('点击2')
//         }],
//         onContextmenu: () => {
//             alert('onContextmenu')
//         }
//     },
//     children: [{
//         type: 'p',
//         children: [{
//             type: 'label',
//             children: '姓名'
//         }, {
//             type: 'input',
//             props: {
//                 type: 'text',
//                 disabled: '',
//                 form: 'form1',
//                 placeholder: '请输入姓名'
//             }
//         }]
//     }, {
//         type: 'p',
//         children: [{
//             type: 'label',
//             children: '备注'
//         }, {
//             type: 'input',
//             props: {
//                 type: 'textarea',
//                 disabled: false,
//                 form: 'form2',
//                 value: '请输入备注'
//             }
//         }]
//     }]
// }

// 事件冒泡
const bol = ref(false)
const app = document.getElementById('app')

effect(() => {
    const vnode = {
        type: 'div',
        props: bol.value ? {
            props: {
                class: 'box'
            },
            onClick: () => {
                alert('事件冒泡到父元素')
            }
        } : {},
        children: [{
            type: 'p',
            props: {
                onClick: () => {
                    bol.value = true
                }
            },
            children: '事件冒泡和更新机制例子'
        }]
    }
    render(vnode, document.getElementById('app'))
})
// render(vnode, app)

// setTimeout(() => {
//     bol.value = true
//     // render(vnode, app)
// }, 2000)