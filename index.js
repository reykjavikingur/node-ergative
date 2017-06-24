const ErgativeObject = require('./lib/object');
const ErgativeFunction = require('./lib/function');

class Ergative extends ErgativeObject {

    static get Object() {
        return ErgativeObject;
    }

    static get Function() {
        return ErgativeFunction;
    }

}

module.exports = Ergative;
