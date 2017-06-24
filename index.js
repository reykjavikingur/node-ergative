const ObjectRelay = require('./lib/object');
const FunctionRelay = require('./lib/function');

class Ergative extends ObjectRelay {

    static get Object() {
        return ObjectRelay;
    }

    static get Function() {
        return FunctionRelay;
    }

}

module.exports = Ergative;
