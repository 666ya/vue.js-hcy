const State = {
    inital: 1,
    tagOpen: 2,
    tagName: 3,
    text: 4,
    tagEnd: 5, //结束标签状态
    tagEndName: 6 // 结束标签名称状态
}

function isAlpha(char) {
    return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function tokenize(str) {
    const tokens = []
    const chars = []

    let curState = State.inital
    while (str) {
        const char = str[0]
        switch (curState) {
            case State.inital:
                if (char === '<') {
                    curState = State.tagOpen
                    str = str.slice(1)
                } else if (isAlpha(char)) {
                    curState = State.text
                    str = str.slice(1)
                    chars.push(char)
                }
                break;
            case State.tagOpen:
                if (isAlpha(char)) {
                    curState = State.tagName
                    str = str.slice(1)
                    chars.push(char)
                } else if (char === '/') {
                    curState = State.tagEnd
                    str = str.slice(1)
                }
                break;
            case State.tagName:
                if (isAlpha(char)) {
                    chars.push(char)
                    str = str.slice(1)
                } else if (char === '>') {
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    })
                    chars.length = 0
                    curState = State.inital
                    str = str.slice(1)
                }
                break
            case State.text:
                if (isAlpha(char)) {
                    chars.push(char)
                    str = str.slice(1)
                } else if (char === '<') {
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    })
                    chars.length = 0
                    curState = State.tagOpen
                    str = str.slice(1)
                }
                break
            case State.tagEnd:
                if (isAlpha(char)) {
                    curState = State.tagEndName
                    chars.push(char)
                    str = str.slice(1)
                }
                break
            case State.tagEndName:
                if (isAlpha(char)) {
                    chars.push(char)
                    str = str.slice(1)
                } else if (char === '>') {
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    })
                    chars.length = 0
                    curState = State.inital
                    str = str.slice(1)
                }
                break
        }
    }
    return tokens
}

function parse(str) {
    const tokens = tokenize(str)
    const root = {
        type: 'Root',
        children: []
    }
    let elementStack = [root]
    while (tokens.length) {
        const parent = elementStack[elementStack.length - 1]
        const t = tokens[0]
        switch (t.type) {
            case 'tag':
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children: []
                }
                parent.children.push(elementNode)
                elementStack.push(elementNode)
                break
            case 'text':
                const textNode = {
                    type: 'Text',
                    content: t.content
                }
                parent.children.push(textNode)
                break
            case 'tagEnd':
                elementStack.pop()
                break
        }
        tokens.shift()
    }
    return root
}

function dump(node, indent = 0) {
    const type = node.type
    const desc = node.type === 'Root' ?
        '' :
        node.type === 'Element' ?
        node.tag :
        node.content
    console.log(`${'-'.repeat(indent)}${type}：${desc}`)
    if (node.children) {
        node.children.forEach(n => dump(n, indent + 2));
    }
}