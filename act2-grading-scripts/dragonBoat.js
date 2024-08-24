/*
dragonBoat grading script
Alex Reyes Aranda Summer 2024
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.RedFinishes = { bool: false, str: "The red boat reaches the end of the stage."};
        this.requirements.FishMoves = { bool: false, str: "Used 'when right arrow clicked' to loop and move the fish."};
        this.requirements.FishResets = { bool: false, str: "Used 'when green flag clicked' and goto block to start the first in the middle of stage."};
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);
        let redBoatSprite = project.targets.find(t=>t.name == "red dragon boat2");
        let fishSprite = project.targets.find(t=>t.name == "Fish");
        const validTimes = Array.from({length: 35 - 30 + 1}, (_, i) => 30 + i).map(String);
        const middleX = 18;
        const middleY = -35;
        const middleOffset = 92;
        this.requirements.RedFinishes.bool = (redBoatSprite != null) ? redBoatSprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenkeypressed") && s.blocks.some(b=>b.opcode.includes("control_repeat") && validTimes.includes(b.inputs.TIMES[1][1]))): false;
        this.requirements.FishMoves.bool = (fishSprite != null) ? fishSprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenkeypressed") && s.blocks.some(b=>b.opcode.includes("control_repeat") && b.subscripts.length >= 1 && b.subscripts[0].blocks.some(b=>b.opcode.includes("motion_movesteps")))): false;
        this.requirements.FishResets.bool = (fishSprite != null) ? fishSprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenflagclicked") && s.blocks.some(b=>b.opcode.includes("motion_gotoxy") && -74 <= Number(b.inputs.X[1][1]) <= 100 && -127 <= Number(b.inputs.Y[1][1]) <= 57)): false;

        // function procSprite(sprite){
        //     // evaluating a single sprite
        //     var out = { movesFish: false, spriteSays: false };
        //     return out;
        // }
        // var results = sprites.map(procSprite);
        
        console.log("-- DEBUG --");
        console.log("redboat must be named: red dragon boat2");
        console.log("fish must be named: Fish");
        console.log(redBoatSprite);
        console.log(fishSprite);

        return;
    }
}