  function shouldSetAsProps(el, key, value) {
      if (key === 'form' && el.tagName === 'INPUT') return false
      return key in el
  }

  function createRenderer(options) {
      const {
          createElement,
          setElementText,
          patchProps,
          insert
      } = options

      function patchChildren(n1, n2, container) {
          if (typeof n2.children === 'string') {
              if (Array.isArray(n1.children)) {
                  n1.children.forEach(c => umount(c))
              }
              setElementText(container, n2.children)
          } else if (Array.isArray(n2.children)) {
              if (Array.isArray(n1.children)) {
                  // diff算法
                  const oldChildren = n1.children
                  const newChildren = n2.children
                  for (let i = 0; i < oldChildren.length; i++) {
                      patch(oldChildren[i], newChildren[i])
                  }
              } else {
                  setElementText(container, '')
                  n2.children.forEach(c => patchChildren(null, c, container))
              }
          } else {
              if (Array.isArray(n1.children)) {
                  n1.children.forEach(c => umount(c))
              } else if (typeof n1.children === 'string') {
                  setElementText(container, '')
              }
          }
      }

      function mountElement(vnode, container) {
          const el = vnode.el = createElement(vnode.type)
          if (typeof vnode.children === 'string') {
              // el.textContent = vnode.children
              setElementText(el, vnode.children)
          } else if (Array.isArray(vnode.children)) {
              vnode.children.forEach(child => {
                  patch(null, child, el)
              })
          }
          if (vnode.props) {
              for (const key in vnode.props) {
                  patchProps(el, key, null, vnode.props[key])
              }
          }
          insert(el, container)
          // container.appendChild(el)
      }

      function patchElement(n1, n2) {
          const el = n2.el = n1.el
          const oldProps = n1.props
          const newProps = n2.props
          // 更新props
          for (const key in newProps) {
              if (newProps[key] !== oldProps[key]) {
                  patchProps(el, key, oldProps[key], newProps[key])
              }
          }
          for (const key in oldProps) {
              if (!(key in newProps)) {
                  patchProps(el, key, oldProps[key], null)
              }
          }
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
          if (typeof type === 'string') {
              if (!n1) {
                  mountElement(n2, container)
              } else {
                  patchElement(n1, n2)
              }
          } else if (type === Text) {
              // 文本节点
          } else if (typeof type === 'object') {
              // 组件
          } else if (type === 'xxxx') {
              // 其他类型node
          }
      }

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
              if (container._vnode) {
                  umount(container._vnode)
                  // const el = container._vnode.el
                  // const parent = el.parentNode
                  // if (parent) parent.removeChild(el)
                  // container.innerHTML = ''
              }
          }
          container._vnode = vnode
      }
      return {
          render
      }
  }