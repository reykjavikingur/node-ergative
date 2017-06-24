class ArrayRelay {

    constructor(target) {
        let proxy = new Proxy(target, {});
        this.proxy = proxy;
    }

}

module.exports = ArrayRelay;
