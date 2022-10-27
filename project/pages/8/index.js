const options = {
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor) {
        parent.insertBefore(el, anchor)
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
const vnode = {
    type: 'div',
    props: {
        id: 'box',
        class: 'box'
    },
    children: [{
        type: 'p',
        children: [{
            type: 'label',
            children: '姓名'
        }, {
            type: 'input',
            props: {
                type: 'text',
                disabled: '',
                form: 'form1',
                placeholder: '请输入姓名'
            }
        }]
    }, {
        type: 'p',
        children: [{
            type: 'label',
            children: '备注'
        }, {
            type: 'input',
            props: {
                type: 'textarea',
                disabled: false,
                form: 'form2',
                value: '请输入备注'
            }
        }]
    }]
}
const app = document.getElementById('app')
render(vnode, app)

// setTimeout(() => {
//     render(vnode, app)
// }, 2000)