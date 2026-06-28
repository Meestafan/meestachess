import { Game } from "../../game/Game";

export class MovementSystem {
    update(game: Game): void {
        for (const unit of game.units) {

            if (!unit.target) {
                continue;
            }

            const dx = unit.target.x - unit.x;
            const dy = unit.target.y - unit.y;

            const distance = Math.abs(dx) + Math.abs(dy);

            if (distance <= 1) {
                continue;
            }

            let newX = unit.x;
            let newY = unit.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                newX += Math.sign(dx);
            } else if (dy !== 0) {
                newY += Math.sign(dy);
            }
            game.board.moveUnit(unit, newX, newY);
        }
    }
}