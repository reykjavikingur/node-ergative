const should = require('should');
const Ergative = require('../');
const ErgativeObject = require('../lib/object');
const ErgativeFunction = require('../lib/function');

describe('Ergative', () => {

    it('should have correct Object', () => {
        should(Ergative.Object).eql(ErgativeObject);
    });

    it('should have correct Function', () => {
        should(Ergative.Function).eql(ErgativeFunction);
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
