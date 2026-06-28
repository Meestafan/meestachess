import { Game } from "./game/Game";
import { Simulation } from "./simulation/Simulation";
import { Team } from "./enums/Team";
import { Unit } from "./units/Unit";

const stats = {
    maxHealth: 100,
    attackDamage: 25,
    attackSpeed: 1,
    armor: 0,
    movementSpeed: 1,
    attackRange: 1
};

const game = new Game();

game.addUnit(
    new Unit("1", "Knight", stats, Team.Blue, 0, 0)
);

game.addUnit(
    new Unit("2", "Orc", stats, Team.Red, 7, 7)
);

const sim = new Simulation();

for (let i = 0; i < 20; i++) {
    console.clear();
    console.log("Tick", i);
    console.log(game.board.toString());
    const winner = sim.tick(game);

    if (winner) {
        console.log();
        console.log("Winner:", winner);
        break;
    }
}