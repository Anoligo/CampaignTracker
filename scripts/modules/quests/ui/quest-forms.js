import { QuestType, QuestStatus } from '../enums/quest-enums.js';

export class QuestForms {
    static getNewQuestForm() {
        return `
            <form id="newQuestForm" class="mb-3">
                <div class="mb-3">
                    <label for="questTitle" class="form-label">Title</label>
                    <input type="text" class="form-control" id="questTitle" name="title" required>
                </div>
                <div class="mb-3">
                    <label for="questDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="questDescription" name="description" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label for="questType" class="form-label">Type</label>
                    <select class="form-select" id="questType" name="type" required>
                        <option value="${QuestType.MAIN}">Main Quest</option>
                        <option value="${QuestType.SIDE}">Side Quest</option>
                        <option value="${QuestType.GUILD}">Guild Quest</option>
                        <option value="${QuestType.OTHER}">Other</option>
                    </select>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-secondary me-2" id="cancelQuestBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Quest</button>
                </div>
            </form>
        `;
    }

    static getEditQuestForm(quest) {
        return `
            <form id="editQuestForm" class="mb-3">
                <div class="mb-3">
                    <label for="editQuestTitle" class="form-label">Title</label>
                    <input type="text" class="form-control" id="editQuestTitle" name="title" value="${quest.name || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="editQuestDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="editQuestDescription" name="description" rows="3">${quest.description || ''}</textarea>
                </div>
                <div class="mb-3">
                    <label for="editQuestType" class="form-label">Type</label>
                    <select class="form-select" id="editQuestType" name="type" required>
                        <option value="${QuestType.MAIN}" ${quest.type === QuestType.MAIN ? 'selected' : ''}>Main Quest</option>
                        <option value="${QuestType.SIDE}" ${quest.type === QuestType.SIDE ? 'selected' : ''}>Side Quest</option>
                        <option value="${QuestType.GUILD}" ${quest.type === QuestType.GUILD ? 'selected' : ''}>Guild Quest</option>
                        <option value="${QuestType.OTHER}" ${!Object.values(QuestType).includes(quest.type) ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="editQuestStatus" class="form-label">Status</label>
                    <select class="form-select" id="editQuestStatus" name="status" required>
                        <option value="${QuestStatus.AVAILABLE}" ${quest.status === QuestStatus.AVAILABLE ? 'selected' : ''}>Available</option>
                        <option value="${QuestStatus.ONGOING}" ${quest.status === QuestStatus.ONGOING ? 'selected' : ''}>Ongoing</option>
                        <option value="${QuestStatus.COMPLETED}" ${quest.status === QuestStatus.COMPLETED ? 'selected' : ''}>Completed</option>
                        <option value="${QuestStatus.FAILED}" ${quest.status === QuestStatus.FAILED ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-secondary me-2" id="cancelEditBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
    }

    static getJournalEntryForm() {
        return `
            <form id="addJournalEntryForm" class="mb-3">
                <div class="mb-3">
                    <label for="journalEntryContent" class="form-label">New Journal Entry</label>
                    <textarea class="form-control" id="journalEntryContent" name="content" rows="3" required></textarea>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-secondary me-2" id="cancelJournalEntryBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Entry</button>
                </div>
            </form>
        `;
    }
}
