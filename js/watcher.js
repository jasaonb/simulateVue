class Watcher {
    constructor(vm, key, cb, isArray = false, arrayKey = null, index = -1) {
        //store the instance of vue 
        this.vm = vm
            //the key of the data
        this.key = key
            //the callback function which will be invoke within the update function
        this.cb = cb
            //When the watcher initial ,use the Dep static attribute to hold this instance 
        Dep.target = this
        if (!isArray)
            this.oldValue = vm[key]
        else {
            this.oldValue = key()
        }
        this.arrayKey = arrayKey
        this.index = index
            //eventually assign null to the static attribute of Dep
        Dep.target = null
    }
    update() {
        let newValue = null
        if (!this.arrayKey)
            newValue = this.vm[this.key]
        else
            newValue = this.vm[this.arrayKey][this.index]
        if (this.oldValue === newValue) {
            return
        }
        if (!this.arrayKey)
            this.cb(newValue)
        else
            this.cb(this.vm[this.arrayKey])
        this.oldValue = newValue
    }
}