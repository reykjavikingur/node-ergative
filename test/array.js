const should = require('should');
const ArrayRelay = require('../lib/array');

describe('Ergative.Array', () => {

    describe('instance', () => {
        var target, instance;
        beforeEach(() => {
            target = [];
            instance = new ArrayRelay(target);
        });
        describe('proxy', () => {
            it('should exist', () => {
                should(instance.proxy).be.ok();
            });
            it('should have correct length', () => {
                should(instance.proxy.length).eql(target.length);
            });
        });
    });
});
