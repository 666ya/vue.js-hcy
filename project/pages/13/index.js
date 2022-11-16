const MyComponent = {
    name: 'MyComponent',
    props: {
        title: String
    },
    data() {
        return {
            count: 0
        }
    },
    setup: (props, setupContext) => {
        const {
            emit
        } = setupContext
        emit('click')
        return function () {
            return {
                type: 'div',
                children: 'aaa'
            }
        }
    },
    render() {
        return {
            type: 'div',
            children: [{
                    type: 'span',
                    children: `${this.title}：${this.count}`
                },
                {
                    type: 'button',
                    children: '点击',
                    props: {
                        style: 'margin-left: 10px',
                        onclick: () => {
                            this.count++
                        }
                    }
                }
            ]
        }
    },
    mounted() {
        this.title = 'aaa'
        console.log(this.count)
    },
}

// 无状态组件
function FunctionalComp(props) {
    return {
        type: 'div',
        children: props.title
    }
}
// 定义props
FunctionalComp.props = {
    title: String
}



const MyLoadingComp = {
    render() {
        return {
            type: 'div',
            props: {
                class: 'loadingWrapper'
            },
            children: [{
                type: 'p',
                children: 'loading……'
            }]
        }
    }
}
const MyErrorComp = {
    props: {
        error: String
    },
    render() {
        return {
            type: 'div',
            children: `${this.error}`
        }
    }
}
/**
 *   异步组件example
 */
const DialogComp = {
    props: {
        dialogTitle: String,
        isShow: Boolean
    },
    render() {
        return {
            type: 'div',
            props: {
                class: 'dialog-mask',
                style: this.isShow ? 'dispaly:block ' : 'display: none'
            },
            children: [{
                type: 'div',
                props: {
                    class: 'dialog-wrapper'
                },
                children: [{
                    type: 'p',
                    props: {
                        class: 'dialog-nav'
                    },
                    children: `${this.dialogTitle || ''}`
                }, {
                    type: 'div',
                    props: {
                        class: 'dialog-body'
                    }
                }, {
                    type: 'div',
                    props: {
                        class: 'dialog-footer'
                    },
                    children: [{
                        type: 'button',
                        props: {
                            class: 'btn'
                        },
                        children: '取消'
                    }]
                }]
            }],
        }
    }
}

const CommonDialog = defineAsyncComponent({
    loader: () => new Promise((resolve, reject) => {
        resolve(DialogComp)
        // reject('加载失败')
        setTimeout(() => {
            console.log('async')
            resolve(DialogComp)
        }, 2000)

    }),
    // onError: (retry, fail, count) => {
    //     console.log(count)
    //     // retry()
    //     // console.log(count)
    //     if (count > 4) {
    //         fail()
    //     } else {
    //         retry()
    //     }
    // },
    // delay: 200,
    // loadingComponent: MyLoadingComp,
    // errorComponent: MyErrorComp,
    // timeout: 2000
})
console.log(CommonDialog)
let isShow = ref(false)
const App = {
    name: 'App',
    data() {
        return {
            isShow: false
        }
    },
    render() {
        return {
            type: 'div',
            props: {
                style: 'margin: 8px'
            },
            children: [{
                type: CommonDialog,
                props: {
                    dialogTitle: '日志列表',
                    isShow: this.isShow
                }
            }, {
                type: 'button',
                props: {
                    class: 'btn',
                    onClick: () => {
                        console.log('aa')
                        this.isShow = !this.isShow
                    }
                },
                children: '显示弹框'
            }]
        }
    }
}
const CompVnode = {
    type: App
}
const render = createRenderer(options).render
render(CompVnode, document.getElementById('app'))
// setTimeout(() => {
//     render(CompVnode, document.getElementById('app'))
// }, 2000)