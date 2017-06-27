const ErgativeFunction = require('./function');

function isArrayIndex(property) {
    let n = parseInt(property);
    return !isNaN(n) && n === parseInt(n);
}

class ErgativeArray {

    constructor(target) {
        let transmissions = new Set();

        function emit(fn) {
            for (let transmission of transmissions) {
                try {
                    fn.call(transmission.receiver);
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
        }

        /*
         Array methods that mutate internal state
         copyWithin
         fill
         pop
         push
         reverse
         shift
         sort
         splice
         unshift
         */
        let methodNames = ['push', 'unshift', 'splice', 'pop', 'shift'];
        let methodMap = {};
        for (let methodName of methodNames) {
            methodMap[methodName] = new ErgativeFunction(target[methodName].bind(target));
        }

        let proxy = new Proxy(target, {
            get(target, property) {
                if (methodMap.hasOwnProperty(property)) {
                    return methodMap[property].proxy;
                }
                else if (property === 'length' || isArrayIndex(property)) {
                    return target[property];
                }
            },
            set(target, property, value, altReceiver) {
                if (isArrayIndex(property)) {
                    target[property] = value;
                    emit(function () {
                        this.splice(parseInt(property), 1, value);
                    });
                    return true;
                }
                else {
                    return false;
                }
            },
            deleteProperty(target, property) {
                if (isArrayIndex(property)) {
                    delete target[property];
                    emit(function () {
                        this.splice(parseInt(property), 1, undefined);
                    });
                }
            }
        });

        methodMap.push.transmitter.transmit((...values) => {
            emit(function () {
                this.splice(proxy.length - values.length, 0, ...values);
            });
        });
        methodMap.unshift.transmitter.transmit((...values) => {
            emit(function () {
                this.splice(0, 0, ...values);
            });
        });
        methodMap.splice.transmitter.transmit((startIndex, deleteCount, ...values) => {
            emit(function () {
                this.splice(startIndex, deleteCount, ...values);
            });
        });
        methodMap.pop.transmitter.transmit(() => {
            emit(function () {
                this.splice(proxy.length, 1);
            });
        });
        methodMap.shift.transmitter.transmit(() => {
            emit(function () {
                this.splice(0, 1);
            });
        });

        let transmitter = {
            transmit(receiver) {
                receiver.splice(0, 0, ...target);
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

module.exports = ErgativeArray;
