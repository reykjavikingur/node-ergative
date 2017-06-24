const should = require('should');
const Ergative = require('../');
const ObjectRelay = require('../lib/object');
const FunctionRelay = require('../lib/function');

describe('Ergative', () => {

    it('should have correct Object', () => {
        should(Ergative.Object).eql(ObjectRelay);
    });

    it('should have correct Function', () => {
        should(Ergative.Function).eql(FunctionRelay);
    });

    describe('instance', () => {
        var instance;
        beforeEach(() => {
            instance = new Ergative({});
        });
        it('should be instance of Ergative.Object', () => {
            should(instance instanceof Ergative.Object).be.ok();
        });
    });

});
