class FGExpression {
    constructor() {
        this.has = false
        this.key = null
        this.node = null
    }
    reset() {
        this.has = false
        this.key = null
    }
}

class FGForInfo {
    constructor() {
        this.first = true
        this.key = null
        this.node = null
        this.parent = null
        this.realKey = null
        this.previous = null
        this.last = null
        this.oldNode = null
        this.item = ""
    }
}


class Compiler {
    constructor(vm) {
        this.el = vm.$el
        this.vm = vm
        this.ifExpression = new FGExpression()
        this.forExpression = new FGExpression()
        this.forStack = []
        this.currentItem = null
        this.currentIndex = -1
        this.item = ''
        this.index = ''
        this.forNode = []
        this.skip = false
        this.currentItems = {}
        this.compile(this.el)

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
    reset() {
            if (this.ifExpression.has)
                this.ifExpression.reset()
            if (this.forExpression.has) {
                this.forExpression.reset()
                this.item = ''
                this.index = ''
                this.currentItem = null
                this.currentIndex = -1

            }
        }
        //compile the template handle with either element or text node
    compile(el) {
        let chlidNode = el.childNodes
        let arrays = Array.from(chlidNode)
        for (let i = 0; i < arrays.length; i++) {
            let node = arrays[i]
            if (this.isTextNode(node)) {
                this.compileTextNode(node)
            } else if (this.isElement(node)) {
                this.compileElement(node)
            }
            if (this.forExpression.node === node) {
                i++
                continue
            }
            //if the current element has the child node 
            if (this.forExpression.node !== node && node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        }
        Array.from(chlidNode).forEach(node => {

        })


    }

    //compile the element and handle with the instrument 
    compileElement(node) {
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
        if (this.ifExpression.has) {
            condition = this.ifExpression.key
        }
        if (this.forExpression.has) {
            if (this.forExpression.node !== node) {
                return
            }
            let t = new FGForInfo()
            t.key = this.forExpression.key
            t.node = this.forExpression.node
            t.parent = t.node.parentNode
            this.forNode.push(t)
            let that = this
            this.forStack.push(t)
            if (t.first) {
                let newNode = t.node.cloneNode(true)
                newNode.removeAttribute("v-for")
                t.oldNode = t.node
                t.previous = t.node.previousElementSibling
                t.last = t.node.nextElementSibling
                t.parent.removeChild(t.node)
                t.node = newNode
            }
            that.compileForExpression(t, null)
            this.skip = true
            new Watcher(this.vm, t.realKey, (newValue) => {
                //if has the original node 
                that.setForExpression(t.node, t.key)
                if (t.previous === null && t.last === null) {
                    t.parent.innerHTML = ""
                } else if (t.previous === null) {
                    let delNode = t.parent.firstElementChild
                    for (; delNode != t.last;) {
                        let tmp = delNode.nextElementSibling
                        t.parent.removeChild(delNode)
                        delNode = tmp
                    }
                }

                that.compileForExpression(t, newValue)
            })
        }
    }
    compileForExpression(forInfo, newValue) {
        let expression = forInfo.key
        let reg = /\((.+?)\) in (.+)$/
        if (reg.test(expression)) {
            let forward = RegExp.$1.trim()
            let arraysKey = RegExp.$2.trim()
            let a = forward.split(',')

            if (!forInfo.realKey) { forInfo.realKey = arraysKey }
            //check the array key has the correct 
            arraysKey = arraysKey.split('.')
            let lastArray = this.currentItems[arraysKey[0]]
            if (arraysKey.length > 0) {
                let isCorrect = true
                for (let i = 1; i < arraysKey.length - 1; i++) {
                    lastArray = lastArray[arraysKey[i]]
                    if (!lastArray) {
                        isCorrect = true
                        break
                    }
                }
                if (!isCorrect) {
                    throw arraysKey[0] + "is not defined"
                } else {
                    arraysKey = arraysKey[arraysKey.length - 1]
                }
            } else {
                arraysKey = arraysKey[0]
            }

            if (!lastArray) {
                lastArray = this.vm
            }
            let tmpNewValue = newValue ? newValue : lastArray[arraysKey]
            let lastNode = forInfo.last
            let item = a[0]
            this.index = a[1]

            if (a.length > 1) {
                if (this.item === this.index) {
                    throw "v-for item and index alias can not be same "
                }
            }

            if (Array.isArray(tmpNewValue)) {
                for (let i = 0; i < tmpNewValue.length; i++) {
                    if (!tmpNewValue['index' + i]) {
                        new Watcher(this.vm, () => { tmpNewValue[i] }, (newValue) => {
                            //if has the original node 
                            this.setForExpression(forInfo.node, forInfo.key)
                            if (forInfo.previous === null && forInfo.last === null) {
                                forInfo.parent.innerHTML = ""
                            } else if (forInfo.previous === null) {
                                let delNode = forInfo.parent.firstElementChild
                                for (; delNode != forInfo.last;) {
                                    let tmp = delNode.nextElementSibling
                                    forInfo.parent.removeChild(delNode)
                                    delNode = tmp
                                }
                            }

                            this.compileForExpression(forInfo, newValue)
                        }, true, forInfo.realKey, i)
                    }
                    this.item = item
                    this.currentItem = tmpNewValue[i]
                    this.currentIndex = i
                    this.currentItems[this.item] = this.currentItem
                    let tNewNode = forInfo.node.cloneNode(true)
                    if (lastNode !== null)
                        forInfo.parent.insertBefore(tNewNode, forInfo.last)
                    else {
                        forInfo.parent.appendChild(tNewNode)
                    }
                    this.compile(tNewNode)
                }

                if (this.forStack.pop() == forInfo) {
                    if (this.forStack.length) {
                        let tmp = this.forStack[this.forStack.length - 1]
                        this.setForExpression(tmp.oldNode, tmp.key)
                        this.item = tmp.item
                    } else {
                        this.reset()
                        this.currentItems = {}
                    }
                }
                forInfo.first = false
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
        console.log(value)
        if (this.forStack.length > 0) {
            if (reg.test(value)) {
                let key = RegExp.$1.trim()
                let find = false

                for (let k in this.currentItems) {
                    if (key.includes(k)) {
                        find = true
                        break;
                    }
                }
                if (find) {
                    key = key.split('.')
                    if (key.length > 1) {
                        if (this.currentItems[key[0]]) {
                            let newValue = this.currentItems[key[0]]

                            for (let i = 1; i < key.length; i++) {
                                newValue = newValue[key[i]]
                                if (!newValue) {
                                    break
                                }
                            }
                            if (newValue) {
                                node.textContent = value.replace(reg, newValue)
                            }
                        } else {
                            throw "item alias " + key[0] + ' is undefined'
                        }
                    } else {
                        if (this.item === key[0]) {
                            node.textContent = value.replace(reg, this.currentItem)
                        }
                    }
                } else {
                    throw key + "has some error"
                }
            }
        } else {

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