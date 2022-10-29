function shouldAsProps(el, key, value) {
    if (key === 'form' && el.tagName === 'INPUT') {
        return false
    }
    return key in el
}

function createRenderer(options) {
    const {
        createElement,
        setElementText,
        patchProps,
        insert,
    } = options
    /**
     *  元素
     */
    function mountElememt(vnode, container) {
        const el = vnode.el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            // 挂载子节点
            vnode.children.forEach(child => {
                patch(null, child, el)
            });
        }
        // 属性
        if (vnode.props) {
            for (const key in vnode.props) {
                // const value = vnode.props[key]
                // if (shouldAsProps(el, key, value)) {
                //     const type = typeof el[key]
                //     if (type === 'boolean' && value === '') {
                //         el[key] = true
                //     } else {
                //         el[key] = value
                //     }

                // } else {
                //     el.setAttribute(key, value)
                // }
                patchProps(el, key, null, vnode.props[key])
            }
        }
        insert(el, container)
    }

    function patchElement(n1, n2, container) {

    }

    function patch(n1, n2, container) {
        if (n1 && n1.type !== n2.type) {
            umount(n1)
            n1 = null
        }
        const {
            type
        } = n2
        // vnode type分支
        if (typeof type === 'string') {
            // 元素标签
            if (!n1) {
                // 第一次即挂载
                mountElememt(n2, container)
            } else {
                patchElement(n1, n2, container)
            }
        } else if (typeof type === 'object') {
            // 组件
        } else if (typeof type === 'xx') {
            // 其他
        }

    }
    // 卸载
    function umount(vnode) {
        const parent = vnode.el.parentNode
        if (parent) {
            parent.removeChild(vnode.el)
        }
    }

    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            // 卸载
            umount(container._vnode)
            // container.innerHTML = ''
        }
        container._vnode = vnode
    }
    return {
        render
    }
}