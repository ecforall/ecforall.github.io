/*
Act 1 AboutMe Grading Script
Updated by: Alex Reyes, Spring 2025
*/
require('../grading-scripts-s3/scratch3')


module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        // done
        this.requirements.hasOneSprite = { bool: false, str: 'Project has at least one sprite' };
        this.requirements.hasTwoSprites = { bool: false, str: 'Project has at least two sprites' };
        this.requirements.hasThreeSprites = { bool: false, str: 'Project has at least three sprites' };
        
        this.requirements.hasOneSpeakingInteractive = { bool: false, str: 'Project has at least one sprite that says or thinks' };
        this.requirements.hasTwoSpeakingInteractive = { bool: false, str: 'Project has at least two sprites that says or thinks' };
        this.requirements.hasThreeSpeakingInteractive = { bool: false, str: 'Project has at least three sprites that says or thinks' };

        this.requirements.oneInteractive = { bool: false, str: 'Project has one sprite with at least three actions' };
        this.requirements.twoInteractive = { bool: false, str: 'Project has two sprites with at least three actions' };
        this.requirements.threeInteractive = { bool: false, str: 'Project has three sprites with at least three actions' };

        this.requirements.hasBackdrop = { bool: false, str: 'This project has a backdrop' };
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        function procSprite(sprite){
            // evaluating a single sprite
            var out = { hasInteractive: false, hasSayOrThink: false };

            var available_scripts = sprite.scripts.filter(s=>s.blocks[0].opcode.includes("event_whenthisspriteclicked"));
            out.hasInteractive = available_scripts.some(s=>s.blocks.length > 4);
            out.hasSayOrThink = available_scripts.some(s=>s.blocks.some(block=>block.opcode.includes("looks_say") || s.blocks.some(block=>block.opcode.includes("looks_think"))));
            return out;
        }

        // takes care of backdrop
        this.requirements.hasBackdrop.bool = stage.costumes.length > 1;
        // takes care of 1,2,3 sprites
        this.requirements.hasOneSprite.bool = sprites.length >= 1;
        this.requirements.hasTwoSprites.bool = sprites.length >= 2;
        this.requirements.hasThreeSprites.bool = sprites.length >= 3;

        var results = sprites.map(procSprite); // applies grading function to each sprite
        
        if (sprites.length >= 1){
            this.requirements.hasOneSpeakingInteractive.bool = results.filter(c=>c.hasSayOrThink).length >= 1;
            this.requirements.hasTwoSpeakingInteractive.bool = results.filter(c=>c.hasSayOrThink).length >= 2;
            this.requirements.hasThreeSpeakingInteractive.bool = results.filter(c=>c.hasSayOrThink).length >= 3;

            this.requirements.oneInteractive.bool = results.filter(c=>c.hasInteractive).length >= 1;
            this.requirements.twoInteractive.bool = results.filter(c=>c.hasInteractive).length >= 2;
            this.requirements.threeInteractive.bool = results.filter(c=>c.hasInteractive).length >= 3;
        }
        console.log("results: ", results);

        return;
    }
}