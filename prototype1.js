// food object
let food = {
    int: function () {
        this.type = type;
    },
    recipe: function () {
        console.log(`The recipe for ${this.type} is...`);
    }
}

food.init('Donuts');
food.recipe(); // The recipe for Donuts is...