class FGExpression {
    constructor() {
        this.has = false
        this.key = null
        this.node = null
    }
    reset() {
        this.has = false
        this.key = null
        this.node = null
    }
}


class Compiler {
    constructor(vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
        this.ifExpression = new FGExpression()
        this.forExpression = new FGExpression()
        console.log(this.ifExpression)
    }
    setIfExpression(key) {
        this.ifExpression.has = true
        this.ifExpression.key = key
    }
    setForExpression(node, key) {
        this.forExpression.has = true
        this.forExpression.key = key
        this.forExpression.node = node
    }
    fgReset() {
            if (this.ifExpression.has)
                this.ifExpression.reset()
            if (this.forExpression.has)
                this.forExpression.reset()
        }
        //compile the template handle with either element or text node
    compile(el) {
        let chlidNode = el.childNodes
        Array.from(chlidNode).forEach(node => {
            if (this.isTextNode(node)) {
                this.compileTextNode(node)
            } else if (this.isElement(node)) {
                this.compileElement(node)
            }
            //if the current element has the child node 
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })


    }

    //compile the element and handle with the instrument 
    compileElement(node) {
        this.fgReset()
        Array.from(node.attributes).forEach(attr => {
                let attrName = attr.name
                if (this.isDirective(attrName)) {
                    attrName = attrName.substr(2)
                    let key = attr.value

                    this.compileUpdater(node, key, attrName)
                }
            })
            //because the for is evetually run so run the if 
        let condition = ''
        if (this.ifExpression) {
            condition = this.ifExpression.fn(this.ifExpression.key)
        }
        if (this.forExpression) {
            let expression = this.forExpression.fn(this.forExpression.key)
            let reg = /for \((.+?)\) in (.+?)/
            if (reg.test(expression)) {
                console.log(RegExp.$1.trim())
                console.log(RegExp.$2.trim())
            }
        }
    }
    compileUpdater(node, key, attrName) {
        let updaterFn = this[attrName + 'Updater']
        if (attrName !== 'if' && attrName !== 'for')
            updaterFn && updaterFn.call(this, node, key, this.vm[key])
        else
            updaterFn && updaterFn.call(this, node, key)
    }


    textUpdater(node, key, value) {
        node.textContent = value
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }
    modelUpdater(node, key, value) {
        node.textContent = value
    }
    ifUpdater(node, key) {
        this.setIfExpression(key)
    }
    forUpdater(node, key) {
        this.setForExpression(node, key)
    }

    compileTextNode(node) {
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        if (reg.test(value)) {
            let key = RegExp.$1.trim()
            if (!this.vm[key] && typeof this.vm[key] !== 'number') {
                throw "{{" + key + "}} is undefined"
            }
            node.textContent = value.replace(reg, this.vm[key])
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = value.replace(reg, newValue)
            })
        }
    }

    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    isTextNode(node) {
        return node.nodeType === 3
    }
    isElement(node) {
        return node.nodeType === 1
    }
}