/*
connectionCircle grading script
Alex Reyes Aranda Summer 2024
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.SpriteCategory = { bool: false, str: "I used 3 picture sprites"};
        this.requirements.picturesHave2When = {bool: false, str: "Each picture sprite has at least 2 'When this sprite is clicked' blocks"};
        this.requirements.arrowsHaveWhen = {bool: false, str: "Each arrow has a 'When I recieve' block"};
        this.requirements.backdropValidation = {bool: false, str: "The backdrop has a green flag with voice recorded instructions"};
        // this.requirements.LoopsCategory = { bool: false, str: "The arrows blink when the right sprite is clicked"};
    }


    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;
        //SPRITES
        // look for 3 picture sprites --> picture sprite is not arrow and not backdrop DONE
        //EVENTS
        // each picture sprite has at least 2 "when this is clicked"
        // each arrow has a "when I recieve"
        // the backdrop has "when green flag"
        //LOOPS
        // the arrows blink(are animated) when corresponding picture sprite is clicked ALL Arrows have animation

        let stage = project.targets.find(t => t.isStage);
        let sprites = project.targets.filter(t=> !t.isStage);
        let arrows = sprites.filter(t=>t.name.includes("Arrow"));
        let pictureSprites = sprites.filter(t=> !arrows.includes(t));


        function procSprite(sprite){
            // evaluating a single sprite
            var out = { pictureHas2When: false, arrowHasWhen: false, arrowBlinks: false };
            
            var available_scripts = (pictureSprites.includes(sprite)) ? sprite.scripts.filter(s=>s.blocks.some(block=>block.opcode.includes("event_whenthisspriteclicked"))): [];
            out.pictureHas2When = available_scripts.length >= 2;
            out.arrowHasWhen = (arrows.includes(sprite)) ? sprite.scripts.some(s=>s.blocks.some(block=>block.opcode.includes("event_whenbroadcastreceived"))) : false;
            // var repeat_loops = sprite.scripts.filter(s=>s.blocks[0].opcode.includes("event_whenbroadcastreceived")).map(s=>s.blocks.filter(b=>b.opcode.includes("control_repeat"))).flat();
            // out.arrowBlinks = repeat_loops.some(loop=>loop.subscripts.some(s=>s.blocks.some(block=>block.opcode.includes("looks_nextcostume") && s.blocks.some(block=>block.opcode.includes("control_wait")))));
            // out.arrowBlinks = (arrows.includes(sprite)) ? sprite.scripts.some(loop=>loop.subscripts.some(s=>s.blocks.some(block=>block.opcode.includes("looks_nextcostume") && s.blocks.some(block=>block.opcode.includes("control_wait"))))): false;
            return out;
        }
        var results = sprites.map(procSprite);
        
        this.requirements.SpriteCategory.bool = pictureSprites.length >= 3;
        if (pictureSprites.length >= 1){
            console.log("picturesHave2When: ", results.filter(c=>c.pictureHas2When).length >= 3);
            console.log("arrowsHaveWhen: ", results.filter(c=>c.arrowHasWhen).length == arrows.length);
            console.log("backdropValidation: ", stage.scripts.some(s=>s.blocks.some(block=>block.opcode.includes("event_whenflagclicked")) && s.blocks.some(block=>block.opcode.includes("sound_playuntildone"))));

            this.requirements.picturesHave2When.bool = results.filter(c=>c.pictureHas2When).length >= 3;
            this.requirements.arrowsHaveWhen.bool = results.filter(c=>c.arrowHasWhen).length == arrows.length;
            this.requirements.backdropValidation.bool = stage.scripts.some(s=>s.blocks.some(block=>block.opcode.includes("event_whenflagclicked")) && s.blocks.some(block=>block.opcode.includes("sound_playuntildone")));
            // this.requirements.EventCategory.bool = picturesHave2When && arrowsHaveWhen && backdropValidation;
        }
        // this.requirements.LoopsCategory.bool = (arrows.length >= 1) ? results.filter(c=>c.arrowBlinks).length == arrows.length : false;

        console.log("results: ", results);
        // console.log("arrows_length: ", arrows.length);
        // console.log("pictures_length: ", pictureSprites.length);
        // console.log("arrowBlinks: ", results.filter(c=>c.arrowBlinks).length)

        return;
    }
}