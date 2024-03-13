class User {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.shipPositions = [];
        this.hits = []
    }

    addShipPositions(position) {
        this.shipPositions = position;
    }

}

module.exports = {User};