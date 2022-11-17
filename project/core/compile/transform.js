function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value
    }
}

function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}

function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}


function createCallExpression(callee, arguments) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments
    }
}

function transformText(node, context) {
    if (node.type === 'Text') {
        // node.content = node.content.repeat(2)
        context.replacNode({
            type: 'Element',
            tag: 'span'
        })
    }
    // if (node.type !== 'TEXT') {
    //     return
    // }
    // node.jsNode = createStringLiteral(node.content)
}

function transformElemnet(node) {
    if (node.type === 'Element' && node.tag === 'p') {
        node.tag = 'h1'
    }
    // return () => {
    //     if (node.type !== 'Element') {
    //         return
    //     }

    //     const callExp = createCallExpression('h', [
    //         createStringLiteral(node.tag)
    //     ])
    //     node.children.length === 1 ?
    //         callExp.arguments.push(node.children[0].jsNode) :
    //         callExp.arguments.push(createCallExpression(node.children.map(c => c.jsNode)))
    //     node.jsNode = callExp
    // }
}

function transformRoot(node) {
    return () => {
        if (node.type !== 'Root') {
            return
        }
        const vnodeJSAST = node.children[0].jsNode
        node.jsNode = {
            type: 'FunctionDecl',
            id: {
                type: 'Identifier',
                name: 'render'
            },
            params: [],
            body: [{
                type: 'ReturnStatement',
                return: vnodeJSAST
            }]
        }
    }
}
let count = 0

function traverseNode(ast, context) {
    // const currentNode = ast
    context.currentNode = ast
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        count++
        transforms[i](context.currentNode, context)
    }
    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode
            context.childIndex = i
            traverseNode(children[i], context)
        }
    }
}

function transform(ast) {
    const context = {
        currentNode: null,
        childIndex: 0,
        parent: null,
        replacNode(node) {
            context.parent.children[context.childIndex] = node
            context.currentNode = node
        },
        nodeTransforms: [
            transformElemnet,
            transformText
        ]
    }
    traverseNode(ast, context)
    console.log(ast)
    dump(ast)
}