class Observer {
    constructor(data) {
        this.walk(data)
    }
    walk(data) {
        //check if the data is the objcet 
        if (!data || typeof data !== 'object') {
            return
        }
        //check all the attributes inside the data
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })
    }

    defineReactive(data, key, val) {
        let that = this
            //collect the dependcy
        let dep = new Dep()
        this.walk(val)
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                return val
            },
            set(newValue) {
                if (newValue === val) {
                    return
                }
                val = newValue
                that.walk(val)
                dep.notify()
            }
        })
    }
}