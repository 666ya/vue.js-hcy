const MyTab1 = {
    setup() {
        onMounted(() => {
            console.log('挂载1')
        })
        return () => ({
            type: 'input',
            props: {
                type: 'text',
                value: ''
            },
        })
    }
}
const MyTab2 = {
    setup() {
        onMounted(() => {
            console.log('挂载2')
        })
        return () => ({
            type: 'input',
            props: {
                type: 'text',
                value: ''
            },
        })
    }
}

const MyTab3 = {
    setup() {
        onMounted(() => {
            console.log('挂载3')
        })
        return () => ({
            type: 'input',
            props: {
                type: 'text',
                value: ''
            },
        })
    }
}


function tabList() {
    const list = []
    for (let i = 0; i < 3; i++) {
        list.push({
            type: 'button',
            // children: this.isShow ? '隐藏' : '显示',
            children: `tab${i+1}`,
            props: {
                index: i,
                onclick: () => {
                    this.curTab = i + 1
                }
            }
        })
    }
    return list
}

function slotDefault() {
    let curComp = null
    switch (this.curTab) {
        case 1:
            curComp = MyTab1
            break;
        case 2:
            curComp = MyTab2
            break;
        case 3:
            curComp = MyTab3
            break;
    }
    return {
        default () {
            return {
                type: curComp
            }
        }
    }
}
const App = {
    name: 'App',
    data() {
        return {
            isShow: true,
            curTab: 1
        }
    },
    render() {
        return {
            type: 'div',
            props: {
                class: 'app-main'
            },
            children: [{
                    type: 'div',
                    children: tabList.call(this)
                },
                {
                    type: KeepAlive,
                    props: {
                        curTab: this.curTab,
                        max: 3
                    },
                    children: slotDefault.call(this)
                },
                //     (this.isShow ? {
                //     type: KeepAlive,
                //     children: {
                //         default () {
                //             let curComp = null
                //             switch (this.curTab) {
                //                 case 1:
                //                     curComp = MyTab1
                //                     break;
                //                 case 2:
                //                     curComp = MyTab2
                //                     break;
                //                 case 3:
                //                     curComp = MyTab3
                //                     break;
                //             }
                //             return {
                //                 type: curComp
                //             }
                //         }
                //     }
                // } : {
                //     type: Text,
                //     children: ''
                //     })
            ]
        }
    }
}
const CompVnode = {
    type: App,
}
const render = createRenderer(options).render
render(CompVnode, document.getElementById('app'))
// setTimeout(() => {
//     render(CompVnode, document.getElementById('app'))
// }, 2000)