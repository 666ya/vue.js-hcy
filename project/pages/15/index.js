const template = `<div><p>vue</p><span></span><p>template</p></div>`
const ast = parse(template)
transform(ast)
const code = generate(ast.jsNode)
console.log(code)