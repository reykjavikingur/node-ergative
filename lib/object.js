const ErgativeFunction = require('./function');
const ErgativeArray = require('./array');

class ErgativeObject {

    constructor(target) {
        let transmissions = new Set();

        let functionMap = {};
        let objectMap = {};
        let arrayMap = {};
        for (let k in target) {
            if (target.hasOwnProperty(k)) {
                if (target[k] instanceof Function) {
                    functionMap[k] = new ErgativeFunction(target[k].bind(target));
                }
                else if (target[k] instanceof Array) {
                    arrayMap[k] = new ErgativeArray(target[k]);
                }
                else if (target[k] instanceof Object) {
                    objectMap[k] = new ErgativeObject(target[k]);
                }
            }
        }

        let proxy = new Proxy(target, {
            get(target, property) {
                if (functionMap.hasOwnProperty(property)) {
                    return functionMap[property].proxy;
                }
                else if (arrayMap.hasOwnProperty(property)) {
                    return arrayMap[property].proxy;
                }
                else if (objectMap.hasOwnProperty(property)) {
                    return objectMap[property].proxy;
                }
                else {
                    return target[property];
                }
            },
            set(target, property, value, altReceiver) {
                if (functionMap.hasOwnProperty(property) || objectMap.hasOwnProperty(property) || arrayMap.hasOwnProperty(property)) {
                    throw new Error('unable to overwrite immutable property');
                }
                target[property] = value;
                for (let transmission of transmissions) {
                    if (transmission.receiver.hasOwnProperty(property)) {
                        try {
                            transmission.receiver[property] = value;
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
                return true;
            },
            deleteProperty(target, property) {
                delete target[property];
                for (let transmission of transmissions) {
                    if (transmission.receiver.hasOwnProperty(property)) {
                        transmission.receiver[property] = undefined;
                    }
                }
            }
        });

        let transmitter = {
            transmit(receiver) {
                let subtransmissions = [];
                for (let k in receiver) {
                    if (receiver.hasOwnProperty(k)) {
                        let subtransmission;
                        if (functionMap.hasOwnProperty(k)) {
                            if (receiver[k] instanceof Function) {
                                subtransmission = functionMap[k].transmitter.transmit(receiver[k].bind(receiver));
                            }
                        }
                        else if (objectMap.hasOwnProperty(k)) {
                            subtransmission = objectMap[k].transmitter.transmit(receiver[k]);
                        }
                        else if (arrayMap.hasOwnProperty(k)) {
                            subtransmission = arrayMap[k].transmitter.transmit(receiver[k]);
                        }
                        else {
                            receiver[k] = proxy[k];
                        }
                        if (subtransmission) {
                            subtransmissions.push(subtransmission);
                        }
                    }
                }
                let transmission = {
                    receiver: receiver,
                    close() {
                        transmissions.delete(this);
                        for (let subtransmission of subtransmissions) {
                            subtransmission.close();
                        }
                    },
                    catch(errback) {
                        this.errback = errback;
                        for (let subtransmission of subtransmissions) {
                            subtransmission.catch(errback);
                        }
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

module.exports = ErgativeObject;
