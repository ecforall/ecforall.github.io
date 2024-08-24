/*
graphProject.js (previously condLoopsL1)
Alex Reyes Aranda Summer 2024
*/
require('../grading-scripts-s3/scratch3')

module.exports = class{
    constructor(){
        this.requirements = {};
        this.extensions = {};
    }
    initReqs(){
        this.requirements.Category1 = { bool: false, str: "Completed category 1"};
        this.requirements.Category2 = { bool: false, str: "Completed category 2"};
        this.requirements.Category3 = { bool: false, str: "Completed category 3"};
        this.requirements.MainScript = { bool: false, str: "The structure of the main script is correct"};
        this.requirements.CategoryOrder = { bool: false, str: "The ordering of categories is correct within the main script"};
    }

    grade(fileObj, user){
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;
        
        let allSprites = project.targets;
        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        function findCategory(sprite, n, x, y, costumeName) { // TODO: check for specifics
            // Look for a specific custom function in a sprite
            let customScripts = sprite.scripts.filter(s=>s.blocks[0].opcode.includes("procedures_definition") && s.blocks.some(block=>block.opcode.includes("sensing_askandwait")));
            // console.log(customScripts, n);

            var catOut = false;

            let gs = 0;
            for(gs in customScripts) {
                if (Object.keys(customScripts[gs]).includes("blocks")) {
                    //now iterate through the blocks in the script
                    let scriptPieces = { set: false, move: false, costumeSwitch: false, stampsBall: false}; // TODO: if anyone of these are missing flag it!
                    // console.log("here: ", customScripts[gs].blocks[0])
                    if (customScripts[gs].blocks[0].opcode.includes("procedures_definition") && customScripts[gs].blocks[0].inputBlocks[0].mutation.proccode == `category${n}`) {
                        let gb = 1;
                        for (gb in customScripts[gs].blocks) {
                            let currBlock = customScripts[gs].blocks[gb]
                            if (currBlock.opcode.includes("data_setvariableto")) { // check for inputs (which var changing, new value)
                                // sets category to answer
                                scriptPieces.set = true;
                            } else if (currBlock.opcode.includes("motion_gotoxy")) { // new x,y
                                // moves the ball
                                scriptPieces.move = true;
                            } else if (currBlock.opcode.includes("looks_switchcostumeto")) { // check for inputs (new costume)
                                // switch costume
                                scriptPieces.costumeSwitch = true;
                            } else if (currBlock.opcode.includes("procedures_call")) { // check the name of custom script is stampball
                                // stamps ball
                                scriptPieces.stampsBall = true;
                            }
                        }
                        catOut = Object.values(scriptPieces).filter(c=>c).length == Object.values(scriptPieces).length;
                    }
                }
            }
            return catOut;
        }

        function procSprite(sprite){
            var out = {loopStructure: false, categoryStructure: false, foundCats: []};
            // given a sprite, check for initalization of vars
            // let varScripts = sprite.scripts.filter(s=>s.blocks.some(block=>block.opcode.includes("data_setvariableto") && block.inputs.VALUE[1].includes('0')));

            for (let i = 1; i <= 3; i++) {
                // where i is the number of functions we want to check for
                out.foundCats.push(findCategory(sprite,i, null, null, null));
            }
            
            var validMain = sprite.scripts.filter(s=>s.blocks[0].opcode.includes("event_whenbroadcastreceived") && s.blocks[1].opcode.includes("control_if_else"));


            function checkLoopStructure(someBlocks, n){
                // recursive function for checking structrue with a restriction of n control-if-elses
                console.log("someblocks: ", someBlocks);
                if (someBlocks.length >= 1) {
                    for(const block of someBlocks) {
                        if (n < 3) {
                            if (Object.keys(block).includes("opcode") && block.opcode.includes("control_if_else") && block.inputBlocks.length >= 1) {
                                n += 1;
                                if (checkLoopStructure(block.inputBlocks, n)) {
                                    return true;
                                }
                            }
                        } else if (block.opcode.includes("control_if")) {
                            return true;
                        }
                    }
                }
                return false;
            }

            for (const script of validMain) { // TOOD: check the conditionals are in order
                if (script.blocks[1].inputBlocks.length >= 1) {
                    if (checkLoopStructure(script.blocks[1].inputBlocks, 0)) {
                        out.loopStructure = true;
                        break;
                    }
                }
            }

            function checkNestedFunctions(someBlocks, s){
                // recursive function for checking structrue with a restriction of n control-if-elses
                console.log("someBlocks: ", someBlocks);
                for(const block of someBlocks) {
                    if (Object.keys(block).includes("opcode") && block.opcode.includes("control_if_else") && block.inputBlocks.length >= 1 && block.subscripts[0].blocks.length >= 2) {
                        // block.inputBlocks
                        s += 1; // s = 2, WTS count == 2, checking the first category is in the thing
                        let count = 0;
                        console.log("block.inputBlocks: ", block.inputBlocks);
                        for (let i = 1; i <= s; i++) {
                            if (block.subscripts[0].blocks.some(b=>b.opcode.includes("procedures_call") && b.mutation.proccode == `category${i}`)) {
                                count += 1;
                            }
                        }
                        if (count == s && checkNestedFunctions(block.inputBlocks, s)) {
                            return true;
                        }
                    } else if (Object.keys(block).includes("opcode") && block.opcode.includes("control_if") && block.inputBlocks.length >= 1 && block.subscripts[0].blocks.length >= 2) {
                        let lastCount = 0;
                        for (let i = 1; i <=5; i++) {
                            if (block.subscripts[0].blocks.some(b=>b.opcode.includes("procedures_call") && b.mutation.proccode == `category${i}`)) {
                                lastCount += 1
                            }
                        }
                        return lastCount == 5;
                    }
                }
                return false;
            }



            for (const script of validMain) {
                //similar to previous loop but checking different properties
                if (script.blocks[1].inputBlocks.length >= 1) {
                    if (script.blocks[1].subscripts[0].blocks.some(b=>b.opcode.includes("procedures_call") && b.mutation.proccode == `category${1}`)) {
                        if (checkNestedFunctions(script.blocks[1].inputBlocks, 1)) {
                            out.categoryStructure = true;
                            break;
                        }
                    }
                }
            }

            return out;
        };

        var results = allSprites.map(procSprite);
        function returnCats(exOut) {
            return exOut.foundCats
        }
        var categoryMatrix = results.map(returnCats)
        // we look at the column and check if at least one value is true

        // console.log("cat1: ",categoryMatrix.map(c=>c[0]))
        // console.log("cat2: ",categoryMatrix.map(c=>c[1]))
        // console.log("cat3: ",categoryMatrix.map(c=>c[2]))
        this.requirements.Category1.bool = categoryMatrix.map(c=>c[0]).some(c=>c)
        this.requirements.Category2.bool = categoryMatrix.map(c=>c[1]).some(c=>c)
        this.requirements.Category3.bool = categoryMatrix.map(c=>c[2]).some(c=>c)
        this.requirements.MainScript.bool = results.filter(c=>c.loopStructure).length >= 1;
        console.log("categoryStructure length: ",results.filter(c=>c.categoryStructure).length);
        this.requirements.CategoryOrder.bool = results.filter(c=>c.categoryStructure).length == 1;
        return;
    }
}