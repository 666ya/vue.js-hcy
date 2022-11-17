const cache = new Map()
const keys = new Set()
const KeepAlive = {
    name: 'KeepAlive',
    __isKeepAlive: true,
    props: {
        max: Number
    },
    setup(props, {
        slots
    }) {
        const {
            max
        } = props
        const instance = currentInstance
        const {
            move,
            createElement,
            umount
        } = instance.KeepAliveCtx
        const storageContainer = createElement('div')
        storageContainer.className = 'storageContainer' // 测试
        instance._deActivate = (vnode) => {
            move(vnode, storageContainer)
        }
        instance._activate = (vnode, container, anchor) => {
            move(vnode, container, anchor)
        }
        return () => {
            const rawVNode = slots.default()
            if (typeof rawVNode !== 'object') {
                return rawVNode
            }
            // 如果是组件
            const cachedVNode = cache.get(rawVNode.type)
            if (cachedVNode) {
                rawVNode.component = cachedVNode.component
                rawVNode.keptAlive = true
                keys.delete(rawVNode.type)
                keys.add(rawVNode.type)
            } else {
                cache.set(rawVNode.type, rawVNode)
                keys.add(rawVNode.type)
                if (max && keys.size > parseInt(max, 10)) {
                    const key = keys.values().next().value
                    const vnode = cache.get(key)
                    if (vnode) {
                        cache.delete(key)
                        keys.delete(key)
                        vnode.shouldKeepAlive = false
                        vnode.keptAlive = false
                        umount(vnode)
                    }
                }
            }
            rawVNode.shouldKeepAlive = true
            rawVNode.KeepAliveInstance = instance
            return rawVNode
        }
    }
}


/**
 *  挂载
 */

// 