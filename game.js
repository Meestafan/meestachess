const UNIT_BLUEPRINTS = [
  {
    id: "vanguard",
    name: "Vanguard",
    role: "Frontline",
    attack: 6,
    health: 16,
    speed: 2,
    cost: 2,
    description: "Reliable starter unit that holds the lane.",
  },
  {
    id: "ranger",
    name: "Ranger",
    role: "Skirmisher",
    attack: 7,
    health: 10,
    speed: 3,
    cost: 3,
    description: "Fast damage dealer with strong burst.",
  },
  {
    id: "mystic",
    name: "Mystic",
    role: "Support",
    attack: 5,
    health: 12,
    speed: 2,
    cost: 3,
    description: "A flexible unit that scales well in teams.",
  },
  {
    id: "warden",
    name: "Warden",
    role: "Tank",
    attack: 4,
    health: 20,
    speed: 1,
    cost: 4,
    description: "Tough and steady for defensive lineups.",
  },
  {
    id: "assassin",
    name: "Assassin",
    role: "Burst",
    attack: 8,
    health: 9,
    speed: 4,
    cost: 4,
    description: "High speed and high pressure in close fights.",
  },
  {
    id: "ritualist",
    name: "Ritualist",
    role: "Mage",
    attack: 6,
    health: 11,
    speed: 3,
    cost: 5,
    description: "A high-impact caster for future synergies.",
  },
];

const state = {
  gold: 4,
  round: 1,
  shop: [],
  bench: [],
  board: {
    player: [null, null, null],
    enemy: [null, null, null],
  },
  selectedBenchUnitId: null,
  log: [],
  gameOver: false,
  status: "Recruit units, place them, and begin the fight.",
};

function initGame() {
  state.gold = 4;
  state.round = 1;
  state.shop = [];
  state.bench = [];
  state.board.player = [null, null, null];
  state.board.enemy = [null, null, null];
  state.selectedBenchUnitId = null;
  state.log = [];
  state.gameOver = false;
  state.status = "Recruit units, place them, and begin the fight.";

  refreshShop();
  populateEnemyBoard();
  render();
}

function refreshShop() {
  const pool = [...UNIT_BLUEPRINTS];
  state.shop = Array.from({ length: 3 }, () => {
    const index = Math.floor(Math.random() * pool.length);
    return pool.splice(index, 1)[0];
  });
}

function populateEnemyBoard() {
  const unitCount = Math.min(3, 1 + Math.floor(Math.random() * 2));
  state.board.enemy = Array.from({ length: 3 }, (_, index) => {
    if (index >= unitCount) return null;
    return createUnitFromBlueprint(getRandomEnemyBlueprint(), "enemy");
  });
}

function getRandomEnemyBlueprint() {
  const tierPool = UNIT_BLUEPRINTS.filter((unit) => unit.cost <= 4);
  return tierPool[Math.floor(Math.random() * tierPool.length)];
}

function createUnitFromBlueprint(blueprint, owner) {
  const health = blueprint.health + (owner === "enemy" ? 2 : 0);
  return {
    id: `${owner}-${blueprint.id}-${Math.random().toString(16).slice(2)}`,
    ...blueprint,
    owner,
    health,
  };
}

function buyUnit(unitId) {
  if (state.gameOver) return;
  if (state.bench.length >= 3) {
    setStatus("The bench is full. Deploy or reset before buying more.");
    return;
  }

  const selected = state.shop.find((unit) => unit.id === unitId);
  if (!selected) return;
  if (state.gold < selected.cost) {
    setStatus("Not enough gold for that unit.");
    return;
  }

  state.gold -= selected.cost;
  state.bench.push(createUnitFromBlueprint(selected, "player"));
  state.shop = state.shop.filter((unit) => unit.id !== unitId);
  state.log.push(`${selected.name} bought for ${selected.cost} gold.`);
  if (state.shop.length < 3) {
    const pool = [...UNIT_BLUEPRINTS.filter((unit) => !state.shop.some((shopUnit) => shopUnit.id === unit.id))];
    const available = pool[Math.floor(Math.random() * pool.length)];
    if (available) {
      state.shop.push(available);
    }
  }
  setStatus(`Purchased ${selected.name}.`);
  render();
}

function selectBenchUnit(unitId) {
  if (state.gameOver) return;
  state.selectedBenchUnitId = state.selectedBenchUnitId === unitId ? null : unitId;
  setStatus(state.selectedBenchUnitId ? "Choose a board slot to deploy the unit." : "Selection cleared.");
  render();
}

function deploySelectedUnit(slotIndex) {
  if (!state.selectedBenchUnitId) return;
  const benchUnit = state.bench.find((unit) => unit.id === state.selectedBenchUnitId);
  if (!benchUnit) return;
  if (state.board.player[slotIndex]) {
    setStatus("That board slot is already occupied.");
    return;
  }

  state.board.player[slotIndex] = { ...benchUnit };
  state.bench = state.bench.filter((unit) => unit.id !== state.selectedBenchUnitId);
  state.selectedBenchUnitId = null;
  state.log.push(`${benchUnit.name} deployed to the front line.`);
  setStatus(`${benchUnit.name} is ready for battle.`);
  render();
}

function startRound() {
  if (state.gameOver) return;
  const playerUnits = state.board.player.filter(Boolean);
  if (playerUnits.length === 0) {
    setStatus("Deploy at least one unit before starting a round.");
    return;
  }

  state.log.push(`Round ${state.round} begins.`);
  battleLoop();

  const survivingPlayers = state.board.player.filter(Boolean);
  const survivingEnemies = state.board.enemy.filter(Boolean);

  if (survivingPlayers.length > 0 && survivingEnemies.length === 0) {
    state.gold += 3 + state.round;
    state.round += 1;
    state.status = `Victory! Rewarded ${3 + state.round - 1} gold.`;
    state.log.push(`Victory! You earned ${3 + state.round - 1} gold.`);
    refreshShop();
    populateEnemyBoard();
  } else if (survivingPlayers.length === 0 && survivingEnemies.length > 0) {
    state.gameOver = true;
    state.status = "Defeat. Reset to try a new lineup.";
    state.log.push("Defeat. Your team was eliminated.");
  } else {
    state.round += 1;
    state.status = "The battle ended in a stalemate. A fresh enemy team is ready.";
    state.log.push("Stalemate. New enemies are approaching.");
    refreshShop();
    populateEnemyBoard();
  }

  render();
}

function battleLoop() {
  for (let turn = 0; turn < 6; turn += 1) {
    const order = getCombatOrder();
    for (const unit of order) {
      if (!unit || unit.health <= 0) continue;
      const targetSide = unit.owner === "player" ? "enemy" : "player";
      const target = findTarget(targetSide);
      if (target) {
        applyAttack(unit, target);
      }
    }

    cleanupBoards();
    if (!getAliveUnits("player").length || !getAliveUnits("enemy").length) {
      break;
    }
  }
}

function getCombatOrder() {
  return [...getAliveUnits("player"), ...getAliveUnits("enemy")].sort((a, b) => b.speed - a.speed);
}

function getAliveUnits(side) {
  return state.board[side].filter(Boolean).filter((unit) => unit.health > 0);
}

function findTarget(side) {
  return state.board[side].find((unit) => unit && unit.health > 0) || null;
}

function applyAttack(attacker, target) {
  target.health -= attacker.attack;
  state.log.push(`${attacker.name} hit ${target.name} for ${attacker.attack} damage.`);
  if (target.health <= 0) {
    state.log.push(`${target.name} was defeated.`);
  }
}

function cleanupBoards() {
  state.board.player = state.board.player.map((unit) => (unit && unit.health > 0 ? unit : null));
  state.board.enemy = state.board.enemy.map((unit) => (unit && unit.health > 0 ? unit : null));
}

function setStatus(message) {
  state.status = message;
  render();
}

function render() {
  document.getElementById("gold-value").textContent = state.gold;
  document.getElementById("round-value").textContent = state.round;
  document.getElementById("status-value").textContent = state.status;

  renderShop();
  renderBench();
  renderBoard("player", state.board.player, "player-board");
  renderBoard("enemy", state.board.enemy, "enemy-board");
  renderLog();
}

function renderShop() {
  const shop = document.getElementById("shop");
  shop.innerHTML = state.shop
    .map(
      (unit) => `
        <article class="unit-card">
          <h3>${unit.name}</h3>
          <p>${unit.description}</p>
          <div class="unit-meta">
            <span>Cost ${unit.cost}</span>
            <span>Atk ${unit.attack}</span>
            <span>HP ${unit.health}</span>
            <span>Spd ${unit.speed}</span>
          </div>
          <button data-action="buy" data-unit-id="${unit.id}" ${state.gameOver ? "disabled" : ""}>Buy</button>
        </article>
      `
    )
    .join("");
}

function renderBench() {
  const bench = document.getElementById("bench");
  if (state.bench.length === 0) {
    bench.innerHTML = '<p>No units on the bench.</p>';
    return;
  }

  bench.innerHTML = state.bench
    .map(
      (unit) => `
        <article class="unit-card ${state.selectedBenchUnitId === unit.id ? "selected" : ""}">
          <h3>${unit.name}</h3>
          <p>${unit.description}</p>
          <div class="unit-meta">
            <span>Atk ${unit.attack}</span>
            <span>HP ${unit.health}</span>
            <span>Spd ${unit.speed}</span>
          </div>
          <button data-action="select-bench" data-unit-id="${unit.id}">${state.selectedBenchUnitId === unit.id ? "Selected" : "Select"}</button>
        </article>
      `
    )
    .join("");
}

function renderBoard(side, units, containerId) {
  const board = document.getElementById(containerId);
  board.innerHTML = units
    .map((unit, index) => {
      const selected = side === "player" && state.selectedBenchUnitId;
      const canPlace = selected && !unit;
      return `
        <button class="board-cell ${unit ? "occupied" : ""} ${canPlace ? "can-place" : ""}" data-action="deploy" data-side="${side}" data-index="${index}">
          ${unit ? `
            <div class="unit-chip">
              <strong>${unit.name}</strong>
              <span>${unit.role}</span>
              <span>${unit.attack} ATK</span>
              <span>${unit.health} HP</span>
            </div>
          ` : `<span>${side === "player" ? "Open slot" : "Enemy"}</span>`}
        </button>
      `;
    })
    .join("");
}

function renderLog() {
  const log = document.getElementById("combat-log");
  if (!state.log.length) {
    log.innerHTML = "<li>No combat yet. The next round will show the action.</li>";
    return;
  }

  log.innerHTML = state.log.slice(-8).reverse().map((entry) => `<li>${entry}</li>`).join("");
}

function attachEvents() {
  document.getElementById("reroll-shop").addEventListener("click", () => {
    if (state.gameOver) return;
    refreshShop();
    setStatus("The shop has been refreshed.");
  });

  document.getElementById("start-round").addEventListener("click", startRound);
  document.getElementById("reset-game").addEventListener("click", initGame);

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "buy") {
      buyUnit(button.dataset.unitId);
    }

    if (action === "select-bench") {
      selectBenchUnit(button.dataset.unitId);
    }

    if (action === "deploy") {
      const slotIndex = Number(button.dataset.index);
      if (button.dataset.side === "player") {
        deploySelectedUnit(slotIndex);
      }
    }
  });
}

attachEvents();
initGame();
