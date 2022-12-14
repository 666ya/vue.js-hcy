const Text = Symbol()
const Fragment = Symbol()

function shouldAsProps(el, key, value) {
    if (key === 'form' && el.tagName === 'INPUT') {
        return false
    }
    return key in el
}

function defineAsyncComponent(options) {
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }
    const {
        loader
    } = options
    let InnerComp = null

    let retries = 0

    function load() {
        return loader().catch(err => {
            if (options.onError) {
                return new Promise((resolve, reject) => {
                    const retry = () => {
                        resolve(load())
                        retries++
                    }
                    const fail = () => reject(err)
                    options.onError(retry, fail, retries)
                })
            } else {
                throw err
            }
        })
    }
    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const {
                props
            } = currentInstance.vnode
            const loaded = ref(false)
            const error = ref(null)
            const loading = ref(false)

            let loadingTimer = null
            if (options.delay) {
                loadingTimer = setTimeout(() => {
                    loading.value = true
                }, options.delay)
            } else {
                loading.value = true
            }
            load().then(c => {
                InnerComp = c
                loaded.value = true
            }).catch(err => error.value = err).finally(() => {
                loading.value = false
                clearTimeout(loadingTimer)
            })

            let timer = null
            if (options.timeout) {
                timer = setTimeout(() => {
                    const err = new Error(`Async component timed out after ${options.timeout}ms.`)
                    error.value = err
                }, options.timeout)
            }

            const placeholder = {
                type: Text,
                children: ''
            }
            return () => {
                if (loaded.value) {
                    return {
                        type: InnerComp,
                        props
                    }
                } else if (error.value && options.errorComponent) {
                    return {
                        type: options.errorComponent,
                        props: {
                            error: error.value
                        }
                    }
                } else if (loading.value && options.loadingComponent) {
                    return {
                        type: options.loadingComponent
                    }
                }
                return placeholder
            }
        }
    }
}
let currentInstance = null

function onMounted(fn) {
    currentInstance.mounted.push(fn)
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
     *  ??????
     */
    function mountElememt(vnode, container, anchor) {
        const el = vnode.el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            // ???????????????
            vnode.children.forEach(child => {
                patch(null, child, el)
            });
        }
        // ??????
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
        insert(el, container, anchor)
    }

    function patchElement(n1, n2, container) {
        // ????????????
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
        // ???????????????
        patchChildren(n1, n2, el)
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
                const oldChildren = n1.children
                const newChildren = n2.children
                // let lastIndex = 0
                // for (let i = 0; i < newChildren.length; i++) {
                //     const newVNode = newChildren[i]
                //     let find = false
                //     for (let j = 0; j < oldChildren.length; j++) {
                //         const oldVNode = oldChildren[j]
                //         if (newVNode.key === oldVNode.key) {
                //             find = true
                //             patch(oldVNode, newVNode, container)
                //             if (j < lastIndex) {
                //                 const prevVNode = newChildren[i - 1]
                //                 if (prevVNode) {
                //                     const anchor = prevVNode.el.nextSibling
                //                     insert(newVNode.el, container, anchor)
                //                 }
                //             } else {
                //                 lastIndex = j

                //             }
                //             break
                //         }
                //     }
                //     if (!find) {
                //         // ?????????????????????
                //         const prevVNode = newChildren[i - 1]
                //         let anchor = null
                //         if (prevVNode) {
                //             anchor = prevVNode.el.nextSibling

                //         } else {
                //             anchor = container.firstChild
                //         }
                //         patch(null, newVNode, container, anchor)
                //     }
                // }
                // for (let i = 0; i < oldChildren.length; i++) {
                //     const oldVNode = oldChildren[i]
                //     const has = newChildren.find(({
                //         key
                //     }) => oldVNode.key === key)
                //     if (!has) {
                //         umount(oldVNode)
                //     }
                // }
                const oldLen = oldChildren.length
                const newLen = newChildren.length
                const commonLenth = Math.min(oldLen, newLen)
                for (let i = 0; i < commonLenth; i++) {
                    patch(oldChildren[i], newChildren[i], container, null)
                }
                if (newLen > oldLen) {
                    for (let i = commonLenth; i < newLen; i++) {
                        patch(null, newChildren[i], container, null)
                    }
                } else if (oldLen > newLen) {
                    for (let i = commonLenth; i < oldLen; i++) {
                        umount(oldChildren[i])
                    }
                }
                n1.children.forEach(c => {
                    umount(c)
                })
                n2.children.forEach(c => patch(null, c, container, null))
            } else {
                setElementText(container, '')
                n2.children.forEach(c => patch(null, c, container, null))
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
    /**
     *  ??????
     */
    function resolveProps(options = {}, propsData = {}) {
        const props = {}
        const attrs = {}
        for (const key in propsData) {
            if (key in options || key.startsWith('on')) {
                props[key] = propsData[key]
            } else {
                attrs[key] = propsData[key]
            }
        }
        return [props, attrs]
    }

    function hasPropsChanged(prevProps, nextProps) {
        const nextKeys = Object.keys(nextProps)
        const prevKeys = Object.keys(prevProps)
        if (nextKeys.length !== prevKeys.length) {
            return true
        }
        for (let i = 0; i < nextKeys.length; i++) {
            const key = nextKeys[i]
            if (nextProps[key] !== prevProps[key]) return true
        }
        return false
    }


    function setCurrentInstance(instance) {
        currentInstance = instance
    }

    function mountCompoennt(vnode, container, anchor) {
        const isFunctional = typeof vnode.type === 'function'
        let componentOptions = vnode.type
        if (isFunctional) {
            componentOptions = {
                render: vnode.type,
                props: vnode.type.props
            }
        }
        let {
            render,
            data,
            setup,
            props: propsOptions,
            beforeCreate,
            created,
            beforeMount,
            mounted,
            beforeUpdate,
            updated,

        } = componentOptions
        beforeCreate && beforeCreate()
        const [props, attrs] = resolveProps(propsOptions || {}, vnode.props)
        const state = !isFunctional && data ? reactive(data()) : {}
        const slots = vnode.children || {}
        const instance = {
            vnode: vnode,
            state,
            props: shallowReactive(props),
            isMounted: false,
            subTree: null,
            slots,
            mounted: []
        }
        let setupState = null
        if (setup) {
            function emit(event, ...payload) {
                const eventName = 'on' + event[0].toUpperCase() + event.slice(1)
                const handler = instance.props[eventName]
                if (handler) {
                    handler(...payload)
                } else {
                    console.error('???????????????')
                }
            }
            const setupContext = {
                attrs,
                emit,
                slots
            }
            setCurrentInstance(instance)
            const setupResult = setup(shallowReadonly(instance.props), setupContext)
            setCurrentInstance(null)
            if (typeof setupResult === 'function') {
                if (!render) {
                    render = setupResult
                }
            } else {
                setupState = setupResult
            }
        }

        vnode.component = instance
        const renderContext = new Proxy(instance, {
            get(t, k, r) {
                const {
                    state,
                    props,
                    slots
                } = t
                if (setupState && k in setupState) {
                    return setupState[k]
                } else if (state && k in state) {
                    return state[k]
                } else if (k in props) {
                    return props[k]
                } else if (k === '$slots') {
                    return slots
                } else {
                    console.error(`${k}?????????`)
                }
            },
            set(t, k, v, r) {
                const {
                    state,
                    props
                } = t
                if (setupState && k in setupState) {
                    setupState[k] = v
                } else if (state && k in state) {
                    state[k] = v
                } else if (k in props) {
                    console.log(`Attemping to mutate props "${k}". Props are readonly.`)
                } else {
                    console.error(`${k}?????????`)
                }
            }
        })
        created && created.call(renderContext)
        effect(() => {
            const subTree = render.call(renderContext, renderContext)
            if (!instance.isMounted) {
                beforeMount && beforeMount.call(renderContext)
                patch(null, subTree, container, anchor)
                instance.isMounted = true
                // mounted && mounted.call(renderContext)
                instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
            } else {
                beforeUpdate && beforeUpdate.call(renderContext)
                patch(instance.subTree, subTree, container, anchor)
                updated && updated.call(renderContext)
            }
            instance.subTree = subTree
        }, {
            scheduler: queueJob
        })
    }

    function patchComponent(n1, n2, anchor) {
        const component = (n2.component = n1.component)
        const {
            props
        } = component
        if (hasPropsChanged(n1.props, n2.props)) {
            const [nextProps] = resolveProps(n2.type.props, n2.props)
            for (const k in nextProps) {
                props[k] = nextProps[k]
            }
            for (const k in props)
                if (!(k in nextProps)) {
                    delete props[k]
                }
        }
    }
    // ??????
    function patch(n1, n2, container, anchor) {
        if (n1 && n1.type !== n2.type) {
            umount(n1)
            n1 = null
        }
        const {
            type
        } = n2
        // vnode type??????
        if (typeof type === 'string') {
            // ????????????
            if (!n1) {
                // ??????????????????
                mountElememt(n2, container, anchor)
            } else {
                patchElement(n1, n2, container)
            }
        } else if (type === Text) {
            // ????????????
            if (!n1) {
                // const el = n2.el = document.createTextNode(n2.type)
                const el = n2.el = createText(n2.children)
                insert(el, container, anchor)
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

        } else if (typeof type === 'object' || typeof type === 'function') {
            // ??????
            if (!n1) {
                mountCompoennt(n2, container, anchor)
            } else {
                patchComponent(n1, n2, anchor)
            }
        }

    }
    // ??????
    function umount(vnode) {
        if (vnode.type === Fragment) {
            vnode.children.forEach(c => umount(c))
            return
        } else if (typeof vnode.type === 'object') {
            umount(vnode.component.subTree)
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
            // ??????
            umount(container._vnode)
            // container.innerHTML = ''
        }
        container._vnode = vnode
    }
    return {
        render
    }
}