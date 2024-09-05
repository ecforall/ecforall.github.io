/*
diceQuest grading script
Alex Reyes Aranda Summer 2024
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.dieFourSet = { bool: false, str: "When die number=4, increase score by 4."}; //done
        this.requirements.dieFiveSet = { bool: false, str: "When die number=5, increase score by 5."}; //done
        this.requirements.dieSixSet =  { bool: false, str: "When die number=6 condition in program."}; //done

        this.extensions.bigDie = { bool: false, str: "Have the die get bigger everytime the score increases and then reset when 6 is rolled."}; //IP
        this.extensions.talkingDie = { bool: false, str: "Have the die say how many points are added or when resets to 0."}; //IP
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);
        

        function checkNestedArray(inputArray, value) {
            // used for operand checking and varibale changing block
            return inputArray.filter(a=>Array.isArray(a)).filter(a=>a.length == 2).map(a=>a[1] == value).includes(true);
        }

        function hasNumber(b, value) {
            //b.conditionBlock.inputs.OPERAND1
            //b.conditionBlock.inputs.OPERAND2
            let checkExistence = ((b.conditionBlock.inputs.OPERAND1 && b.conditionBlock.inputs.OPERAND2) != null) ? checkNestedArray(b.conditionBlock.inputs.OPERAND1, value) || checkNestedArray(b.conditionBlock.inputs.OPERAND2, value): false;
            let checkValue = (checkExistence && b.inputBlocks.length >= 1) ? b.inputBlocks.some(b1=>b1.opcode.includes("data_changevariableby") && checkNestedArray(b1.inputs.VALUE, value)): false;
            return checkExistence && checkValue;

        }

        function procSprite(sprite){
            // evaluating a single sprite
            var out = { hasFour: false, hasFive: false, hasSix: false, biggerDie: false, speakingDie: false};
            //if or if else are ok control blocks

            if (sprite.scripts.some(s=>s.blocks[0].opcode.includes("event_") && s.blocks.some(b=>b.opcode.includes("control_if")))) {
                let controlBlock = sprite.scripts.find(s=>s.blocks.some(b=>b.opcode.includes("control_if"))).blocks.find(b=>b.opcode.includes("control_if"));
                console.log("controlBlock: ", controlBlock);
                out.hasFour = controlBlock.subscriptsRecursive.some(s=>s.blocks.some(b=>b.opcode.includes("control_if") && hasNumber(b, '4')));
                out.hasFive = controlBlock.subscriptsRecursive.some(s=>s.blocks.some(b=>b.opcode.includes("control_if") && hasNumber(b, '5')));
                out.hasSix = controlBlock.subscriptsRecursive.some(s=>s.blocks.some(b=>b.opcode.includes("control_if") && hasNumber(b, '6')));
            }

            return out;
        }
        var results = sprites.map(procSprite);
        this.requirements.dieFourSet.bool = results.filter(o=>o.hasFour).length >= 1;
        this.requirements.dieFiveSet.bool = results.filter(o=>o.hasFive).length >= 1;
        this.requirements.dieSixSet.bool = results.filter(o=>o.hasSix).length >= 1;
        
        console.log("-- DEBUG --");
        console.log("remeber to have values inside your conditions");
        console.log("four: ", results.filter(o=>o.hasFour));
        console.log("five: ", results.filter(o=>o.hasFive));
        console.log("six: ", results.filter(o=>o.hasSix));

        return;
    }
}