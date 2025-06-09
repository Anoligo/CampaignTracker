import { GuildActivity } from '../models/guild-activity-model.js';
import { GuildResource } from '../models/guild-resource-model.js';

export class GuildService {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.initializeGuildData();
    }

    initializeGuildData() {
        if (!this.dataManager.appState.guildLogs) {
            this.dataManager.appState.guildLogs = {
                activities: [],
                resources: []
            };
        }
    }

    // Activity methods
    getAllActivities() {
        return this.dataManager.appState.guildLogs.activities || [];
    }

    getActivityById(id) {
        return this.getAllActivities().find(activity => activity.id === id);
    }

    createActivity(activityData) {
        const activities = this.getAllActivities();
        const newActivity = new GuildActivity(
            activityData.name,
            activityData.description,
            activityData.type,
            activityData.createdAt,
            activityData.updatedAt
        );
        
        if (activityData.id) newActivity.id = activityData.id;
        if (activityData.status) newActivity.status = activityData.status;
        if (activityData.rewards) newActivity.rewards = [...activityData.rewards];
        if (activityData.participants) newActivity.participants = [...activityData.participants];
        
        activities.push(newActivity);
        this.saveActivities(activities);
        return newActivity;
    }

    updateActivity(id, updates) {
        const activities = this.getAllActivities();
        const index = activities.findIndex(a => a.id === id);
        
        if (index === -1) return null;
        
        const updatedActivity = { ...activities[index], ...updates, updatedAt: new Date() };
        activities[index] = updatedActivity;
        this.saveActivities(activities);
        
        return updatedActivity;
    }

    deleteActivity(id) {
        const activities = this.getAllActivities().filter(a => a.id !== id);
        this.saveActivities(activities);
        return true;
    }

    // Resource methods
    getAllResources() {
        return this.dataManager.appState.guildLogs.resources || [];
    }

    getResourceById(id) {
        return this.getAllResources().find(resource => resource.id === id);
    }

    createResource(resourceData) {
        const resources = this.getAllResources();
        const newResource = new GuildResource(
            resourceData.name,
            resourceData.description,
            resourceData.type,
            resourceData.quantity,
            resourceData.createdAt,
            resourceData.updatedAt
        );
        
        if (resourceData.id) newResource.id = resourceData.id;
        
        resources.push(newResource);
        this.saveResources(resources);
        return newResource;
    }

    updateResource(id, updates) {
        const resources = this.getAllResources();
        const index = resources.findIndex(r => r.id === id);
        
        if (index === -1) return null;
        
        const updatedResource = { ...resources[index], ...updates, updatedAt: new Date() };
        resources[index] = updatedResource;
        this.saveResources(resources);
        
        return updatedResource;
    }

    deleteResource(id) {
        const resources = this.getAllResources().filter(r => r.id !== id);
        this.saveResources(resources);
        return true;
    }

    // Helper methods
    saveActivities(activities) {
        this.dataManager.appState.guildLogs.activities = activities;
        this.dataManager.saveData();
    }

    saveResources(resources) {
        this.dataManager.appState.guildLogs.resources = resources;
        this.dataManager.saveData();
    }
}
