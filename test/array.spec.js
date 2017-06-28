const should = require('should');
const sinon = require('sinon');
const ErgativeArray = require('../lib/array');

describe('Ergative.Array', () => {

    // TODO test theory that all kinds of changes to proxy are mirrored accurately to target
    // TODO test theory that all kinds of changes to proxy are transmitted accurately to receiver

    describe('instance with empty target', () => {
        var target, instance;
        beforeEach(() => {
            target = [];
            instance = new ErgativeArray(target);
        });
        describe('proxy', () => {
            it('should exist', () => {
                should(instance.proxy).be.ok();
            });
            it('should have correct length', () => {
                should(instance.proxy.length).eql(0);
            });
        });
        describe('transmitting', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    splice() {
                        receiverSpy.apply(this, arguments);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should return transmission', () => {
                should(transmission).be.ok();
            });
            describe('push onto proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.push('a');
                });
                it('should have correct length', () => {
                    should(instance.proxy.length).eql(1);
                });
                it('should have correct value at 0', () => {
                    should(instance.proxy[0]).eql('a');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
                it('should call receiver with correct arguments', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'a');
                });
            });
            describe('closing transmission', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    transmission.close();
                });
                describe('push onto proxy', () => {
                    beforeEach(() => {
                        instance.proxy.push('a');
                    });
                    it('should not call receiver', () => {
                        should(receiverSpy).not.be.called();
                    });
                });
            });
            describe('push multiple onto proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.push('a', 'b');
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(2);
                    should(instance.proxy[0]).eql('a');
                    should(instance.proxy[1]).eql('b');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'a', 'b');
                });
            });
            describe('setting item in proxy directly', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy[0] = 'v';
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql('v');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 1, 'v');
                });
            });
            describe('unshift into proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.unshift('g');
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql('g');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'g');
                });
            });
            describe('unshift multiple into proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.unshift('g', 'h');
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(2);
                    should(instance.proxy[0]).eql('g');
                    should(instance.proxy[1]).eql('h');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'g', 'h');
                });
            });
            describe('splice into proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.splice(0, 0, 'a', 'b', 'c');
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(3);
                    should(instance.proxy[0]).eql('a');
                    should(instance.proxy[1]).eql('b');
                    should(instance.proxy[2]).eql('c');
                });
                it('should call proxy', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'a', 'b', 'c');
                });
            });
        });
        describe('transmitting to failing receiver', () => {
            var receiverSpy, receiver, failing, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                failing = false;
                receiver = {
                    splice() {
                        receiverSpy.apply(this, arguments);
                        if (failing) {
                            throw new Error('fake error');
                        }
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should return transmission', () => {
                should(transmission).be.ok();
            });
            describe('push onto proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    failing = true;
                    instance.proxy.push('f');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql('f');
                });
            });
        });
        describe('transmitting to failing receiver with catch', () => {
            var receiverSpy, catcherSpy, receiver, catcher, failing, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                catcherSpy = sinon.spy();
                failing = false;
                receiver = {
                    splice() {
                        receiverSpy.apply(this, arguments);
                        if (failing) {
                            throw new Error('fake error');
                        }
                    }
                };
                catcher = function (e) {
                    catcherSpy.apply(this, arguments);
                };
                transmission = instance.transmitter.transmit(receiver).catch(catcher);
            });
            it('should return transmission', () => {
                should(transmission).be.ok();
            });
            describe('push onto proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    catcherSpy.reset();
                    failing = true;
                    instance.proxy.push('f');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.called();
                });
                it('should have correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql('f');
                });
                it('should call catcher', () => {
                    should(catcherSpy).be.called();
                });
            });
        });
    });

    describe('instance with target having single item', () => {
        var target, instance;
        beforeEach(() => {
            target = ['a'];
            instance = new ErgativeArray(target);
        });
        describe('proxy', () => {
            it('should have length 1', () => {
                should(instance.proxy.length).eql(1);
            });
            it('should have correct contents', () => {
                should(instance.proxy[0]).eql('a');
            });
        });
        describe('transmitting', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = {
                    splice() {
                        receiverSpy.apply(this, arguments);
                    }
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should call receiver', () => {
                should(receiverSpy).be.calledWith(0, 0, 'a');
            });
            describe('push second item onto proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy.push('b');
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(1, 0, 'b');
                });
                it('should change proxy to correct value', () => {
                    should(instance.proxy.length).eql(2);
                    should(instance.proxy[0]).eql('a');
                    should(instance.proxy[1]).eql('b');
                });
            });
            describe('set item in proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    instance.proxy[0] = 'z';
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 1, 'z');
                });
                it('should change proxy to correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql('z');
                });
            });
            describe('delete item in proxy', () => {
                beforeEach(() => {
                    receiverSpy.reset();
                    delete instance.proxy[0];
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 1, undefined);
                });
                it('should change proxy to correct value', () => {
                    should(instance.proxy.length).eql(1);
                    should(instance.proxy[0]).eql(undefined);
                });
            });
        });
    });
    describe('instance with target having three values', () => {
        var target, instance;
        beforeEach(() => {
            target = ['e', 'i', 'pi'];
            instance = new ErgativeArray(target);
        });
        describe('proxy', () => {
            it('should have correct contents', () => {
                should(instance.proxy.length).eql(3);
                should(instance.proxy[0]).eql('e');
                should(instance.proxy[1]).eql('i');
                should(instance.proxy[2]).eql('pi');
            });
            describe('transmitting', () => {
                var receiverSpy, receiver, transmission;
                beforeEach(() => {
                    receiverSpy = sinon.spy();
                    receiver = {
                        splice() {
                            receiverSpy.apply(this, arguments);
                        }
                    };
                    transmission = instance.transmitter.transmit(receiver);
                });
                it('should call receiver', () => {
                    should(receiverSpy).be.calledWith(0, 0, 'e', 'i', 'pi');
                });
                describe('pop', () => {
                    var value;
                    beforeEach(() => {
                        receiverSpy.reset();
                        value = instance.proxy.pop();
                    });
                    it('should return correct value', () => {
                        should(value).eql('pi');
                    });
                    it('should reduce length', () => {
                        should(instance.proxy.length).eql(2);
                    });
                    it('should have correct contents', () => {
                        should(instance.proxy[0]).eql('e');
                        should(instance.proxy[1]).eql('i');
                    });
                    it('should call receiver', () => {
                        should(receiverSpy).be.calledWith(2, 1);
                    });
                });
                describe('shift', () => {
                    var value;
                    beforeEach(() => {
                        receiverSpy.reset();
                        value = instance.proxy.shift();
                    });
                    it('should return correct value', () => {
                        should(value).eql('e');
                    });
                    it('should reduce length', () => {
                        should(instance.proxy.length).eql(2);
                    });
                    it('should have correct contents', () => {
                        should(instance.proxy[0]).eql('i');
                        should(instance.proxy[1]).eql('pi');
                    });
                    it('should call receiver', () => {
                        should(receiverSpy).be.calledWith(0, 1);
                    });
                });
            });
        });
    });
});
