/*
Dialog Project Grading Script
Alex Reyes Aranda Fall 2024
*/


require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        // include something that signifies that this is testing for all sprites
        this.requirements.twoSpritesPresentProject = { bool: false, str: "At least (2) sprites are present and the requirements will be tested on them."};
        this.requirements.repeatMoreThanOnceProject = { bool: false, str: "There is a script that does something more than once."};
        this.requirements.synchScriptsProject = { bool: false, str: "There are at least (2) scripts that are running at the same time."};
        this.requirements.sayOrThinkProject = { bool: false, str: "There is a 'Say' or 'Think' block."};
        this.requirements.validOriginProject = { bool: false, str: "The sprites start at the same place and have same costume when green flag clicked."};
        this.requirements.usedTwoOrMoreProject = { bool: false, str: "Used 2 or more of Looks, Motion, or Sound blocks."};
    }

    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);
        this.requirements.twoSpritesPresentProject.bool = sprites.length >= 2;

        function collectHeads(inputScripts) {
            let headCollector = {};
            let heads = inputScripts.map(s=>s[0] && s[0].opcode.includes("event_"));
            for (let i = 0; i <= heads.length; i++) {
                if (!(`${heads[i]}` in headCollector)) {
                    headCollector[heads[i]] = 1;
                } else {
                    if (`${heads[i]}` in headCollector) {
                        headCollector[heads[i]] += 1;
                    }
                }
            }
            return Object.values(headCollector).some(val=>val>=2);
        }

        function procSprite(sprite){
            // evaluating a single sprite
            var out = { repeatMoreThanOnceSprite: false, synchScriptsSprite: false, sayOrThinkSprite: false, validOriginSprite: false, usedTwoOrMoreSprite: false};
            out.repeatMoreThanOnceSprite = sprite.scripts.some(s=>s.blocks.some(b=>b.opcode.includes("control_repeat") || b.opcode.includes("control_forever")));
            out.synchScriptsSprite = collectHeads(sprite.scripts);
            out.sayOrThinkSprite = sprite.scripts.some(s=>s.blocks.some(b=>b.opcode.includes("looks_say") || b.opcode.includes("looks_think")));
            out.validOriginSprite = sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenflagclicked") && s.blocks.some(b=>b.opcode.includes("motion_gotoxy") && s.blocks.some(b=>b.opcode.includes("looks_switchcostumeto"))));

            let looksBlocksBoolArray = sprite.scripts.map(s=>s.blocks.map(b=>b.opcode.includes("looks_say"))).filter(s=>s.includes(true)).map(sf=>sf.filter(t=>t));
            looksBlocksBoolArray.filter(b=>b.length >= 1);
            let looksBlocksBool = looksBlocksBoolArray.length >= 2 || looksBlocksBoolArray.some(t=>t.length >= 2);

            let motionBlocksBoolArray = sprite.scripts.map(s=>s.blocks.map(b=>b.opcode.includes("motion_"))).filter(s=>s.includes(true)).map(sf=>sf.filter(t=>t));
            motionBlocksBoolArray.filter(b=>b.length >= 1);
            let motionBlocksBool = motionBlocksBoolArray.length >= 2 || motionBlocksBoolArray.some(t=>t.length >= 2);

            let soundBlocksBoolArray = sprite.scripts.map(s=>s.blocks.map(b=>b.opcode.includes("sound_"))).filter(s=>s.includes(true)).map(sf=>sf.filter(t=>t));
            soundBlocksBoolArray.filter(b=>b.length >= 1);
            let soundBlocksBool = soundBlocksBoolArray.length >= 2 || soundBlocksBoolArray.some(t=>t.length >= 2);

            out.usedTwoOrMoreSprite = looksBlocksBool || motionBlocksBool || soundBlocksBool;

            return out;
        }
        // we just want to check that at least two sprites have all the requirements
        var results = sprites.map(procSprite);

        this.requirements.repeatMoreThanOnceProject.bool = results.filter(o=>o.repeatMoreThanOnceSprite).length >= 2;
        this.requirements.synchScriptsProject.bool = results.filter(o=>o.synchScriptsSprite).length >= 2;
        this.requirements.sayOrThinkProject.bool = results.filter(o=>o.sayOrThinkSprite).length >= 2;
        this.requirements.validOriginProject.bool = results.filter(o=>o.validOriginSprite).length >= 2;
        this.requirements.usedTwoOrMoreProject.bool = results.filter(o=>o.usedTwoOrMoreSprite).length >= 2;
        
        console.log("-- DEBUG --");

        return;
    }
}