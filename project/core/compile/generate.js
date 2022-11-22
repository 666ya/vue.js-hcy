function getNodeList(nodes, context) {
    const {
        push
    } = context
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        genNode(node, context)
        if (i < nodes.length - 1) {
            push(',  ')
        }
    }
}

function genFunctionDecl(node, context) {
    const {
        push,
        indent,
        deIndent
    } = context
    push(`funciton ${node.id.name}`)
    push(`(`)
    getNodeList(node.params, context)
    push(`)`)
    push(`{`)
    indent()
    node.body.forEach(n => {
        genNode(n, context)
    });
    deIndent()
    push(`}`)
}

function genArrayExpression(node, context) {
    const {
        push
    } = context
    push(`[`)
    getNodeList(node.elements, context)
    push(']')
}

function genReturnStatement(node, context) {
    const {
        push
    } = context
    push(`return `)
    genNode(node.return, context)
}

function genStringLiteral(node, context) {
    const {
        push
    } = context
    push(`'${node.value}'`)
}

function genCallExpression(node, context) {
    const {
        push
    } = context
    const {
        callee,
        arguments: args
    } = node
    push(`${callee.name}(`)
    getNodeList(args, context)
    push(`)`)
}

function genNode(node, context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDecl(node, context)
            break
        case 'ReturnStatement':
            genReturnStatement(node, context)
            break
        case 'CallExpression':
            genCallExpression(node, context)
            break
        case 'StringLiteral':
            genStringLiteral(node, context)
            break
        case 'ArrayExpression':
            genArrayExpression(node, context)
            break
    }
}


function generate(node) {
    const context = {
        code: '',
        push(code) {
            context.code += code
        },
        currentIndent: 0,
        newLine() {
            context.code += '\n' + '  '.repeat(context.currentIndent)
        },
        indent() {
            context.currentIndent++
            context.newLine()
        },
        deIndent() {
            context.currentIndent++
            context.newLine()
        }
    }
    console.log(node)
    genNode(node, context)
    return context.code
}