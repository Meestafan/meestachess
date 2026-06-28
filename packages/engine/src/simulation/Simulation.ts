import { Game } from "../game/Game";

import { TargetingSystem } from "./systems/TargetingSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { CombatSystem } from "./systems/CombatSystem";
import { DeathSystem } from "./systems/DeathSystem";
import { VictorySystem } from "./systems/VictorySystem";

export class Simulation {
    private targeting = new TargetingSystem();
    private movement = new MovementSystem();
    private combat = new CombatSystem();
    private death = new DeathSystem();
    private victory = new VictorySystem();

    tick(game: Game) {
        this.targeting.update(game);
        this.movement.update(game);
        this.combat.update(game);
        this.death.update(game);
        return this.victory.update(game);
    }
}