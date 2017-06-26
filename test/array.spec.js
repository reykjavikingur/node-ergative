const should = require('should');
const sinon = require('sinon');
const ErgativeArray = require('../lib/array');

describe('Ergative.Array', () => {

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
            });
        });
    });
});
