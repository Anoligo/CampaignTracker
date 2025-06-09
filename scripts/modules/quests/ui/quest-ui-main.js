import { BaseUI } from '../../../components/base-ui.js';
import { listView } from './quest-list-view.js';
import { detailsView } from './quest-details-view.js';
import { formHandler } from './quest-form-handler.js';

export class QuestUI extends BaseUI {
    constructor(questService, dataManager = null) {
        super({
            containerId: 'quests',
            listId: 'questList',
            detailsId: 'questDetails',
            searchId: 'questSearch',
            addButtonId: 'addQuestBtn',
            entityName: 'quest',
            getAll: () => questService.getAllQuests(),
            getById: (id) => questService.getQuestById(id),
            add: (quest) => questService.createQuest(quest),
            update: (id, updates) => questService.updateQuest(id, updates),
            delete: (id) => questService.deleteQuest(id)
        });

        this.questService = questService;
        this.dataManager = dataManager;
        this.currentQuest = null;
        this.isEditing = false;
        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    cacheElements() {
        this.elements = {
            // Use the existing quests section as the container. The previous
            // selector referenced a non-existent "quests-container" element
            // which caused the cached buttons to point to detached elements.
            container: document.getElementById('quests') || document.createElement('div'),
            list: document.getElementById('questList') || document.createElement('div'),
            details: document.getElementById('questDetails') || document.createElement('div'),
            search: document.getElementById('questSearch') || document.createElement('input'),
            addButton: document.getElementById('addQuestBtn') || document.createElement('button'),
            editButton: document.getElementById('editQuestBtn') || document.createElement('button'),
            deleteButton: document.getElementById('deleteQuestBtn') || document.createElement('button')
        };
    }

    bindEvents() {
        const { addButton, editButton, deleteButton, search } = this.elements;
        addButton.addEventListener('click', () => this.showQuestForm());
        editButton.addEventListener('click', () => {
            if (this.currentQuest) {
                this.showQuestForm(this.currentQuest);
            }
        });
        deleteButton.addEventListener('click', () => {
            if (this.currentQuest) {
                this.deleteQuest(this.currentQuest.id);
            }
        });
        search.addEventListener('input', (e) => this.filterQuests(e.target.value));
    }

    render() {
        this.renderQuestList();
        if (this.currentQuest) {
            this.renderQuestDetails(this.currentQuest);
        }
    }

    initializeUI() {
        this.initialize();
    }
}

Object.assign(QuestUI.prototype, listView, detailsView, formHandler);
