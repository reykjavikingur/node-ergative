const ErgativeArray = require('./lib/array');
const ErgativeObject = require('./lib/object');
const ErgativeFunction = require('./lib/function');
const transmit = require('./lib/transmit');

class Ergative extends ErgativeObject {

    static get Array() {
        return ErgativeArray;
    }

    static get Object() {
        return ErgativeObject;
    }

    static get Function() {
        return ErgativeFunction;
    }

    static get transmit() {
        return transmit;
    }

}

module.exports = Ergative;
