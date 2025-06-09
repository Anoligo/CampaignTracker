import { BaseUI } from '../../../components/base-ui.js';
import { listView } from './quest-list-view.js';
import { detailsView } from './quest-details-view.js';
import { formHandler } from './quest-form-handler.js';

export class QuestUI extends BaseUI {
    constructor(questService, options = {}) {
        super();
        this.questService = questService;
        this.options = options;
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
            container: document.getElementById('quests-container') || document.createElement('div'),
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
