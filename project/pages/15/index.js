const template = `<div><p>vue</p><p>template</p></div>`
const ast = parse(template)
transform(ast)

function render() {
    return h('div', [
        h('p', 'vue'),
        h('p', 'tempalte')
    ])
}