/*
Invasive Species Grading Script
Alex Reyes Aranda Summer 2024
*/

require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

     initReqs() {
        this.requirements.invasiveSprite = { bool: false, str: "I uploaded a picture of my invasive species as a sprite"};
        this.requirements.invasiveExplained = { bool: false, str: "My invasive species sprite explains why it's harmful to my area's ecosystem through text or audio"};
        this.requirements.ecosystemExplained = { bool: false, str: "I  have a sprite that explains how to protect my area's ecosystem from the invasive species through text or audio."};
        this.requirements.backdropPresent = { bool: false, str: "I have a backdrop that shows my area's ecosystem."};   
    }

    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        this.initReqs();
        if (!is(fileObj)) return;

        let stage = project.targets.find(t=>t.isStage);
        let sprites = project.targets.filter(t=>!t.isStage);
        let invasiveSprite = project.targets.find(t=>t.name.toLowerCase() == "invasive");
        let explainerSprite = project.targets.find(t=>t.name.toLowerCase() == "sprite");

        this.requirements.invasiveSprite.bool = invasiveSprite != null; //NUANCE: sprite must be named invasive
        this.requirements.invasiveExplained.bool = (invasiveSprite != null) ? invasiveSprite.scripts.some(s=>s.blocks[0].opcode.includes("event_") && s.blocks.some(b=>b.opcode.includes("looks_say") || b.opcode.includes("sound_play"))): false; //NUANCE: Sprite must be named invasive
        this.requirements.ecosystemExplained.bool = (explainerSprite != null) ? explainerSprite.scripts.some(s=>s.blocks[0].opcode.includes("event_") && s.blocks.some(b=>b.opcode.includes("looks_say") || b.opcode.includes("sound_play"))): false; //NUANCE: Sprite must be named sprite
        this.requirements.backdropPresent.bool = stage.costumes.length >= 1; //NUANCE: can't tell that the image is of ecosystem
        
        console.log("-- DEBUG --");
        console.log("IMPORTANT: Invasive sprite must be named 'invasive'");
        console.log("IMPORTANT: Explainer sprite must be named 'sprite'");

        return;
    }
}