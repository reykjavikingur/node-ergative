const should = require('should');
const sinon = require('sinon');
const Ergative = require('../');

describe('Ergative.transmit', () => {

    describe('from two transmitters', () => {
        var e1, e2;
        beforeEach(() => {
            e1 = new Ergative.Function(function () {
            });
            e2 = new Ergative.Function(function () {
            });
        });
        describe('a transmission', () => {
            var receiver1, receiver2, transmission1, transmission2, transmission;
            beforeEach(() => {
                receiver1 = sinon.spy();
                receiver2 = sinon.spy();
                transmission1 = e1.transmitter.transmit(function () {
                    receiver1.apply(this, arguments);
                });
                transmission2 = e2.transmitter.transmit(function () {
                    receiver2.apply(this, arguments);
                });
                transmission = Ergative.transmit(transmission1, transmission2);
            });
            it('should be defined', () => {
                should(transmission).be.ok();
            });
            describe('close method', () => {
                beforeEach(() => {
                    sinon.spy(transmission1, 'close');
                    sinon.spy(transmission2, 'close');
                    transmission.close();
                });
                it('should call first sub-transmission close method', () => {
                    should(transmission1.close).be.calledWith();
                });
                it('should call other sub-transmission close method', () => {
                    should(transmission2.close).be.calledWith();
                });
            });
            describe('catch method', () => {
                var errback, rv;
                beforeEach(() => {
                    errback = sinon.spy();
                    sinon.spy(transmission1, 'catch');
                    sinon.spy(transmission2, 'catch');
                    rv = transmission.catch(errback);
                });
                it('should return transmission itself', () => {
                    should(rv).equal(transmission);
                });
                it('should call first catch method', () => {
                    should(transmission1.catch).be.calledWith(errback);
                });
                it('should call other catch method', () => {
                    should(transmission2.catch).be.calledWith(errback);
                });
            });
        });
        describe('a transmission with faulty receivers', () => {
            var error1, error2, transmission1, transmission2, errback, transmission;
            beforeEach(() => {
                transmission1 = e1.transmitter.transmit(function () {
                    if (error1) {
                        throw error1;
                    }
                });
                transmission2 = e2.transmitter.transmit(function () {
                    if (error2) {
                        throw error2;
                    }
                });
                errback = sinon.spy();
                transmission = Ergative.transmit(transmission1, transmission2).catch(errback);
            });
            it('should not call errback', () => {
                should(errback).not.be.called();
            });
            it('should catch error from first receiver', () => {
                errback.reset();
                error1 = new Error('fake error 1');
                e1.proxy();
                should(errback).be.calledWith(error1);
            });
            it('should catch error from other receiver', () => {
                errback.reset();
                error2 = new Error('fake error 2');
                e2.proxy();
                should(errback).be.calledWith(error2);
            });
        });
        describe('a transmission of a list of transmissions', () => {
            var transmission1, transmission2, transmission;
            beforeEach(() => {
                transmission1 = e1.transmitter.transmit(function () {
                });
                transmission2 = e2.transmitter.transmit(function () {
                });
                transmission = Ergative.transmit([transmission1, transmission2]);
            });
            describe('close', () => {
                beforeEach(() => {
                    sinon.spy(transmission1, 'close');
                    sinon.spy(transmission2, 'close');

                    transmission.close();
                });
                it('should call first close', () => {
                    should(transmission1.close).be.called();
                });
                it('should call other close', () => {
                    should(transmission2.close).be.called();
                });
            });
        });
    });

});
