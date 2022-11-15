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
/**
 *   异步组件example
 */
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
const AsyncConp = defineAsyncComponent({
    loader: () => new Promise((resolve, reject) => {
        // reject('加载失败')
        setTimeout(() => {
            // resolve({
            //     render() {
            //         return {
            //             type: 'div',
            //             children: '异步组件'
            //         }
            //     }
            // })
            reject('加载失败')
        }, 1000)

    }),
    onError: (retry, fail, count) => {
        console.log(count)
        // retry()
        // console.log(count)
        if (count > 4) {
            fail()
        } else {
            retry()
        }
    },
    delay: 200,
    loadingComponent: MyLoadingComp,
    errorComponent: MyErrorComp,
    timeout: 2000
})
const CompVnode = {
    type: 'div',
    props: {
        onClick: () => {
            console.log('组件事件')
        }
    },
    children: [{
        type: AsyncConp
    }]
}
const render = createRenderer(options).render
render(CompVnode, document.getElementById('app'))
// setTimeout(() => {
//     render(CompVnode, document.getElementById('app'))
// }, 2000)