function flatten(nodes) {
    let values = [];
    for (let node of nodes) {
        if (node instanceof Array) {
            for (let subNode of node) {
                values.push(subNode);
            }
        }
        else {
            values.push(node);
        }
    }
    return values;
}

function transmit(...transmissions) {
    transmissions = flatten(transmissions);
    console.log('transmit', transmissions);
    return {
        close() {
            for (let transmission of transmissions) {
                transmission.close();
            }
        },
        catch(eb) {
            for (let transmission of transmissions) {
                transmission.catch(eb);
            }
            return this;
        }
    };
}

module.exports = transmit;
