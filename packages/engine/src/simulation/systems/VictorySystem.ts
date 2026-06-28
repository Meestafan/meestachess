import { Game } from "../../game/Game";
import { Team } from "../../enums/Team";

export class VictorySystem {
    update(game: Game): Team | undefined {
        const alive = new Set(game.units.map(u => u.team));
        if (alive.size === 1) {
            return [...alive][0];
        }

        return undefined;
    }
}