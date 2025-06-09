import { PlayerClass } from '../enums/player-enums.js';

export class PlayerForms {
    constructor(playerManager) {
        this.playerManager = playerManager;
        this.ui = playerManager.ui;
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
                <div class="mb-3">
                    <label for="playerName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="playerName" name="playerName" required>
                </div>
                <div class="mb-3">
                    <label for="playerClass" class="form-label">Class</label>
                    <select class="form-select" id="playerClass" name="playerClass" required>
                        <option value="">Select a class</option>
                        ${Object.entries(PlayerClass).map(([key, value]) => 
                            `<option value="${value}">${this.formatClassName(value)}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="playerLevel" class="form-label">Level</label>
                    <input type="number" class="form-control" id="playerLevel" name="playerLevel" value="1" min="1">
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
                this.playerManager.createNewPlayer(e.target);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                details.innerHTML = '<p class="text-muted">Select a player to view details</p>';
            });
        }
    }

    showEditPlayerForm(playerId) {
        const player = this.playerManager.service.getPlayerById(playerId);
        if (!player) return;

        const details = document.getElementById('playerDetails');
        details.innerHTML = `
            <h3>Edit Player</h3>
            <form id="editPlayerForm">
                <div class="mb-3">
                    <label for="playerName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="playerName" name="playerName" value="${player.name}" required>
                </div>
                <div class="mb-3">
                    <label for="playerClass" class="form-label">Class</label>
                    <select class="form-select" id="playerClass" name="playerClass" required>
                        ${Object.entries(PlayerClass).map(([key, value]) => 
                            `<option value="${value}" ${player.class === value ? 'selected' : ''}>
                                ${this.formatClassName(value)}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="playerLevel" class="form-label">Level</label>
                    <input type="number" class="form-control" id="playerLevel" name="playerLevel" value="${player.level}" min="1">
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
                this.playerManager.updatePlayer(playerId, e.target);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.ui.showPlayerDetails(playerId);
            });
        }
    }

    formatClassName(className) {
        if (!className) return '';
        return className
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
