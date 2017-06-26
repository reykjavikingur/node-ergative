const ErgativeFunction = require('./function');

function isArrayIndex(property) {
    let n = parseInt(property);
    return !isNaN(n) && n === parseInt(n);
}

class ErgativeArray {

    constructor(target) {
        let transmissions = new Set();

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
        function emit(fn) {
            for (let transmission of transmissions) {
                fn(transmission.receiver);
            }
        }

        let methodNames = ['push'];
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
                    emit(receiver => {
                        receiver.splice(parseInt(property), 1, value);
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
                    emit(receiver => {
                        receiver.splice(parseInt(property), 1, undefined);
                    });
                }
            }
        });

        methodMap.push.transmitter.transmit(function (value) {
            emit(receiver => {
                receiver.splice(proxy.length - 1, 0, value);
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
