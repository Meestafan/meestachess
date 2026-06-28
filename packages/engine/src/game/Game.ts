import { Board } from "../board/Board";
import { Unit } from "../units/Unit";

export class Game {
    public readonly board: Board;
    public readonly units: Unit[] = [];

    constructor(
        width: number = 8,
        height: number = 8
    ) {
        this.board = new Board(width, height);
    }

    addUnit(unit: Unit): boolean {
        const placed = this.board.placeUnit(unit);

        if (!placed) {
            return false;
        }

        this.units.push(unit);

        return true;
    }
}