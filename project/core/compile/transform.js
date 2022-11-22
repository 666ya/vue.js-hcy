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
    // if (node.type === 'Text') {
    //     // node.content = node.content.repeat(2)
    //     context.replacNode({
    //         type: 'Element',
    //         tag: 'span'
    //     })
    // }
    if (node.type !== 'Text') {
        return
    }
    node.jsNode = createStringLiteral(node.content)
}

function transformElemnet(node) {
    // if (node.type === 'Element' && node.tag === 'p') {
    //     node.tag = 'h1'
    // }
    return () => {
        if (node.type !== 'Element') {
            return
        }

        const callExp = createCallExpression('h', [
            createStringLiteral(node.tag)
        ])
        node.children.length === 1 ?
            callExp.arguments.push(node.children[0].jsNode) :
            callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)))
        node.jsNode = callExp
    }
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
    const existFns = []
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        const exisFn = transforms[i](context.currentNode, context)
        if (exisFn) {
            existFns.push(exisFn)
        }
    }
    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode
            context.childIndex = i
            traverseNode(children[i], context)
        }
    }
    let i = existFns.length
    while (i--) {
        existFns[i]()
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
        removeNode() {
            if (context.parent) {
                context.parent.children.splice(context.childIndex, 1)
                context.currentNode = null
            }
        },
        nodeTransforms: [
            transformRoot,
            transformElemnet,
            transformText
        ]
    }
    traverseNode(ast, context)
}




const FunctionDeclNodde = {
    type: 'FunctionDecl',
    id: {
        type: 'Identifier',
        name: 'render'
    },
    params: [],
    body: [{
        type: 'statement',
        return: null
    }]
}