import { Team } from "../enums/Team";
import { UnitState } from "../enums/UnitState";
import { UnitStats } from "./UnitStats";

export class Unit {
    public target?: Unit;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stats: UnitStats,
        public readonly team: Team,

        public x: number = 0,
        public y: number = 0,

        public health: number = stats.maxHealth,

        public state: UnitState = UnitState.Idle
    ) {}
}