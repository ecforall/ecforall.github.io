/*
Place holder code for myVacation grading script
Previously [Previous Project Placeholder]
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.imagesPresent = { bool: false, str: "I used a backdrop and 2 sprites" };
        this.requirements.Resets = {bool: false, str: "Beginning: Reset position and costume of at least two sprites when the green flag is pressed." };
        this.requirements.Loops = {bool: false, str: "Middle: Repeat loops used to make two sprites move" };
        this.requirements.myVacation = {bool: false, str: "End: Sprite said what I did during my vacation" };
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        function procSprite(sprite){
            // evaluating a single sprite
            var out = { spriteResets: false, spriteLoops: false, spriteSays: false };
            out.spriteResets = (sprites.includes(sprite)) ? sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenflagclicked") && s.blocks.some(b=>b.opcode.includes("looks_switchcostumeto") && s.blocks.some(b=>b.opcode.includes("motion_")))): false;
            out.spriteLoops = (sprites.includes(sprite)) ? sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenthisspriteclicked") || s.blocks[0].opcode.includes("event_whenkeypressed")) && sprite.scripts.some(s=>s.blocks.some(b=>b.opcode.includes("control_repeat") && b.subscripts[0].blocks.length >= 3)): false; //check for 3 or more blocks
            out.spriteSays = (sprites.includes(sprite)) ? sprite.scripts.some(s=>s.blocks.some(b=>b.opcode.includes("looks_sa"))) : false;
            return out;
        }
        var results = sprites.map(procSprite);

        this.requirements.imagesPresent.bool = stage.costumes.length >= 2 && sprites.length >= 2;
        this.requirements.Resets.bool = results.filter(c=>c.spriteResets).length >= 2;
        this.requirements.Loops.bool = results.filter(c=>c.spriteLoops).length >= 2;
        this.requirements.myVacation.bool = results.filter(c=>c.spriteSays).length >= 1;
        console.log("Reminder! 2nd and 3rd requirements must be fulfilled for scripts in sprites only (No backdrops)");
        console.log("-- DEBUG --");
        console.log("imagesPresent: ", stage.length, sprites.length);
        console.log("Resets: ", results.filter(c=>c.spriteResets));
        console.log("Loops: ", results.filter(c=>c.spriteLoops));
        console.log("myVacation: ", results.filter(c=>c.spriteSays));

        return;
    }
}