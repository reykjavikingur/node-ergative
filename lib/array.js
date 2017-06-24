class ErgativeArray {

    constructor(target) {
        let proxy = new Proxy(target, {});
        this.proxy = proxy;
    }

}

module.exports = ErgativeArray;
