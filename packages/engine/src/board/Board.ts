import { Tile } from "./Tile";
import { Unit } from "../units/Unit";
import { Team } from "../enums/Team";

export class Board {
    public readonly tiles: Tile[][];

    constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        this.tiles = [];

        for (let y = 0; y < height; y++) {
            const row: Tile[] = [];

            for (let x = 0; x < width; x++) {
                row.push(new Tile(x, y));
            }

            this.tiles.push(row);
        }
    }

    getTile(x: number, y: number): Tile | undefined {
        if (x < 0 || x >= this.width) return undefined;
        if (y < 0 || y >= this.height) return undefined;

        return this.tiles[y][x];
    }

    placeUnit(unit: Unit): boolean {
        const tile = this.getTile(unit.x, unit.y);

        if (!tile) {
            return false;
        }

        if (tile.occupant) {
            return false;
        }

        tile.occupant = unit;

        return true;
    }

    moveUnit(unit: Unit, newX: number, newY: number): boolean {
        const currentTile = this.getTile(unit.x, unit.y);
        const destinationTile = this.getTile(newX, newY);

        if (!currentTile || !destinationTile) {
            return false;
        }

        if (destinationTile.occupant) {
            return false;
        }

        currentTile.occupant = undefined;

        destinationTile.occupant = unit;

        unit.x = newX;
        unit.y = newY;

        return true;
    }

    toString(): string {
        const rows: string[] = [];
        for (let y = 0; y < this.height; y++) {
            const row: string[] = [];
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (!tile.occupant) {
                    row.push(".");
                    continue;
                }
                row.push(tile.occupant.team === Team.Blue ? "B" : "R");
            }
            rows.push(row.join(" "));
        }
        return rows.join("\n");
    }
}