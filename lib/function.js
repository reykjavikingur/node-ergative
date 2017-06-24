class ErgativeFunction {

    constructor(target, targetContext) {
        let transmissions = new Set();
        let proxy = new Proxy(target, {
            apply(target, proxyContext, args) {
                let rv = target.apply(targetContext || proxyContext, args);
                for (let transmission of transmissions) {
                    try {
                        transmission.receiver.apply(targetContext, args);
                    }
                    catch (e) {
                        if (transmission.errback) {
                            try {
                                transmission.errback(e);
                            }
                            catch (eh) {
                                console.error(eh);
                            }
                        }
                    }
                }
                return rv;
            }
        });
        let transmitter = {
            transmit(receiver) {
                let transmission = {
                    receiver: receiver,
                    close() {
                        transmissions.delete(this);
                    },
                    catch(errback) {
                        this.errback = errback;
                        return this;
                    }
                };
                transmissions.add(transmission);
                return transmission;
            }
        };
        this.proxy = proxy;
        this.transmitter = transmitter;
    }

}

module.exports = ErgativeFunction;
