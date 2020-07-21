class Dep {
    constructor() {
            //store all the observers
            this.subs = []
        }
        //add the observer
    addSub(obj) {
        if (obj && obj.update) {
            this.subs.push(obj)
        }
    }
    notify() {
        this.subs.forEach(obj => {
            obj.update()
        })
    }
}