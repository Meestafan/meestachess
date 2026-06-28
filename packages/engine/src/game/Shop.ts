import { Trait } from "../enums/Trait";
import { Team } from "../enums/Team";
import { Unit } from "../units/Unit";
import { UnitState } from "../enums/UnitState";
import { UnitStats } from "../units/UnitStats";

export interface UnitTemplate {
  id: string;
  name: string;
  tier: number;
  traits: Trait[];
  cost: number;
  stats: UnitStats;
}

const SHOP_TEMPLATES: UnitTemplate[] = [
  {
    id: "knight",
    name: "Squire",
    tier: 1,
    traits: [Trait.Knight],
    cost: 3,
    stats: {
      maxHealth: 120,
      attackDamage: 18,
      attackSpeed: 1,
      armor: 3,
      movementSpeed: 1,
      attackRange: 1,
      maxMana: 30,
      manaPerAttack: 8,
      abilityPower: 20,
    },
  },
  {
    id: "brawler",
    name: "Bruiser",
    tier: 1,
    traits: [Trait.Brawler],
    cost: 3,
    stats: {
      maxHealth: 160,
      attackDamage: 14,
      attackSpeed: 1,
      armor: 2,
      movementSpeed: 1,
      attackRange: 1,
      maxMana: 40,
      manaPerAttack: 10,
      abilityPower: 18,
    },
  },
  {
    id: "mage",
    name: "Arcanist",
    tier: 1,
    traits: [Trait.Mage],
    cost: 3,
    stats: {
      maxHealth: 90,
      attackDamage: 12,
      attackSpeed: 1,
      armor: 1,
      movementSpeed: 1,
      attackRange: 1,
      maxMana: 45,
      manaPerAttack: 14,
      abilityPower: 28,
    },
  },
  {
    id: "assassin",
    name: "Shade",
    tier: 1,
    traits: [Trait.Assassin],
    cost: 3,
    stats: {
      maxHealth: 80,
      attackDamage: 24,
      attackSpeed: 1,
      armor: 0,
      movementSpeed: 1,
      attackRange: 1,
      maxMana: 35,
      manaPerAttack: 16,
      abilityPower: 30,
    },
  },
  {
    id: "paladin",
    name: "Paladin",
    tier: 2,
    traits: [Trait.Knight],
    cost: 4,
    stats: {
      maxHealth: 150,
      attackDamage: 20,
      attackSpeed: 1,
      armor: 5,
      movementSpeed: 1,
      attackRange: 1,
      maxMana: 40,
      manaPerAttack: 11,
      abilityPower: 24,
    },
  },
];

const SHOP_SIZE = 5;
const BENCH_LIMIT = 9;

export class Shop {
  public readonly offers: UnitTemplate[] = [];

  constructor(
    private readonly templates: UnitTemplate[] = SHOP_TEMPLATES,
    private readonly size: number = SHOP_SIZE
  ) {
    this.refresh();
  }

  refresh(): void {
    this.offers.splice(0, this.offers.length, ...this.generateOffers());
  }

  getOffer(index: number): UnitTemplate | undefined {
    return this.offers[index];
  }

  createUnit(templateId: string, team: Team, x = 0, y = 0): Unit {
    const template = this.templates.find((item) => item.id === templateId);
    if (!template) {
      throw new Error(`Shop template not found: ${templateId}`);
    }

    return new Unit(
      `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      template.name,
      template.stats,
      team,
      x,
      y,
      template.stats.maxHealth,
      UnitState.Idle,
      template.traits,
      template.tier
    );
  }

  getRandomTemplate(): UnitTemplate {
    return this.templates[Math.floor(Math.random() * this.templates.length)];
  }

  canBuy(availableGold: number, benchSize: number, index: number): boolean {
    const offer = this.getOffer(index);
    return !!offer && availableGold >= offer.cost && benchSize < BENCH_LIMIT;
  }

  private generateOffers(): UnitTemplate[] {
    const offers: UnitTemplate[] = [];
    for (let i = 0; i < this.size; i++) {
      const template = this.templates[Math.floor(Math.random() * this.templates.length)];
      offers.push(template);
    }
    return offers;
  }
}
