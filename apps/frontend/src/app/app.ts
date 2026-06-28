import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Game } from '../../../../packages/engine/src/game/Game';
import { Simulation } from '../../../../packages/engine/src/simulation/Simulation';
import { Team } from '../../../../packages/engine/src/enums/Team';
import { Tile } from '../../../../packages/engine/src/board/Tile';
import { Unit } from '../../../../packages/engine/src/units/Unit';
import { UnitStats } from '../../../../packages/engine/src/units/UnitStats';

const DEFAULT_STATS: UnitStats = {
  maxHealth: 100,
  attackDamage: 25,
  attackSpeed: 1,
  armor: 0,
  movementSpeed: 1,
  attackRange: 1,
};

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Auto Battler');
  protected readonly team = Team;

  protected readonly selectedTeam = signal<Team>(Team.Blue);
  protected readonly selectedBenchUnitId = signal<string | undefined>(undefined);
  protected readonly status = signal('Place units for both teams, then start battle.');
  protected readonly battleStarted = signal(false);
  protected readonly winner = signal<string | undefined>(undefined);
  protected readonly tickCount = signal(0);
  protected readonly game = signal(new Game());
  protected readonly refresh = signal(0);
  protected readonly simulation = new Simulation();
  protected lastUnitId = 1;
  private intervalId?: number;

  protected readonly boardRows = computed(() => {
    this.refresh();
    return this.game().board.tiles;
  });

  protected readonly blueCount = computed(() => {
    this.refresh();
    return this.game().units.filter((u) => u.team === Team.Blue).length;
  });

  protected readonly redCount = computed(() => {
    this.refresh();
    return this.game().units.filter((u) => u.team === Team.Red).length;
  });

  protected readonly shopOffers = computed(() => {
    this.refresh();
    return this.game().getShop(this.selectedTeam()).offers;
  });

  protected readonly benchUnits = computed(() => {
    this.refresh();
    return this.game().getBench(this.selectedTeam());
  });

  protected readonly benchCount = computed(() => {
    this.refresh();
    return this.benchUnits().length;
  });

  protected readonly gold = computed(() => {
    this.refresh();
    return this.game().getGold(this.selectedTeam());
  });

  protected readonly round = computed(() => {
    this.refresh();
    return this.game().round;
  });

  protected selectTeam(team: Team) {
    if (this.battleStarted()) {
      return;
    }
    this.selectedTeam.set(team);
  }

  protected tileClicked(tile: Tile) {
    if (this.battleStarted()) {
      return;
    }

    if (tile.occupant) {
      return;
    }

    const selectedBenchId = this.selectedBenchUnitId();
    if (selectedBenchId) {
      if (this.game().placeBenchUnit(selectedBenchId, tile.x, tile.y, this.selectedTeam())) {
        this.selectedBenchUnitId.set(undefined);
        this.refresh.update((current) => current + 1);
        this.status.set('Placed a unit from the bench.');
      } else {
        this.status.set('Unable to place the selected bench unit.');
      }
      return;
    }

    const unit = new Unit(
      `unit-${this.lastUnitId++}`,
      `${this.selectedTeam()} Champion`,
      DEFAULT_STATS,
      this.selectedTeam(),
      tile.x,
      tile.y
    );

    if (this.game().addUnit(unit)) {
      this.refresh.update((current) => current + 1);
      this.status.set(`${this.selectedTeam()} unit placed.`);
    } else {
      this.status.set('That tile is unavailable.');
    }
  }

  protected buyOffer(index: number) {
    if (this.battleStarted()) {
      return;
    }

    if (this.game().buyOffer(index, this.selectedTeam())) {
      this.refresh.update((current) => current + 1);
      this.status.set('Bought a unit into your bench.');
    } else {
      this.status.set('Cannot buy that unit right now.');
    }
  }

  protected selectBenchUnit(unitId: string) {
    if (this.battleStarted()) {
      return;
    }

    this.selectedBenchUnitId.set(unitId);
  }

  protected startBattle() {
    if (this.battleStarted()) {
      return;
    }

    const game = this.game();
    const hasBlue = game.units.some((u) => u.team === Team.Blue);
    const hasRed = game.units.some((u) => u.team === Team.Red);

    if (!hasBlue || !hasRed) {
      this.status.set('Place at least one unit for each team before starting.');
      return;
    }

    this.battleStarted.set(true);
    this.winner.set(undefined);
    this.status.set('Battle started. Units are moving and attacking.');

    this.intervalId = window.setInterval(() => {
      const winner = this.simulation.tick(this.game());
      this.refresh.update((current) => current + 1);
      this.tickCount.update((value) => value + 1);

      if (winner || this.game().units.length === 0) {
        this.finishBattle(winner);
      }
    }, 350);
  }

  protected resetGame() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.game.set(new Game());
    this.refresh.update((current) => current + 1);
    this.battleStarted.set(false);
    this.winner.set(undefined);
    this.tickCount.set(0);
    this.status.set('Place units for both teams, then start battle.');
  }

  private finishBattle(winner?: Team) {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.battleStarted.set(false);
    this.winner.set(winner ?? 'Draw');
    this.status.set(winner ? `${winner} wins!` : 'Draw! All units have fallen.');
  }
}
