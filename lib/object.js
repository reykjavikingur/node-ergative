const FunctionRepeater = require('./function');

class Repeater {

    constructor(target) {
        let transmissions = new Set();

        let functionRepeaterMap = {};
        for (let k in target) {
            if (target.hasOwnProperty(k)) {
                if (typeof target[k] === 'function') {
                    functionRepeaterMap[k] = new FunctionRepeater(target[k].bind(target));
                }
            }
        }

        let proxy = new Proxy(target, {
            get(target, property) {
                if (functionRepeaterMap.hasOwnProperty(property)) {
                    return functionRepeaterMap[property].proxy;
                }
                return target[property];
            },
            set(target, property, value, altReceiver) {
                if (functionRepeaterMap.hasOwnProperty(property)) {
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
                        if (typeof receiver[k] === 'function') {
                            if (functionRepeaterMap.hasOwnProperty(k)) {
                                let subtransmission = functionRepeaterMap[k].transmitter.transmit(receiver[k].bind(receiver));
                                subtransmissions.push(subtransmission);
                            }
                        }
                        else {
                            receiver[k] = proxy[k];
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

module.exports = Repeater;
