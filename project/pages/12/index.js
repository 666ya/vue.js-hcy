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
const render = createRenderer(options).render
const CompVnode = {
    type: MyComponent,
    props: {
        title: '组件例子：'
    }
}
render(CompVnode, document.getElementById('app'))