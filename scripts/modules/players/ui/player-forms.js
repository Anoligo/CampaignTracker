import { gameDataService } from '../../game-data/services/game-data-service.js';

export class PlayerForms {
    constructor(playerManager) {
        this.playerManager = playerManager;
        // Support both legacy and new manager property names
        this.ui = playerManager.playerUI || playerManager.ui;
    }

    showNewPlayerForm() {
        const details = document.getElementById('playerDetails');
        if (!details) {
            console.error('Could not find playerDetails element');
            return;
        }

        details.innerHTML = `
            <h3>New Player</h3>
            <form id="newPlayerForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="playerName" class="form-label">Name *</label>
                        <input type="text" class="form-control" id="playerName" name="playerName" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="playerRace" class="form-label">Race *</label>
                        <select class="form-select" id="playerRace" name="playerRace" required>
                            <option value="">Select a race</option>
                            ${gameDataService.getRaces().map(race => 
                                `<option value="${race.id}">${race.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <label for="playerClass" class="form-label">Class *</label>
                        <select class="form-select" id="playerClass" name="playerClass" required>
                            <option value="">Select a class</option>
                            ${gameDataService.getClasses().map(cls => 
                                `<option value="${cls.id}">${cls.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="playerLevel" class="form-label">Level</label>
                        <input type="number" class="form-control" id="playerLevel" name="playerLevel" value="1" min="1" max="20">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Create Player</button>
                <button type="button" class="btn btn-secondary ms-2" id="cancelBtn">Cancel</button>
            </form>
        `;

        const form = document.getElementById('newPlayerForm');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const data = {
                    name: form.playerName.value,
                    playerClass: form.playerClass.value,
                    level: parseInt(form.playerLevel.value, 10) || 1,
                    race: form.playerRace.value
                };

                const player = this.playerManager.createPlayer(data);

                // Refresh the list and highlight the new player
                const ui = this.playerManager.playerUI || this.playerManager.ui;
                ui?.renderList();
                if (player?.id) {
                    ui?.handleSelect(player.id);
                }

                form.reset();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                details.innerHTML = '<p class="text-muted">Select a player to view details</p>';
            });
        }
    }

    showEditPlayerForm(playerId) {
        const service = this.playerManager.playerService || this.playerManager.service;
        const player = service.getPlayerById(playerId);
        if (!player) return;

        const details = document.getElementById('playerDetails');
        details.innerHTML = `
            <h3>Edit Player</h3>
            <form id="editPlayerForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="playerName" class="form-label">Name *</label>
                        <input type="text" class="form-control" id="playerName" name="playerName" value="${player.name || ''}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="playerRace" class="form-label">Race *</label>
                        <select class="form-select" id="playerRace" name="playerRace" required>
                            <option value="">Select a race</option>
                            ${gameDataService.getRaces().map(race => 
                                `<option value="${race.id}" ${player.race === race.id ? 'selected' : ''}>
                                    ${race.name}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <label for="playerClass" class="form-label">Class *</label>
                        <select class="form-select" id="playerClass" name="playerClass" required>
                            <option value="">Select a class</option>
                            ${gameDataService.getClasses().map(cls =>
                                `<option value="${cls.id}" ${(player.playerClass || player.class) === cls.id ? 'selected' : ''}>
                                    ${cls.name}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="playerLevel" class="form-label">Level</label>
                        <input type="number" class="form-control" id="playerLevel" name="playerLevel" 
                               value="${player.level || 1}" min="1" max="20">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Update Player</button>
                <button type="button" class="btn btn-secondary ms-2" id="cancelEditBtn">Cancel</button>
            </form>
        `;

        const form = document.getElementById('editPlayerForm');
        const cancelBtn = document.getElementById('cancelEditBtn');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const updates = {
                    name: form.playerName.value,
                    playerClass: form.playerClass.value,
                    level: parseInt(form.playerLevel.value, 10) || 1,
                    race: form.playerRace.value
                };

                this.playerManager.updatePlayer(playerId, updates);

                const ui = this.playerManager.playerUI || this.playerManager.ui;
                ui?.renderList();
                ui?.handleSelect(playerId);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.ui.showPlayerDetails(playerId);
            });
        }
    }

    formatClassName(className) {
        // Use the game data service to get the formatted class name
        return gameDataService.getClassName(className) || className;
    }
}
