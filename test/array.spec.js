const should = require('should');
const ErgativeArray = require('../lib/array');

describe('Ergative.Array', () => {

    describe('instance', () => {
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
                should(instance.proxy.length).eql(target.length);
            });
        });
    });
});
