/*
Maze with Conditions Grading Script
Alex Reyes Aranda Fall 2024
*/


require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.backdropProject = { bool: false, str: "I chose or designed a backdrop."};
        this.requirements.threeSpritesProject = { bool: false, str: "I added (3) backdrop sprites or objects."};
        this.requirements.threeCostumesProject = { bool: false, str: "Main sprite has at least (3) costumes"}; // this one
        this.requirements.validOriginProject = { bool: false, str: "Main sprite has script to start with same costume and location when green flag clicked."};
        this.requirements.saysDirectionsProject = { bool: false, str: "Main sprite says directions when green flag clicked."};
        this.requirements.mazeConditionsProject = { bool: false, str: "Main sprite has a script with a forever loop and 2 different conditions with actions."};
    }

    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        this.requirements.backdropProject.bool = stage != null && stage.costumes.length >= 1;
        this.requirements.threeSpritesProject.bool = sprites.length >= 3;

        function procSprite(sprite){
            // evaluating a single sprite
            var out = { threeCostumesSprite: false, validOriginSprite: false, saysDirectionsSprite: false, mazeConditionsSprite: false};
            out.threeCostumesSprite = sprite.costumes.length >= 3;
            out.validOriginSprite = sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenflagclicked") && s.blocks.some(b=>b.opcode.includes("motion_gotoxy") && s.blocks.some(b=>b.opcode.includes("looks_switchcostumeto"))));
            out.saysDirectionsSprite = sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenflagclicked") && s.blocks.some(b=>b.opcode.includes("looks_say")));
            out.mazeConditionsSprite = sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_") && s.blocks.some(b=>b.opcode.includes("control_forever") && s.blocks.filter(b=>b.opcode.includes("control_if"))));
            return out;
        }
        // we just want to check that at least two sprites have all the requirements
        var results = sprites.map(procSprite);
        this.requirements.threeCostumesProject.bool = results.map(o=>o.threeCostumesSprite).includes(true);
        this.requirements.validOriginProject.bool = results.map(o=>o.validOriginSprite).includes(true);
        this.requirements.saysDirectionsProject.bool = results.map(o=>o.saysDirectionsSprite).includes(true);
        this.requirements.mazeConditionsProject.bool = results.map(o=>o.mazeConditionsSprite).includes(true);
        
        console.log("-- DEBUG --");

        return;
    }
}