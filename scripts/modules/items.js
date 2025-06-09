class ItemsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.initializeItemsSection();
    }

    initializeItemsSection() {
        // ... existing initialization code ...
    }

    createNewItem(form) {
        if (!form || !form.itemName?.value || !form.itemType?.value || !form.itemDescription?.value) {
            throw new Error('Invalid form data');
        }
        const item = new Item(
            form.itemName.value,
            form.itemType.value,
            form.itemDescription.value
        );
        this.dataManager.addItem(item);
        this.renderItemList();
    }

    updateItemName(itemId, form) {
        if (!form || !form.name?.value) {
            throw new Error('Invalid form data');
        }
        const item = this.dataManager.getItemById(itemId);
        item.name = form.name.value;
        this.renderItemList();
    }

    updateItemType(itemId, form) {
        if (!form || !form.type?.value) {
            throw new Error('Invalid form data');
        }
        const item = this.dataManager.getItemById(itemId);
        item.type = form.type.value;
        this.renderItemList();
    }

    updateItemDescription(itemId, form) {
        if (!form || !form.description?.value) {
            throw new Error('Invalid form data');
        }
        const item = this.dataManager.getItemById(itemId);
        item.description = form.description.value;
        this.renderItemList();
    }

    addItemQuest(itemId, form) {
        if (!form || !form.questId?.value) {
            throw new Error('Invalid form data');
        }
        const item = this.dataManager.getItemById(itemId);
        item.addQuest(form.questId.value);
        this.renderItemList();
    }

    addItemLocation(itemId, form) {
        if (!form || !form.locationId?.value) {
            throw new Error('Invalid form data');
        }
        const item = this.dataManager.getItemById(itemId);
        item.addLocation(form.locationId.value);
        this.renderItemList();
    }

    handleTypeFilter(type) {
        const items = this.dataManager.appState.items;
        const filteredItems = type === 'all' ? items : items.filter(item => item.type === type);
        this.renderItemList(filteredItems);
    }

    handleSearch(query) {
        if (!query) {
            this.renderItemList();
            return;
        }
        const items = this.dataManager.appState.items;
        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderItemList(filteredItems);
    }

    renderItemList(items = this.dataManager.appState.items) {
        const itemList = document.getElementById('itemList');
        if (!itemList) return;

        itemList.innerHTML = items.map(item => `
            <a href="#" class="list-group-item list-group-item-action" data-item-id="${item.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${item.name}</h5>
                    <small class="text-muted">${item.type}</small>
                </div>
                <p class="mb-1">${item.description}</p>
                <div>
                    <span class="badge bg-primary">${item.type}</span>
                    <small class="text-muted ms-2">Last updated: ${item.updatedAt.toLocaleDateString()}</small>
                </div>
            </a>
        `).join('');
    }
} 