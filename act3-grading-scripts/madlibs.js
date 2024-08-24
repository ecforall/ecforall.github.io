/*
madlibs.js checker
Alex Reyes Aranda Summer 2024
*/
require('../grading-scripts-s3/scratch3')

module.exports = class{
    constructor(){
        this.requirements = {};
        this.extensions = {};
    }
    initReqs(){

        this.requirements.Sprites = { bool: false, str: "I had at least one sprite and a backdrop" };
        this.requirements.VarsExistance = { bool: false, str: "I created 3 variables" };
        this.requirements.initAllVars = { bool: false, str: "I initialized my varibale values to 0" };
        this.requirements.questionsAndVars = {bool: false, str: "I asked questions and store their responses in my variables" };
    }

    grade(fileObj, user){
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;
        
        let allSprites = project.targets;
        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);

        function accumulateVars(sprites) {
            let numOfVars = 0;
            let s = 0;
            for (s in sprites) {
                if (sprites[s].variables != null) {
                    numOfVars += Object.keys(sprites[s].variables).length;
                }
            }
            return numOfVars;
        }

        function procSprite(sprite){
            //evaluate a single sprite
            var out = { initVars: 0, askedAndStored: false};
            // given a sprite, check for initalization of vars
            let varScripts = sprite.scripts.filter(s=>s.blocks.some(block=>block.opcode.includes("data_setvariableto") && block.inputs.VALUE[1].includes('0')));
            
            let gs = 0;
            for (gs in varScripts) {
                //check if scripts property exists in object
                if (Object.keys(varScripts[gs]).includes("blocks")) {
                    let gb = 0;
                    for (gb in varScripts[gs].blocks) {
                        let currBlock = varScripts[gs].blocks[gb];
                        if (currBlock.opcode.includes("data_setvariableto") && currBlock.inputs.VALUE[1].includes('0')) {
                            out.initVars += 1;
                        }
                    }
                }
            }
            out.askedAndStored = sprite.scripts.some(s=>s.blocks.some(block=>block.opcode.includes("sensing_askandwait") && s.blocks.some(block=>block.opcode.includes("data_setvariableto"))));

            return out;
        };

        var results = allSprites.map(procSprite);
        function returnNumVars(exOut) {
            return exOut.initVars;
        }
        var initVarsSum = results.map(returnNumVars).reduce((sum, current) => sum + current, 0);
        this.requirements.Sprites.bool = allSprites.length >= 2;
        this.requirements.VarsExistance.bool = accumulateVars(allSprites) >= 3;
        this.requirements.initAllVars.bool = initVarsSum >= accumulateVars(allSprites) - 1;
        this.requirements.questionsAndVars.bool = results.filter(o=>o.askedAndStored).length >= 1; // There exists one instance of asking & storing
        return;
    }
}