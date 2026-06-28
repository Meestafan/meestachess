import { Board } from "../board/Board";
import { Shop } from "./Shop";
import { Team } from "../enums/Team";
import { Trait } from "../enums/Trait";
import { Unit } from "../units/Unit";

const MAX_BENCH_SIZE = 9;
const BASE_ROUND_ENEMIES = 3;

export class Game {
    public readonly board: Board;
    public readonly units: Unit[] = [];
    public readonly teamBenches: Record<Team, Unit[]> = {
        [Team.Blue]: [],
        [Team.Red]: [],
    };
    public readonly teamShops: Record<Team, Shop> = {
        [Team.Blue]: new Shop(),
        [Team.Red]: new Shop(),
    };

    public readonly teamGold: Record<Team, number> = {
        [Team.Blue]: 10,
        [Team.Red]: 10,
    };

    public readonly teamWinStreak: Record<Team, number> = {
        [Team.Blue]: 0,
        [Team.Red]: 0,
    };

    public readonly teamLossStreak: Record<Team, number> = {
        [Team.Blue]: 0,
        [Team.Red]: 0,
    };

    public round = 1;
    public isBattleActive = false;
    public lastRoundWinner?: Team;

    public readonly playerTeam = Team.Blue;
    public readonly enemyTeam = Team.Red;

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

    getShop(team: Team): Shop {
        return this.teamShops[team];
    }

    getBench(team: Team): Unit[] {
        return this.teamBenches[team];
    }

    getGold(team: Team): number {
        return this.teamGold[team];
    }

    buyOffer(index: number, team: Team): boolean {
        const shop = this.getShop(team);
        const bench = this.getBench(team);
        const offer = shop.getOffer(index);

        if (!offer || offer.cost > this.teamGold[team] || bench.length >= MAX_BENCH_SIZE) {
            return false;
        }

        const unit = shop.createUnit(offer.id, team);
        this.teamGold[team] -= offer.cost;
        bench.push(unit);

        return true;
    }

    placeBenchUnit(unitId: string, x: number, y: number, team: Team): boolean {
        const bench = this.getBench(team);
        const benchIndex = bench.findIndex((unit) => unit.id === unitId);
        if (benchIndex === -1) {
            return false;
        }

        const unit = bench[benchIndex];
        unit.x = x;
        unit.y = y;
        unit.health = unit.effectiveMaxHealth;

        if (!this.addUnit(unit)) {
            return false;
        }

        bench.splice(benchIndex, 1);

        return true;
    }

    startBattle(): boolean {
        if (this.isBattleActive || !this.hasTeamUnits(this.playerTeam) || !this.hasTeamUnits(this.enemyTeam)) {
            return false;
        }

        this.spawnEnemyUnits();
        this.applyTraitBonuses();
        this.isBattleActive = true;

        return true;
    }

    finishBattle(winner?: Team): void {
        this.isBattleActive = false;
        this.lastRoundWinner = winner;
        this.clearBoardUnits();

        if (winner) {
            const loser = winner === this.playerTeam ? this.enemyTeam : this.playerTeam;
            this.teamWinStreak[winner] += 1;
            this.teamLossStreak[winner] = 0;
            this.teamLossStreak[loser] += 1;
            this.teamWinStreak[loser] = 0;

            this.teamGold[winner] += winner === this.playerTeam ? 5 + this.teamWinStreak[winner] : 2;
        }

        this.round += 1;
        this.teamShops[Team.Blue].refresh();
        this.teamShops[Team.Red].refresh();
    }

    hasTeamUnits(team: Team): boolean {
        return this.units.some((unit) => unit.team === team && unit.health > 0);
    }

    private spawnEnemyUnits(): void {
        if (this.hasTeamUnits(this.enemyTeam)) {
            return;
        }

        const enemyCount = Math.min(this.board.width, BASE_ROUND_ENEMIES + Math.floor((this.round - 1) / 2));
        const spawnTiles = this.getSpawnTiles(enemyCount);

        for (const tile of spawnTiles) {
            const template = this.getShop(this.enemyTeam).getRandomTemplate();
            const enemy = this.getShop(this.enemyTeam).createUnit(template.id, this.enemyTeam, tile.x, tile.y);
            enemy.health = enemy.effectiveMaxHealth;
            this.addUnit(enemy);
        }
    }

    private getSpawnTiles(count: number): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];

        for (let x = 0; x < this.board.width && positions.length < count; x++) {
            const tile = this.board.getTile(x, this.board.height - 1);
            if (tile && !tile.occupant) {
                positions.push({ x, y: this.board.height - 1 });
            }
        }

        for (let y = this.board.height - 2; y >= 0 && positions.length < count; y--) {
            for (let x = 0; x < this.board.width && positions.length < count; x++) {
                const tile = this.board.getTile(x, y);
                if (tile && !tile.occupant) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    }

    private applyTraitBonuses(): void {
        const teamUnits = new Map<Team, Unit[]>();

        for (const unit of this.units) {
            unit.resetBonuses();
            const list = teamUnits.get(unit.team) ?? [];
            list.push(unit);
            teamUnits.set(unit.team, list);
        }

        for (const units of teamUnits.values()) {
            const traitCounts = new Map<Trait, number>();

            for (const unit of units) {
                for (const trait of unit.traits) {
                    traitCounts.set(trait, (traitCounts.get(trait) ?? 0) + 1);
                }
            }

            for (const unit of units) {
                if (unit.traits.includes(Trait.Knight) && (traitCounts.get(Trait.Knight) ?? 0) >= 2) {
                    unit.armorBonus += 5;
                }
                if (unit.traits.includes(Trait.Mage) && (traitCounts.get(Trait.Mage) ?? 0) >= 2) {
                    unit.abilityPowerBonus += 10;
                }
                if (unit.traits.includes(Trait.Brawler) && (traitCounts.get(Trait.Brawler) ?? 0) >= 2) {
                    unit.maxHealthBonus += 20;
                }
                if (unit.traits.includes(Trait.Assassin) && (traitCounts.get(Trait.Assassin) ?? 0) >= 2) {
                    unit.attackDamageBonus += 8;
                }

                unit.health = Math.min(unit.health, unit.effectiveMaxHealth);
            }
        }
    }

    private clearBoardUnits(): void {
        for (const row of this.board.tiles) {
            for (const tile of row) {
                tile.occupant = undefined;
            }
        }

        this.units.splice(0, this.units.length);
    }
}
