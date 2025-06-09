import { PlayerService } from './services/player-service.js';
import { PlayerUI } from './ui/player-ui-new.js';
import { PlayerForms } from './ui/player-forms.js';

export class PlayersManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        this.service = new PlayerService(dataManager);
        this.ui = new PlayerUI(this);
        this.forms = new PlayerForms(this);
        
        if (!isTest) {
            // Create sample players if none exist
            if (this.service.getAllPlayers().length === 0) {
                this.createSamplePlayers();
            }
            
            this.initialize();
        }
    }
    
    /**
     * Create sample players for testing
     */
    createSamplePlayers() {
        const samplePlayers = [
            { name: 'Thordak', class: 'fighter', level: 5 },
            { name: 'Elara', class: 'wizard', level: 4 },
            { name: 'Grimm', class: 'rogue', level: 3 },
            { name: 'Seraphina', class: 'cleric', level: 4 }
        ];
        
        samplePlayers.forEach(player => {
            this.service.createPlayer(player.name, player.class, player.level);
        });
        
        console.log('Created sample players');
    }

    initialize() {
        // The new PlayerUI class extends BaseUI which handles initialization
        // No need to call initializePlayersSection anymore
        this.setupEventListeners();
        this.ui.renderList();  // Use renderList instead of renderPlayerList
    }

    setupEventListeners() {
        // The BaseUI class now handles most of the event listeners
        // We only need to set up custom event listeners here
        
        // Handle class filter clicks
        document.addEventListener('click', (e) => {
            const classFilterItem = e.target.closest('[data-class]');
            if (classFilterItem) {
                e.preventDefault();
                const className = classFilterItem.getAttribute('data-class');
                this.filterPlayersByClass(className);
            }
            
            // Handle new player button
            if (e.target.matches('#addPlayerBtn')) {
                e.preventDefault();
                this.forms.showNewPlayerForm();
            }
        });
    }

    // Player CRUD Operations
    createNewPlayer(form) {
        try {
            if (!form || !form.playerName?.value || !form.playerClass?.value) {
                throw new Error('Missing required fields');
            }
            
            const player = this.service.createPlayer(
                form.playerName.value,
                form.playerClass.value,
                parseInt(form.playerLevel?.value) || 1
            );
            
            this.ui.renderList();
            this.ui.handleSelect(player.id);
            
            // Reset the form
            form.reset();
            
        } catch (error) {
            console.error('Error creating new player:', error);
            alert(`Failed to create player: ${error.message}`);
        }
    }

    updatePlayer(playerId, form) {
        try {
            if (!form || !form.playerName?.value || !form.playerClass?.value) {
                throw new Error('Missing required fields');
            }
            
            const updates = {
                name: form.playerName.value,
                class: form.playerClass.value,
                level: parseInt(form.playerLevel?.value) || 1
            };
            
            this.service.updatePlayer(playerId, updates);
            this.ui.renderList();
            this.ui.handleSelect(playerId);
            
        } catch (error) {
            console.error('Error updating player:', error);
            alert(`Failed to update player: ${error.message}`);
        }
    }

    deletePlayer(playerId) {
        try {
            const success = this.service.deletePlayer(playerId);
            if (success) {
                this.ui.renderList();
                // Clear player details - the BaseUI class will handle showing the empty state
                this.ui.clearDetails();
            }
        } catch (error) {
            console.error('Error deleting player:', error);
            alert(`Failed to delete player: ${error.message}`);
        }
    }

    // Helper Methods
    filterPlayersByClass(className) {
        if (className === 'all') {
            this.ui.renderList();
            return;
        }
        
        const filteredPlayers = this.service.getAllPlayers().filter(
            player => player.class === className
        );
        this.ui.renderList(filteredPlayers);
    }

    searchPlayers(term) {
        if (!term) {
            this.ui.renderList();
            return;
        }
        
        const filteredPlayers = this.service.getAllPlayers().filter(
            player => player.name.toLowerCase().includes(term.toLowerCase())
        );
        this.ui.renderList(filteredPlayers);
    }
}
