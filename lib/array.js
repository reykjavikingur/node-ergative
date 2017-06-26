const ErgativeFunction = require('./function');

function isArrayIndex(property) {
    let n = parseInt(property);
    return !isNaN(n) && n === parseInt(n);
}

class ErgativeArray {

    constructor(target) {
        let transmissions = new Set();

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
                console.error('cannot set elements directly within ergative array');
                return false;
            },
            deleteProperty(target, property) {
                throw new Error('cannot delete directly from ergative array');
            }
        });

        methodMap.push.transmitter.transmit(function(value) {
            for (let transmission of transmissions) {
                transmission.receiver.splice(proxy.length - 1, 0, value);
            }
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
