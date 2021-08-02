var currentTurn = true;
class Player {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }

    setTurn = (turn) => { 
        this.currentTurn = turn;
    }

    getTurn = () => {
        return this.currentTurn;
    }
}