/*
shapesQuest grading script
Alex Reyes Aranda Summer 2024
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.createFunction = { bool: false, str: "Create custom function and name it."};
        this.requirements.validFunction = { bool: false, str: "Custom function has the right repeating blocks."};
        this.requirements.usedFunction = { bool: false, str: "Three custom function blocks under 'When this sprite is clicked'"};

        this.extensions.turnBlocksAdded = { bool: false, str: "'Turn 15' blocks added in between custom function blocks under 'When this sprite is clicked'"};
        this.extensions.penColorChanges = { bool: false, str: "'Change pen color (30)' blocks added in between turn blocks under 'When this sprite is clicked'"};
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        function scriptHasBlock(script_input, block_input) {
            return script_input.blocks.some(b=>b.opcode.includes(block_input));
        }
        function checkColorChange(block_input, color_val) {
            return block_input.opcode.includes("pen_changePenColorParamBy") && block_input.inputs.VALUE[1][1] == color_val;
        }

        function procSprite(sprite){
            console.log("sprite: ", sprite);
            console.log("scripts: ", sprite.scripts);
            // evaluating a single sprite
            var out = { hasFunction: false, repeatingBlocks: false, addedFunctions: false, turnBlocks: false, penColor: false};
            out.hasFunction = sprite.scripts.some(s=>s.blocks.some(b=>b.opcode.includes("procedures_definition")));
            out.repeatingBlocks = sprite.scripts.some(s=>s.blocks[0].opcode.includes("procedures_definition") && scriptHasBlock(s, "motion_movesteps") && scriptHasBlock(s, "control_wait") && scriptHasBlock(s,"motion_turnleft"));
            out.addedFunctions = sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_whenthisspriteclicked") && s.blocks.filter(b=>b.opcode.includes("procedures_call")).length == 3);
            let scriptTail = sprite.scripts.find(s=>s.blocks[0].opcode.includes("event_whenthisspriteclicked")).blocks.filter(b=>b.opcode.includes("procedures_call") || b.opcode.includes("motion_turnright") || b.opcode.includes("pen_changePenColorParamBy"));

            out.turnBlocks = (out.addedFunctions && scriptTail != null && scriptTail.length == 7) ? scriptTail[1].opcode.includes("motion_turnright") && scriptTail[4].opcode.includes("motion_turnright"): false;
            out.penColor = (out.turnBlocks) ? checkColorChange(scriptTail[2], '30') && checkColorChange(scriptTail[5], '30'): false;

            return out;
        }
        var results = sprites.map(procSprite);
        this.requirements.createFunction.bool = results.filter(o=>o.hasFunction).length >= 1;
        this.requirements.validFunction.bool = results.filter(o=>o.repeatingBlocks).length >= 1;
        this.requirements.usedFunction.bool = results.filter(o=>o.addedFunctions).length >= 1;

        this.extensions.turnBlocksAdded.bool = results.filter(o=>o.turnBlocks).length >= 1;
        this.extensions.penColorChanges.bool = results.filter(o=>o.penColor).length >= 1; 
        
        console.log("-- DEBUG --");
        console.log("It is best to have all your scripts under one sprite with starter name 'drawtriangle2'");
        

        return;
    }
}