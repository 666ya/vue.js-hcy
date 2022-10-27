function createRenderer(options) {
    const {
        createElement,
        setElementText,
        insert
    } = options

    function mountElememt(vnode, container) {
        // const el = document.createElement(vnode.type)
        const el = vnode.el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            // el.textContent = vnode.children
            setElementText(el, vnode.children)
        }
        insert(el, container)
        console.log(el)
        // container.appendChild(el)
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