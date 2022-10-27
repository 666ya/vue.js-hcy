function createRenderer(options) {
    const {
        createElement,
        setElementText,
        insert
    } = options

    // 挂载
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
                if (key in el) {
                    const type = typeof el[key]
                    const value = vnode.props[key]
                    if (type === 'boolean' && value === '') {
                        el[key] = true
                    } else {
                        el[key] = value
                    }

                } else {
                    el.setAttribute(key, vnode.props[key])
                }
            }
        }
        insert(el, container)
    }

    function patch(n1, n2, container) {
        if (!n1) {
            // 第一次即挂载
            mountElememt(n2, container)
        } else {
            // 更新打补丁
        }
    }

    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            container.innerHTML = ''
        }
        container._vnode = vnode
    }
    return {
        render
    }
}