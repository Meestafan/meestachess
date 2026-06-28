import { Game } from "../../game/Game";

export class DeathSystem {
    update(game: Game): void {
        game.units
            .filter(unit => unit.health <= 0)
            .forEach(unit => {

                const tile =
                    game.board.getTile(unit.x, unit.y);

                if (tile) {
                    tile.occupant = undefined;
                }

            });
        game.units.splice(
            0,
            game.units.length,
            ...game.units.filter(u => u.health > 0)
        );
    }
}