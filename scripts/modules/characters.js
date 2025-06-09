export class Character {
    constructor(name, race, classType, level = 1, createdAt, updatedAt) {
        this.id = Date.now();
        this.name = name;
        this.race = race;
        this.classType = classType;
        this.level = level;
        this.attributes = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        };
        this.skills = [];
        this.inventory = [];
        this.quests = [];
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
        this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt || Date.now());
    }

    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    updateRace(newRace) {
        this.race = newRace;
        this.updatedAt = new Date();
    }

    updateClass(newClass) {
        this.classType = newClass;
        this.updatedAt = new Date();
    }

    updateLevel(newLevel) {
        this.level = newLevel;
        this.updatedAt = new Date();
    }

    updateAttribute(attribute, value) {
        if (this.attributes.hasOwnProperty(attribute)) {
            this.attributes[attribute] = value;
            this.updatedAt = new Date();
        }
    }

    addSkill(skill) {
        if (!this.skills.includes(skill)) {
            this.skills.push(skill);
            this.updatedAt = new Date();
        }
    }

    removeSkill(skill) {
        this.skills = this.skills.filter(s => s !== skill);
        this.updatedAt = new Date();
    }

    addToInventory(item) {
        this.inventory.push(item);
        this.updatedAt = new Date();
    }

    removeFromInventory(item) {
        this.inventory = this.inventory.filter(i => i !== item);
        this.updatedAt = new Date();
    }

    addQuest(quest) {
        if (!this.quests.includes(quest)) {
            this.quests.push(quest);
            this.updatedAt = new Date();
        }
    }

    removeQuest(quest) {
        this.quests = this.quests.filter(q => q !== quest);
        this.updatedAt = new Date();
    }
} 