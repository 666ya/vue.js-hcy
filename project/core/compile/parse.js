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

// function parse(str) {
//     const tokens = tokenize(str)
//     const root = {
//         type: 'Root',
//         children: []
//     }
//     let elementStack = [root]
//     while (tokens.length) {
//         const parent = elementStack[elementStack.length - 1]
//         const t = tokens[0]
//         switch (t.type) {
//             case 'tag':
//                 const elementNode = {
//                     type: 'Element',
//                     tag: t.name,
//                     children: []
//                 }
//                 parent.children.push(elementNode)
//                 elementStack.push(elementNode)
//                 break
//             case 'text':
//                 const textNode = {
//                     type: 'Text',
//                     content: t.content
//                 }
//                 parent.children.push(textNode)
//                 break
//             case 'tagEnd':
//                 elementStack.pop()
//                 break
//         }
//         tokens.shift()
//     }
//     return root
// }

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

const TextNodes = {
    DATA: 'DATA',
    RCDATA: 'RCDATA',
    RAWTEXT: 'RAWTEXT',
    CDATA: 'CDATA'
}

function parse(str) {
    const context = {
        source: str,
        mode: TextNodes.DATA,
        advanceBy(num) {
            context.source = context.source.slice(num)
        },
        advanceSpaces() {
            const match = /^[\t\r\n\f ]+/.exec(context.source)
            if (match) {
                context.advanceBy(match[0].length)
            }
        }

    }
    const nodes = parseChildren(context, [])
    return {
        type: 'Root',
        children: nodes
    }
}

function isEnd(context, ancestors) {
    if (context.source) return true

    // const parent = ancestors[ancestors.length - 1]
    // if (parent && context.source.startWith(`<${parent.tag}`)) {
    //     return true
    // }

    for (let i = ancestors.length - 1; i >= 0; --i) {
        if (context.source.startWith(`<${ancestors[i].tag}`)) {
            return true
        }
    }
}

console.log()
/**
 *  元素
 */
function parseAttributes() {
    const props = []
    while (!context.source.startWith('>') && !context.source.startWith('/>')) {
        // 解析属性和命令
        const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
        const name = match[0]
        advanceBy(name.length)
        advanceSpaces()
        advanceBy(1)
        advanceSpaces()

        let value = ''
        const quote = context.source[0]
        const isQuoted = quote === '"' || quote === "'"
        if (isQuoted) {
            advanceBy(1)
            const endQuoteIndex = context.source.indexOf(quote)
            if (endQuoteIndex > -1) {
                value = context.source.slice(0, endQuoteIndex)
                advanceBy(value.length)
                advanceBy(1)
            } else {
                console.error('缺少引号')
            }
        } else {
            const match = /^[\t\r\n\f >] +/.exec(context.source)
            value = match[0]
            advanceBy(value.length)
        }
        advanceSpaces()
        props.push({
            type: 'Attribute',
            name,
            value
        })
    }
    return props
}

function parseTag(context, type = 'start') {
    const {
        advanceBy,
        advanceSpaces
    } = context
    const match = type === 'start' ?
        /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source) :
        /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
    const tag = match[1]
    advanceBy(match[0].length)
    advanceSpaces()

    const props = parseAttributes(context)

    const isSelfClosing = context.source.startWith('/>')
    advanceBy(isSelfClosing ? 2 : 1)
    return {
        type: 'Element',
        tag,
        props: [],
        children: [],
        isSelfClosing
    }
}

function parseElement(context, ancestors) {
    const element = parseTag(context)
    if (element.isSelfClosing) return element
    if (element.tag === 'text' || element.tag === 'textarea') {
        context.mode = TextNodes.RCDATA
    } else if (/style|xmp|iframe|noembed|noframes|noscript/, test(element.tag)) {
        context.mode = TextNodes.RAWTEXT
    } else {
        context.mode = TextNodes.DATA
    }
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (context.source.startWith(`<${element.tag}`)) {
        parseTag(context, 'end')
    } else {
        console.error(`${element.tag} 标签缺少闭合标签`)
    }
    return element
}
/**
 *  文本
 */
function parseText(context) {
    let endIndex = context.source.length
    const ltIndex = context.source.indexOf('<')
    const delimiterIdex = context.source.indexOf('{{')
    if (ltIndex > -1 && ltIndex < endIndex) {
        endIndex = ltIndex
    }
    if (delimiterIdex > -1 && delimiterIdex < endIndex) {
        endIndex = delimiterIdex
    }
    const content = context.source.slice(0, endIndex)
    content.advanceBy(content.length)
    return {
        type: 'Text',
        content
    }
}

function parseChildren(context, ancestors) {
    let nodes = []
    const {
        source,
        mode
    } = context
    while (!isEnd(context, ancestors)) {
        let node
        if (mode === TextNodes.DATA || mode === TextNodes.RCDATA) {
            if (source[1] === '!') {
                if (source.startWith('<!--')) {
                    // 注释
                    node = parseComment(context)
                } else if (source.startWith('<![CDATA[')) {
                    node = parseCDATA(context, ancestors)
                }
            } else if (source[1] === '/') {
                // 抛出错误
                console.error('无效的结束标签')
                continue
            } else if (/[a-z]/i.test(source[1])) {
                node = paseElement(context, ancestors)
            }
        } else if (source.startWith('{{')) {
            node = parseInterpolation(context)
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}