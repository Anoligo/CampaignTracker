import { GuildService } from '@/scripts/modules/guild/services/guild-service.js';
import { DataService } from '@/scripts/modules/data/index.js';

let ds;
let service;

describe('GuildService', () => {
  beforeEach(() => {
    localStorage.clear();
    ds = new DataService();
    ds.clearData();
    ds.saveData = () => {};
    service = new GuildService(ds);
  });

  test('create, update and delete activity', () => {
    const act = service.createActivity({ name: 'Quest', description: '', type: 'quest' });
    expect(service.getAllActivities().length).toBe(1);
    const updated = service.updateActivity(act.id, { status: 'completed' });
    expect(updated.status).toBe('completed');
    service.deleteActivity(act.id);
    expect(service.getAllActivities().length).toBe(0);
  });

  test('create, update and delete resource', () => {
    const res = service.createResource({ name: 'Gold', description: '', type: 'gold', quantity: 5 });
    expect(service.getAllResources().length).toBe(1);
    const updated = service.updateResource(res.id, { quantity: 10 });
    expect(updated.quantity).toBe(10);
    service.deleteResource(res.id);
    expect(service.getAllResources().length).toBe(0);
  });
});
