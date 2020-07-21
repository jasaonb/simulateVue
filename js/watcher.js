class Watcher {
    constructor(vm, key, cb) {
        //store the instance of vue 
        this.vm = vm
            //the key of the data
        this.key = key
            //the callback function which will be invoke within the update function
        this.cb = cb

        //When the watcher initial ,use the Dep static attribute to hold this instance 
        Dep.target = this
        this.oldValue = vm[key]
            //eventually assign null to the static attribute of Dep
        Dep.target = null
    }
    update() {
        let newValue = this.vm[this.key]
        if (this.oldValue === newValue) {
            return;
        }
        this.cb(newValue)
        this.oldValue = newValue
    }
}