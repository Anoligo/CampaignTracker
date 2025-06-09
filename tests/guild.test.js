import { GuildActivity, GuildResource, GuildManager, GuildActivityType, GuildResourceType } from '../scripts/modules/guild.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('GuildActivity', () => {
    test('should create a new activity with correct properties', () => {
        const activity = testHelpers.createMockGuildActivity();
        expect(activity.name).toBe('Test Activity');
        expect(activity.type).toBe(GuildActivityType.QUEST);
        expect(activity.description).toBe('A test activity');
        expect(activity.rewards).toEqual([]);
        expect(activity.participants).toEqual([]);
        expect(activity.status).toBe('pending');
        expect(activity.createdAt instanceof Date).toBe(true);
        expect(activity.updatedAt instanceof Date).toBe(true);
    });

    test('should add reward', () => {
        const activity = testHelpers.createMockGuildActivity();
        activity.addReward('gold');
        expect(activity.rewards).toContain('gold');
    });

    test('should add participant', () => {
        const activity = testHelpers.createMockGuildActivity();
        activity.addParticipant('player1');
        expect(activity.participants).toContain('player1');
    });

    test('should update status', () => {
        const activity = testHelpers.createMockGuildActivity();
        activity.updateStatus('completed');
        expect(activity.status).toBe('completed');
    });
});

describe('GuildResource', () => {
    test('should create a new resource with correct properties', () => {
        const resource = testHelpers.createMockGuildResource();
        expect(resource.name).toBe('Test Resource');
        expect(resource.type).toBe(GuildResourceType.GOLD);
        expect(resource.quantity).toBe(100);
        expect(resource.createdAt instanceof Date).toBe(true);
        expect(resource.updatedAt instanceof Date).toBe(true);
    });

    test('should add quantity', () => {
        const resource = testHelpers.createMockGuildResource();
        resource.addQuantity(50);
        expect(resource.quantity).toBe(150);
    });

    test('should remove quantity', () => {
        const resource = testHelpers.createMockGuildResource();
        resource.removeQuantity(30);
        expect(resource.quantity).toBe(70);
    });

    test('should not remove more than available', () => {
        const resource = testHelpers.createMockGuildResource();
        resource.removeQuantity(150);
        expect(resource.quantity).toBe(0);
    });

    test('should update name', () => {
        const resource = testHelpers.createMockGuildResource();
        resource.updateName('New Name');
        expect(resource.name).toBe('New Name');
    });

    test('should update type', () => {
        const resource = testHelpers.createMockGuildResource();
        resource.updateType('item');
        expect(resource.type).toBe('item');
    });
});

describe('GuildManager', () => {
    let guildManager;
    let dataManager;

    beforeEach(() => {
        dataManager = new MockDataManager();
        guildManager = new GuildManager(dataManager, true);
    });

    test('should initialize guild section', () => {
        const guildSection = document.getElementById('guild');
        expect(guildSection.innerHTML).toContain('Guild Logs');
        expect(guildSection.innerHTML).toContain('New Activity');
        expect(guildSection.innerHTML).toContain('New Resource');
    });

    test('should create new activity', () => {
        const form = testHelpers.createMockForm(mockFormValues.activity);
        guildManager.createNewActivity(form);
        expect(dataManager.appState.guildLogs.activities).toHaveLength(1);
        expect(dataManager.appState.guildLogs.activities[0].name).toBe('Test Activity');
    });

    test('should create new resource', () => {
        const form = testHelpers.createMockForm(mockFormValues.resource);
        guildManager.createNewResource(form);
        expect(dataManager.appState.guildLogs.resources).toHaveLength(1);
        expect(dataManager.appState.guildLogs.resources[0].name).toBe('Test Resource');
    });

    test('should filter activities by type', () => {
        const activity1 = testHelpers.createMockGuildActivity({ type: GuildActivityType.QUEST });
        const activity2 = testHelpers.createMockGuildActivity({ type: GuildActivityType.TRAINING });
        dataManager.appState.guildLogs.activities.push(activity1, activity2);
        guildManager.handleActivityTypeFilter(GuildActivityType.QUEST);
        const activityList = document.getElementById('activityList');
        expect(activityList.innerHTML).toContain('Test Activity');
        expect(activityList.innerHTML).not.toContain('Other Activity');
    });

    test('should search activities', () => {
        const activity1 = testHelpers.createMockGuildActivity({ name: 'Test Activity 1' });
        const activity2 = testHelpers.createMockGuildActivity({ name: 'Other Activity' });
        dataManager.appState.guildLogs.activities.push(activity1, activity2);
        guildManager.handleSearch('Test Activity 1');
        const activityList = document.getElementById('activityList');
        expect(activityList.innerHTML).toContain('Test Activity 1');
        expect(activityList.innerHTML).not.toContain('Other Activity');
    });

    test('should add reward to activity', () => {
        const activity = testHelpers.createMockGuildActivity();
        dataManager.appState.guildLogs.activities.push(activity);
        guildManager.addReward(activity.id, 'gold');
        expect(activity.rewards).toContain('gold');
    });

    test('should add participant to activity', () => {
        const activity = testHelpers.createMockGuildActivity();
        dataManager.appState.guildLogs.activities.push(activity);
        guildManager.addParticipant(activity.id, 'player1');
        expect(activity.participants).toContain('player1');
    });

    test('should update activity status', () => {
        const activity = testHelpers.createMockGuildActivity();
        dataManager.appState.guildLogs.activities.push(activity);
        guildManager.updateActivityStatus(activity.id, 'completed');
        expect(activity.status).toBe('completed');
    });

    test('should add resource quantity', () => {
        const resource = testHelpers.createMockGuildResource();
        dataManager.appState.guildLogs.resources.push(resource);
        guildManager.addResourceQuantity(resource.id, 50);
        expect(resource.quantity).toBe(150);
    });

    test('should remove resource quantity', () => {
        const resource = testHelpers.createMockGuildResource();
        dataManager.appState.guildLogs.resources.push(resource);
        guildManager.removeResourceQuantity(resource.id, 30);
        expect(resource.quantity).toBe(70);
    });

    test('should update resource name', () => {
        const resource = testHelpers.createMockGuildResource();
        dataManager.appState.guildLogs.resources.push(resource);
        const form = testHelpers.createMockForm({ resourceName: 'New Name' });
        guildManager.updateResourceName(resource.id, form);
        expect(resource.name).toBe('New Name');
    });

    test('should update resource type', () => {
        const resource = testHelpers.createMockGuildResource();
        dataManager.appState.guildLogs.resources.push(resource);
        const form = testHelpers.createMockForm({ resourceType: 'item' });
        guildManager.updateResourceType(resource.id, form);
        expect(resource.type).toBe('item');
    });
}); 