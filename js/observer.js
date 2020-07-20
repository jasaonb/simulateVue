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
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                return val
            },
            set(newValue) {
                if (newValue === val) {
                    return
                }
                val = newValue
            }
        })
    }
}