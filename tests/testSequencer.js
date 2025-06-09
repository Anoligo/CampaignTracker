import Sequencer from '@jest/test-sequencer';

class CustomSequencer extends Sequencer {
    sort(tests) {
        // Sort tests to ensure setup tests run first
        return tests.sort((testA, testB) => {
            const setupA = testA.path.includes('setup.test.js');
            const setupB = testB.path.includes('setup.test.js');
            
            if (setupA && !setupB) return -1;
            if (!setupA && setupB) return 1;
            
            // Then sort by module dependencies
            const moduleOrder = {
                'entity.test.js': 1,
                'quests.test.js': 2,
                'notes.test.js': 3,
                'loot.test.js': 4,
                'locations.test.js': 5,
                'players.test.js': 6,
                'guild.test.js': 7
            };
            
            const moduleA = testA.path.split('/').pop();
            const moduleB = testB.path.split('/').pop();
            
            return (moduleOrder[moduleA] || 999) - (moduleOrder[moduleB] || 999);
        });
    }
}

export default CustomSequencer; 