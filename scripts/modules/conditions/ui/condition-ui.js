import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel } from '../../../components/ui-components.js';

export class ConditionUI extends BaseUI {
    constructor(service, dataManager) {
        super({
            containerId: 'conditions',
            listId: 'conditionList',
            detailsId: 'conditionDetails',
            searchId: 'conditionSearch',
            addButtonId: 'addConditionBtn',
            entityName: 'condition',
            getAll: () => service.getAllConditions(),
            getById: id => service.getConditionById(id),
            add: data => service.createCondition(data),
            update: (id, updates) => service.updateCondition(id, updates),
            delete: id => service.deleteCondition(id)
        });
        this.service = service;
        this.dataManager = dataManager;
    }

    createListItem(cond) {
        return createListItem({
            id: cond.id,
            title: cond.name,
            subtitle: cond.type,
            isSelected: this.currentEntity && this.currentEntity.id === cond.id,
            onClick: this.handleSelect
        });
    }

    renderDetails(cond) {
        if (!cond) {
            this.detailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-skull-crossbones fa-3x mb-3"></i>
                    <p class="empty-state-message">Select a condition to view details</p>
                </div>`;
            return;
        }

        const relatedPlayers = (cond.affectedCharacterIds || [])
            .map(id => this._findName('players', id)).join(', ') || 'None';
        const relatedItems = (cond.relatedItemIds || [])
            .map(id => this._findName('loot', id)).join(', ') || 'None';

        const panel = createDetailsPanel({
            title: cond.name,
            rows: [
                { label: 'Type', value: cond.type },
                { label: 'Effect', value: cond.effect },
                { label: 'Duration', value: cond.duration || '–' },
                { label: 'Magical', value: cond.isMagical ? 'Yes' : 'No' },
                { label: 'Stackable', value: cond.canStack ? 'Yes' : 'No' },
                { label: 'Notes', value: cond.notes || '' },
                { label: 'Players', value: relatedPlayers },
                { label: 'Items', value: relatedItems }
            ]
        });
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(panel);
    }

    _findName(collection, id) {
        const list = this.dataManager.appState[collection] || [];
        const item = list.find(e => e.id === id);
        return item ? (item.name || item.title) : id;
    }
}
