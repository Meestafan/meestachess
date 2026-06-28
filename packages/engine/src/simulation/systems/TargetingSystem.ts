import { Game } from "../../game/Game";
import { Unit } from "../../units/Unit";

export class TargetingSystem {
    update(game: Game): void {
        for (const unit of game.units) {
            if (unit.health <= 0) {
                continue;
            }

            let closest: Unit | undefined;
            let bestDistance = Number.MAX_VALUE;

            for (const other of game.units) {
                if (other.team === unit.team) {
                    continue;
                }

                if (other.health <= 0) {
                    continue;
                }

                const distance =
                    Math.abs(unit.x - other.x) +
                    Math.abs(unit.y - other.y);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    closest = other;
                }
            }

            unit.target = closest;
        }
    }
}