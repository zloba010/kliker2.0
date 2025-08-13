// script.js

const WEAPONS = [
    { name: 'Кулак', damage: 1 },
    { name: 'Меч', damage: 10 },
    { name: 'Лук', damage: 15 },
    { name: 'Посох', damage: 20 }
];

let playerState = {};

window.onload = () => loadGame();

function loadGame() {
    // Загрузка сохраненного состояния
    if (!localStorage.getItem("playerState")) {
        resetPlayerState(); // Если состояние отсутствует, создаем новое
    } else {
        playerState = JSON.parse(localStorage.getItem("playerState"));
    }
    renderUI();
    startBattleLoop();
}

function saveGame() {
    localStorage.setItem("playerState", JSON.stringify(playerState));
}

function resetPlayerState() {
    playerState = {
        level: 1,
        silverCoins: 0,
        goldCoins: 0,
        currentWeaponIndex: 0,
        curseLevel: 0,
        weaponsOwned: [],
        bossesDefeated: []
    };
    for(let i=0; i<WEAPONS.length; i++) {
        playerState.weaponsOwned.push({name: WEAPONS[i].name, damage: WEAPONS[i].damage});
    }
}

function attack() {
    const bossHealthElement = document.querySelector("#boss-hp-bar");
    let currentBoss = playerState.bossesDefeated[playerState.level - 1]; // Текущий босс
    let weaponDamage = playerState.weaponsOwned[playerState.currentWeaponIndex].damage + playerState.curseLevel * 10;
    currentBoss.health -= weaponDamage;
    bossHealthElement.value = Math.max(currentBoss.health / currentBoss.initialHealth * 100, 0);

    if (currentBoss.health <= 0) {
        alert(`Вы победили ${currentBoss.name}`);
        giveRewards();
        nextBoss();
    }
}

function buyWeapon(name) {
    const weaponPriceMap = {'sword': 500, 'bow': 700, 'staff': 1000};
    const price = weaponPriceMap[name];
    if (price > playerState.silverCoins) return alert("Недостаточно серебра!");
    playerState.silverCoins -= price;
    playerState.weaponsOwned.forEach(w => w.damage += 1); // Увеличиваем начальное значение всех оружий
    updateWeaponsSelect();
    renderUI();
}

function upgradeCurrentWeapon() {
    if (playerState.silverCoins >= 200) {
        playerState.silverCoins -= 200;
        playerState.weaponsOwned[playerState.currentWeaponIndex].damage++;
        renderUI();
    } else {
        alert("Нет достаточно серебра.");
    }
}

function buyCurseAbility() {
    if (playerState.goldCoins >= 50 && !playerState.curseLevel) {
        playerState.goldCoins -= 50;
        playerState.curseLevel = 1;
        renderUI();
    } else {
        alert("У вас недостаточно золота или способность уже активирована.");
    }
}

function upgradeCurseAbility() {
    if (playerState.goldCoins >= 50) {
        playerState.goldCoins -= 50;
        playerState.curseLevel++;
        renderUI();
    } else {
        alert("У вас недостаточно золота.");
    }
}

function giveRewards() {
    playerState.silverCoins += Math.floor(Math.random() * 100) + 100;
    if ((playerState.level % 10 === 0)) {
        playerState.goldCoins += 50;
    }
    playerState.level++;
    renderUI();
}

function nextBoss() {
    const newBoss = createNextBoss();
    playerState.bossesDefeated.push(newBoss);
    renderBossesList();
    startBattleLoop();
}

function createNextBoss() {
    const initialHealth = playerState.level === 1 ? 1000 : (playerState.level % 10 === 0 ? 100000 : playerState.level * 1000);
    return {
        name: `Босс №${playerState.level}`,
        health: initialHealth,
        initialHealth: initialHealth
    };
}

function renderUI() {
    document.querySelector('#level').innerText = playerState.level;
    document.querySelector('#silver-coins').innerText = playerState.silverCoins;
    document.querySelector('#gold-coins').innerText = playerState.goldCoins;
    document.querySelector('#current-damage').innerText = playerState.weaponsOwned[playerState.currentWeaponIndex].damage;
    document.querySelector('#curse-damage').innerText = playerState.curseLevel * 10;
    updateWeaponsSelect();
}

function updateWeaponsSelect() {
    const selectEl = document.querySelector('#weapon-select');
    selectEl.innerHTML = '';
    playerState.weaponsOwned.forEach((w, idx) => {
        const option = document.createElement('option');
        option.textContent = `${w.name}, Урон: ${w.damage}`;
        option.value = idx;
        selectEl.appendChild(option);
    });
    selectEl.addEventListener('change', function(e){
        playerState.currentWeaponIndex = e.target.value;
        renderUI();
    });
}

function renderBossesList() {
    const listEl = document.querySelector('#bosses-list');
    listEl.innerHTML = '';
    playerState.bossesDefeated.forEach(boss => {
        const li = document.createElement('li');
        li.textContent = `${boss.name}: HP=${Math.round(boss.health)}`;
        listEl.appendChild(li);
    });
}

function startBattleLoop() {
    setInterval(() => {
        const currentBoss = playerState.bossesDefeated[playerState.level - 1];
        if (currentBoss) {
            const bossHealthBar = document.querySelector("#boss-hp-bar");
            bossHealthBar.value = Math.max(currentBoss.health / currentBoss.initialHealth * 100, 0);
            
            // Наносим урон боссу автоматически каждые 15 секунд
            if (playerState.curseLevel > 0) {
                currentBoss.health -= playerState.curseLevel * 10;
                bossHealthBar.value = Math.max(currentBoss.health / currentBoss.initialHealth * 100, 0);
                
                if (currentBoss.health <= 0) {
                    alert(`Вы победили ${currentBoss.name}`);
                    giveRewards();
                    nextBoss();
                }
            }
        }
    }, 15000);
}

setInterval(saveGame, 10000); // Сохраняем состояние каждые 10 секунд