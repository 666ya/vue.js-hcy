const Text = Symbol()
const Fragment = Symbol()

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
        createText,
        setText,
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

    function patchChildren(n1, n2, container) {
        if (typeof n2.children === 'string') {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => {
                    umount(c)
                })
            }
            setElementText(container, n2.children)
        } else if (Array.isArray(n2.children)) {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => {
                    umount(c)
                })
                n2.children.forEach(c => patch(null, c, container))
            } else {
                setElementText(container, '')
                n2.children.forEach(c => patch(null, c, container))
            }
        } else {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => {
                    umount(c)
                })
            } else if (typeof n1.children === 'string') {
                setElementText(container, '')
            }
        }
    }

    function patchElement(n1, n2, container) {
        // 更新属性
        const el = n2.el = n1.el
        const oldProps = n1.props
        const newProps = n2.props
        for (const key in newProps) {
            if (oldProps[key] !== newProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
            if (!key in newProps) {
                patchProps(el, key, oldProps[key], null)
            }
        }
        // 更新子节点
        patchChildren(n1, n2, el)
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
        } else if (type === Text) {
            // 文本节点
            if (!n1) {
                // const el = n2.el = document.createTextNode(n2.type)
                const el = n2.el = createText(n2.type)
                insert(el, container)
            } else {
                const el = n2.el = n1.el
                if (n2.children !== n1.children) {
                    setText(el, n2.children)
                    // el.nodeValue = n2.children
                }
            }

        } else if (type === Fragment) {
            if (!n1) {
                n2.children.forEach(c => patch(null, c, container))
            } else {
                patchChildren(n1.children, n2.children, container)
            }

        } else if (typeof type === 'object') {
            // 组件
        }

    }
    // 卸载
    function umount(vnode) {
        if (vnode.type === Fragment) {
            vnode.children.forEach(c => umount(c))
            return
        }
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