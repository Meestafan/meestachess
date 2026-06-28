import { Unit } from "../units/Unit";

export class Tile {
    occupant?: Unit;

    constructor(
        public readonly x: number,
        public readonly y: number
    ) {}
}