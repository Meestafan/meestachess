import { Game } from "../../game/Game";

export class CombatSystem {
    update(game: Game): void {
        for (const unit of game.units) {
            if (!unit.target) {
                continue;
            }

            const distance =
                Math.abs(unit.x - unit.target.x) +
                Math.abs(unit.y - unit.target.y);

            if (distance > 1) {
                continue;
            }
            unit.target.health -= unit.stats.attackDamage;
        }
    }
}