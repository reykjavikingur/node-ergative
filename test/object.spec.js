const ErgativeObject = require('../lib/object');
const should = require('should');
const sinon = require('sinon');
require('should-sinon');

describe('Ergative.Object', () => {

    it('should be defined', () => {
        should(ErgativeObject).be.ok();
    });

    describe('instance with target having initial property value', () => {
        var target, instance, value;
        beforeEach(() => {
            value = 87;
            target = {
                foo: value
            };
            instance = new ErgativeObject(target);
        });
        describe('deleting property on proxy', () => {
            beforeEach(() => {
                // sanity test
                should(target.hasOwnProperty('foo')).be.ok();
                delete instance.proxy.foo;
            });
            it('should delete property on target', () => {
                should(target.hasOwnProperty('foo')).not.be.ok();
            });
        });
        describe('when beginning to transmit', () => {
            var receiver, receiverSpy;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    set foo(value) {
                        receiverSpy(value);
                    }
                };
                instance.transmitter.transmit(receiver);
            });
            it('should call receiver spy', () => {
                should(receiverSpy).be.calledWith(value);
            });
        });
        describe('transmitting to receiver wrongly expecting method', () => {
            var presumptuousMethod, receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    foo() {
                        receiverSpy.apply(this, arguments);
                    }
                };
                presumptuousMethod = receiver.foo;
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not call receiver', () => {
                should(receiverSpy).not.be.called();
            });
            describe('changing property', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.foo = 200;
                });
                it('should not call receiver', () => {
                    should(receiverSpy).not.be.called();
                });
            });
        });
        describe('transmitting to receiver with conditionally faulty setter', () => {
            var invalidValue, receiverError, receiverSpy, receiver, transmission;
            beforeEach(() => {
                invalidValue = 10;
                receiverError = new Error('fake setter error');
                receiverSpy = sinon.spy();
                receiver = {
                    set foo(value) {
                        receiverSpy.apply(this, arguments);
                        if (value === invalidValue) {
                            throw receiverError;
                        }
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should call receiver setter', () => {
                should(receiverSpy).be.calledWith(value);
            });
            describe('when setting property on proxy', () => {
                var nextValue;
                beforeEach(() => {
                    nextValue = invalidValue;
                    receiverSpy.reset();
                    instance.proxy.foo = nextValue;
                });
                it('should call receiver setter', () => {
                    should(receiverSpy).be.calledWith(nextValue);
                });
            });
        });
        describe('transmitting to receiver with conditionally faulty setter and catching', () => {
            var invalidValue, receiverError, receiverSpy, catcherSpy, catcher, receiver, transmission;
            beforeEach(() => {
                invalidValue = 10;
                should(invalidValue).not.eql(value);
                receiverError = new Error('fake setter error');
                receiverSpy = sinon.spy();
                receiver = {
                    set foo(value) {
                        receiverSpy.apply(this, arguments);
                        if (value === invalidValue) {
                            throw receiverError;
                        }
                    }
                };
                catcherSpy = sinon.spy();
                catcher = function () {
                    catcherSpy.apply(this, arguments);
                };
                transmission = instance.transmitter.transmit(receiver).catch(catcher);
            });
            it('should call receiver setter', () => {
                should(receiverSpy).be.calledWith(value);
            });
            describe('when setting property on proxy', () => {
                beforeEach(() => {
                    catcherSpy.reset();
                    receiverSpy.reset();
                    instance.proxy.foo = invalidValue;
                });
                it('should call catcher', () => {
                    should(catcherSpy).be.called();
                });
            });
        });
        describe('transmitting to receiver with totally faulty setter and catching', () => {
            var receiverError, receiverSpy, catcherSpy, catcher, receiver, transmission;
            beforeEach(() => {
                receiverError = new Error('fake setter error');
                receiverSpy = sinon.spy();
                receiver = {
                    set foo(value) {
                        receiverSpy.apply(this, arguments);
                        throw receiverError;
                    }
                };
                catcherSpy = sinon.spy();
                catcher = function () {
                    catcherSpy.apply(this, arguments);
                };

            });
            it('should call receiver setter', () => {
                let f = function () {
                    instance.transmitter.transmit(receiver).catch(catcher);
                };
                should(f).throw();
            });

        });

    });

    describe('instance with target having method', () => {
        var targetSpy, target, instance;
        beforeEach(() => {
            targetSpy = sinon.spy();
            target = {
                make: function () {
                    targetSpy.apply(this, arguments);
                }
            };
            instance = new ErgativeObject(target);
        });
        it('should not yet have called the spy', () => {
            should(targetSpy).not.be.called();
        });
        it('should throw error when trying to overwrite method on proxy', () => {
            let f = function () {
                instance.proxy.make = function () {
                    console.log('do something else');
                };
            };
            should(f).throw();
        });
        describe('when calling method on proxy', () => {
            beforeEach(() => {
                instance.proxy.make();
            });
            it('should call spy', () => {
                should(targetSpy).be.called();
            });
            it('should call spy on correct context', () => {
                should(targetSpy).be.calledOn(target);
            });
        });
        describe('transmitting', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    make: function () {
                        receiverSpy.apply(this, arguments);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not yet have called the spy', () => {
                should(receiverSpy).not.be.called();
            });
            describe('when calling method on proxy', () => {
                beforeEach(() => {
                    instance.proxy.make();
                });
                it('should call spy', () => {
                    should(receiverSpy).be.called();
                });
                it('should call spy on receiver', () => {
                    should(receiverSpy).be.calledOn(receiver);
                });
            });
            describe('when closing transmission', () => {
                beforeEach(() => {
                    transmission.close();
                });
                describe('when calling method on proxy', () => {
                    beforeEach(() => {
                        instance.proxy.make();
                    });
                    it('should not call spy', () => {
                        should(receiverSpy).not.be.called();
                    });
                });
            });
        });
        describe('plucking method from transmitter', () => {
            var subTransmitter;
            beforeEach(() => {
                subTransmitter = instance.transmitter.pluck('make');
            });
            it('should return something', () => {
                should(subTransmitter).be.ok();
            });
            describe('transmitting', () => {
                var receiverSpy, subTransmission;
                beforeEach(() => {
                    receiverSpy = sinon.spy();
                    subTransmission = subTransmitter.transmit(function () {
                        receiverSpy.apply(this, arguments);
                    });
                });
                it('should return transmission', () => {
                    should(subTransmission).be.ok();
                });
                it('should not yet call receiver', () => {
                    should(receiverSpy).not.be.called();
                });
                describe('calling proxy method', () => {
                    beforeEach(() => {
                        instance.proxy.make();
                    });
                    it('should call receiver', () => {
                        should(receiverSpy).be.called();
                    });
                });
            });
        });
        describe('transmitting to receiver with setter instead of regular method', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    set make(value) {
                        receiverSpy.apply(this, arguments);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not call receiver', () => {
                should(receiverSpy).not.be.called();
            });
        });
        describe('transmitting to receiver with method that throws error', () => {
            var receiverSpy, receiverError, receiver, transmission;
            beforeEach(() => {
                receiverError = new Error('fake error');
                receiverSpy = sinon.spy();
                receiver = {
                    make: function () {
                        receiverSpy.apply(this, arguments);
                        throw receiverError;
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            describe('when calling method on proxy', () => {
                beforeEach(() => {
                    instance.proxy.make();
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
            });
        });
        describe('transmitting to receiver with faulty method and catching', () => {
            var receiverSpy, receiverError, catcherSpy, catcher, receiver, transmission;
            beforeEach(() => {
                receiverError = new Error('fake error');
                receiverSpy = sinon.spy();
                catcherSpy = sinon.spy();
                receiver = {
                    make: function () {
                        receiverSpy.apply(this, arguments);
                        throw receiverError;
                    }
                };
                catcher = function () {
                    catcherSpy.apply(this, arguments);
                };
                transmission = instance.transmitter.transmit(receiver).catch(catcher);
            });
            describe('when calling method on proxy', () => {
                beforeEach(() => {
                    instance.proxy.make();
                });
                it('should call catcher', () => {
                    should(catcherSpy).be.calledWith(receiverError);
                });
            });
        });

    });

    describe('instance with empty object as target', () => {

        var target, instance;

        beforeEach(() => {
            target = {};
            instance = new ErgativeObject(target);
        });

        it('should have proxy', () => {
            should(instance.proxy).be.ok();
        });

        describe('transmitter', () => {
            var transmitter;
            beforeEach(() => {
                transmitter = instance.transmitter;
            });
            it('should exist', () => {
                should(transmitter).be.ok();
            });
            it('should be able to transmit', () => {
                should(transmitter.transmit).be.a.Function();
            });
        });

        describe('receiver for property', () => {

            var receiver, receiveValue, transmission;

            beforeEach(() => {
                receiveValue = sinon.spy();
                receiver = {
                    set foo(value) {
                        receiveValue(value);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });

            it('should return transmission', () => {
                should(transmission).be.ok();
            });

            describe('when setting property', () => {
                var value;
                beforeEach(() => {
                    value = 5;
                    instance.proxy.foo = value;
                });
                it('should receive value', () => {
                    should(receiveValue).be.calledWith(value);
                });
                it('should set property in proxy', () => {
                    should(instance.proxy.foo).eql(value);
                });

                describe('when ending transmission', () => {
                    beforeEach(() => {
                        transmission.close();
                    });

                    describe('when setting property', () => {
                        var lateValue;
                        beforeEach(() => {
                            lateValue = 6;
                            should(lateValue).not.eql(value);
                            instance.proxy.foo = lateValue;
                        });
                        it('should not receive value', () => {
                            should(receiveValue).be.calledWith(value);
                        });
                    });
                });

                describe('when deleting property', () => {
                    beforeEach(() => {
                        receiveValue.reset();
                        delete instance.proxy.foo;
                    });
                    it('should receive undefined', () => {
                        should(receiveValue).be.calledWith(undefined);
                    });
                });

            });

        });

    });

    describe('instance with target having nested structure', () => {
        var target, instance;
        beforeEach(() => {
            target = {
                status: 'available',
                user: {
                    id: 777,
                    name: 'Gmarque'
                }
            };
            instance = new ErgativeObject(target);
        });
        describe('changing nesting value', () => {
            var attempt;
            beforeEach(() => {
                attempt = () => {
                    instance.proxy.user = {
                        id: 666,
                        name: 'Narc'
                    };
                };
            });
            it('should not work', () => {
                should(attempt).throw();
            });
        });
        describe('proxy', () => {
            it('should have correct nested value', () => {
                should(instance.proxy.user).eql({
                    id: 777,
                    name: 'Gmarque'
                });
            });
            describe('changing nested value', () => {
                beforeEach(() => {
                    instance.proxy.user.name = 'Blark';
                });
                it('should change target', () => {
                    should(target.user.name).eql('Blark');
                });
            });
        });
        describe('transmitting to setter', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    set user(value) {
                        receiverSpy.apply(this, arguments);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not call receiver', () => {
                should(receiverSpy).not.be.called();
            });
        });
        describe('transmitting to nested property', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    user: {
                        set name(value) {
                            receiverSpy.apply(this, arguments);
                        }
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should call receiver', () => {
                should(receiverSpy).be.calledWith('Gmarque');
            });
            describe('changing nested property', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.user.name = 'Maark';
                });
                it('should change target', () => {
                    should(target.user.name).eql('Maark');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith('Maark');
                });
            });
            describe('closing transmission', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    transmission.close();
                });
                describe('changing nested property', () => {
                    beforeEach(() => {
                        receiverSpy.reset();
                        instance.proxy.user.name = 'Maark';
                    });
                    it('should change target', () => {
                        should(target.user.name).eql('Maark');
                    });
                    it('should not call receiver', () => {
                        should(receiverSpy).not.be.called();
                    });
                });
            });
        });
        describe('plucking from transmitter', () => {
            var subTransmitter;
            beforeEach(() => {
                subTransmitter = instance.transmitter.pluck('user');
            });
            it('should return sub-transmitter', () => {
                should(subTransmitter).be.ok();
            });
            it('should be able to create sub-transmissions', () => {
                should(subTransmitter.transmit).be.a.Function();
            });
        });
    });

    describe('instance with target having nested object with method', () => {
        var targetSpy, target, instance;
        beforeEach(() => {
            targetSpy = sinon.spy();
            target = {
                message: {
                    send() {
                        targetSpy.apply(this, arguments);
                    }
                }
            };
            instance = new ErgativeObject(target);
        });
        it('should not call target', () => {
            should(targetSpy).not.be.called();
        });
        describe('calling nested method through proxy', () => {
            beforeEach(() => {
                targetSpy.reset();
                instance.proxy.message.send();
            });
            it('should call target', () => {
                should(targetSpy).be.called();
            });
        });
        describe('transmitting', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    message: {
                        send() {
                            receiverSpy.apply(this, arguments);
                        }
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not call receiver', () => {
                should(receiverSpy).not.be.called();
            });
            describe('calling nested method through proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.message.send();
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
                it('should call receiver on correct context', () => {
                    should(receiverSpy).be.calledOn(receiver.message);
                });
            });
            describe('calling nested method with argument through proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.message.send('hi');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
                it('should call receiver with correct arguments', () => {
                    should(receiverSpy).be.calledWith('hi');
                });
            });
            describe('closing', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    transmission.close();
                    instance.proxy.message.send();
                });
                it('should not call receiver', () => {
                    should(receiverSpy).not.be.called();
                });
            });
        });
    });

    describe('instance with target having array property', () => {
        var target, instance;
        beforeEach(() => {
            target = {
                name: 'stuff',
                items: ['a', 'b']
            };
            instance = new ErgativeObject(target);
        });
        describe('proxy', () => {
            it('should have same array property as target', () => {
                should(instance.proxy.items.length).eql(2);
                should(instance.proxy.items[0]).eql('a');
                should(instance.proxy.items[1]).eql('b');
            });
            describe('changing array property', () => {
                var attempt;
                beforeEach(() => {
                    attempt = () => {
                        instance.proxy.items = ['x', 'q'];
                    };
                });
                it('should throw error', () => {
                    should(attempt).throw();
                });
                it('should not work', () => {
                    should(instance.proxy.items.length).eql(2);
                    should(instance.proxy.items[0]).eql('a');
                    should(instance.proxy.items[1]).eql('b');
                });
            });
            describe('adding item', () => {
                beforeEach(() => {
                    instance.proxy.items.push('c');
                });
                it('should update target', () => {
                    should(target.items).eql(['a', 'b', 'c']);
                });
            });
            describe('transmitting', () => {
                var receiverSpy, receiver, transmission;
                beforeEach(() => {
                    receiverSpy = sinon.spy();
                    receiver = {
                        items: {
                            splice() {
                                receiverSpy.apply(this, arguments);
                            }
                        }
                    };
                    transmission = instance.transmitter.transmit(receiver);
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'a', 'b');
                });
                describe('adding item via proxy', () => {
                    beforeEach(() => {
                        receiverSpy.reset();
                        instance.proxy.items.push('d');
                    });
                    it('should call receiver', () => {
                        should(receiverSpy).be.calledWith(2, 0, 'd');
                    });
                });
            });
        });
        describe('transmitter', () => {
            describe('plucking array', () => {
                var subTransmitter;
                beforeEach(() => {
                    subTransmitter = instance.transmitter.pluck('items');
                });
                it('should return something', () => {
                    should(subTransmitter).be.ok();
                });
                describe('transmitting', () => {
                    var receiverSpy, subTransmission;
                    beforeEach(() => {
                        receiverSpy = sinon.spy();
                        subTransmission = subTransmitter.transmit({
                            splice() {
                                receiverSpy.apply(this, arguments);
                            }
                        });
                    });
                    it('should call subreceiver', () => {
                        should(receiverSpy).be.calledWith(0, 0, 'a', 'b');
                    });
                });
            });
        });
    });
});
