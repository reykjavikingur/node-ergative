const should = require('should');
const sinon = require('sinon');
require('should-sinon');
const ErgativeFunction = require('../lib/function');

describe('Ergative.Function', () => {

    it('should exist', () => {
        should(ErgativeFunction).be.ok();
    });

    describe('instance', () => {
        var targetSpy, target, instance;
        beforeEach(() => {
            targetSpy = sinon.spy();
            target = function () {
                targetSpy.apply(this, arguments);
            };
            instance = new ErgativeFunction(target);
        });
        it('should exist', () => {
            should(instance).be.ok();
        });
        it('should not yet call spy', () => {
            should(targetSpy).not.be.called();
        });
        describe('when proxy is called', () => {
            beforeEach(() => {
                instance.proxy();
            });
            it('should call spy', () => {
                should(targetSpy).be.called();
            });
        });
        describe('when proxy is called with arguments', () => {
            var args;
            beforeEach(() => {
                args = [48, 98];
                instance.proxy(args[0], args[1]);
            });
            it('should call spy with arguments', () => {
                should(targetSpy).be.calledWith(args[0], args[1]);
            });
        });

        describe('transmitting', () => {
            var receiverSpy, receiver, transmission;
            beforeEach(() => {
                receiverSpy = sinon.spy();
                receiver = function () {
                    receiverSpy();
                };
                transmission = instance.transmitter.transmit(receiver);
            });
            it('should not yet call spy', () => {
                should(receiverSpy).not.be.called();
            });
            describe('when proxy is called', () => {
                beforeEach(() => {
                    instance.proxy();
                });
                it('should call spy', () => {
                    should(receiverSpy).be.called();
                });
            });
            describe('when transmission is closed', () => {
                beforeEach(() => {
                    transmission.close();
                });
                describe('when proxy is called', () => {
                    beforeEach(() => {
                        receiverSpy.reset();
                        instance.proxy();
                    });
                    it('should not call spy', () => {
                        should(receiverSpy).not.be.called();
                    });
                });
            });
        });

        describe('transmitting to receiver with catch', () => {
            var receiverError, receiver, catcherSpy, catcher, transmission;
            beforeEach(() => {
                receiverError = new Error('fake error');
                receiver = function () {
                    throw receiverError;
                };
                catcherSpy = sinon.spy();
                catcher = function () {
                    catcherSpy.apply(this, arguments);
                };
                transmission = instance.transmitter.transmit(receiver).catch(catcher);
            });
            it('should return transmission', () => {
                should(transmission).be.ok();
            });
            describe('when calling proxy', () => {
                beforeEach(() => {
                    instance.proxy();
                });
                it('should call catcher', () => {
                    should(catcherSpy).be.calledWith(receiverError);
                });
            });

        });

        describe('transmitting to multiple receivers that both throw errors', () => {
            var receiverSpy1, receiverSpy2, receiver1, receiver2;
            beforeEach(() => {
                receiverSpy1 = sinon.spy();
                receiverSpy2 = sinon.spy();
                receiver1 = function () {
                    receiverSpy1.apply(this, arguments);
                    throw new Error('fake error 1');
                };
                receiver2 = function () {
                    receiverSpy2.apply(this, arguments);
                    throw new Error('fake error 2');
                };
                instance.transmitter.transmit(receiver1);
                instance.transmitter.transmit(receiver2);
            });
            describe('when calling proxy', () => {
                beforeEach(() => {
                    targetSpy.reset();
                    instance.proxy();
                });
                it('should call target', () => {
                    should(targetSpy).be.called();
                });
                it('should call receiver1', () => {
                    should(receiverSpy1).be.called();
                });
                it('should call receiver2', () => {
                    should(receiverSpy2).be.called();
                });
            });
        });
    });

    describe('instance with target and context', () => {
        var targetSpy, context, instance;
        beforeEach(() => {
            targetSpy = sinon.spy();
            context = {
                id: 101,
                craft: function () {
                    targetSpy.apply(this, arguments);
                }
            };
            instance = new ErgativeFunction(context.craft, context);
        });
        describe('when calling proxy', () => {
            beforeEach(() => {
                instance.proxy();
            });
            it('should call spy with context', () => {
                should(targetSpy).be.calledOn(context);
            });
        });
    });

    describe('instance with contextual target but no explicit context', () => {
        var targetSpy, context, instance;
        beforeEach(() => {
            targetSpy = sinon.spy();
            context = {
                id: 101,
                craft: function () {
                    targetSpy.apply(this, arguments);
                }
            };
            instance = new ErgativeFunction(context.craft);
        });
        describe('when calling proxy', () => {
            beforeEach(() => {
                instance.proxy();
            });
            it('should call spy with context', () => {
                should(targetSpy).be.calledOn(instance);
            });
        });
    });

    describe('instance with target that returns value', () => {
        var rv, target, instance;
        beforeEach(() => {
            rv = 150;
            target = function () {
                return rv;
            };
            instance = new ErgativeFunction(target);
        });
        describe('proxy', () => {
            it('should return same value as target', () => {
                let proxy = instance.proxy;
                should(proxy()).eql(target());
            });
        });
    });

    describe('instance with target that throws error', () => {
        var target, instance;
        beforeEach(() => {
            target = function () {
                throw new Error('fake error');
            };
            instance = new ErgativeFunction(target);
        });
        describe('proxy', () => {
            it('should throw error', () => {
                let proxy = instance.proxy;
                let f = () => proxy();
                should(f).throw();
            });
        });
    });

});
