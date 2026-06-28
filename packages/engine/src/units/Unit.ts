import { Trait } from "../enums/Trait";
import { Team } from "../enums/Team";
import { UnitState } from "../enums/UnitState";
import { UnitStats } from "./UnitStats";

export class Unit {
    public target?: Unit;
    public mana = 0;
    public attackDamageBonus = 0;
    public armorBonus = 0;
    public abilityPowerBonus = 0;
    public maxHealthBonus = 0;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stats: UnitStats,
        public readonly team: Team,

        public x: number = 0,
        public y: number = 0,

        public health: number = stats.maxHealth,

        public state: UnitState = UnitState.Idle,
        public readonly traits: Trait[] = [],
        public readonly tier: number = 1
    ) {}

    get totalAttackDamage(): number {
        return this.stats.attackDamage + this.attackDamageBonus;
    }

    get totalArmor(): number {
        return this.stats.armor + this.armorBonus;
    }

    get totalAbilityPower(): number {
        return (this.stats.abilityPower ?? 0) + this.abilityPowerBonus;
    }

    get effectiveMaxHealth(): number {
        return this.stats.maxHealth + this.maxHealthBonus;
    }

    gainMana(amount: number): void {
        if (!this.stats.maxMana || amount <= 0) {
            return;
        }

        this.mana = Math.min(this.stats.maxMana, this.mana + amount);
    }

    canCastAbility(): boolean {
        return !!this.stats.maxMana && this.mana >= (this.stats.maxMana ?? 0);
    }

    useAbility(): void {
        this.mana = 0;
    }

    resetBonuses(): void {
        this.attackDamageBonus = 0;
        this.armorBonus = 0;
        this.abilityPowerBonus = 0;
        this.maxHealthBonus = 0;
    }
}
