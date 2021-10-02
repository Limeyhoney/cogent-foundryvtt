import {cogent} from "./module/config.js"
import cogentItemSheet from "./module/sheets/cogentItemSheet.js";
import cogentCharacterSheet from "./module/sheets/cogentCharacterSheet.js"
import cogentActor from "./module/cogentActor.js"
import * as Dice from "./module/dice.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/cogent/templates/partials/character/weapon-list.hbs",
        "systems/cogent/templates/partials/character/armor-list.hbs",
        "systems/cogent/templates/partials/character/items-list.hbs",
        "systems/cogent/templates/partials/character/skill-block.hbs",
        "systems/cogent/templates/partials/character/assist-block.hbs",
        "systems/cogent/templates/partials/character/bio-block.hbs",
        "systems/cogent/templates/partials/character/monster-bio-block.hbs",
        "systems/cogent/templates/partials/character/vocations.hbs"
    ];
    return loadTemplates(templatePaths);
}

Hooks.once("init", function() {
    console.log("Cogent | Initialising Cogent Roleplay System");

    CONFIG.cogent = cogent;
    CONFIG.Actor.entityClass = cogentActor;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cogent", cogentItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cogent", cogentCharacterSheet, { makeDefault: true });

    Handlebars.registerHelper("double", function(number) {
        return 2*number
    });
    Handlebars.registerHelper("triple", function(number) {
        return 3*number
    });
    Handlebars.registerHelper("quadruple", function(number) {
        return 4*number
    });
    Handlebars.registerHelper("sum4", function(a, b, c, d) {
        return a+b+c+d
    });
    Handlebars.registerPartial("weapon-list", '{{> "systems/cogent/templates/partials/character/weapon-list.hbs"}}')

    game.cogent = {
        cogentCombatRoll: cogentCombatRoll
    };
    preloadHandlebarsTemplates();
});
function cogentCombatRoll(actor, weapon, value, malus, destiny, armorBonus) {
    let TactorData = actor.data.data
    let base = 3+TactorData.combatData.attributeTotal-TactorData.combatData.malus+parseInt(weapon)+value-malus;
    let addon = ""
    if (armorBonus>0) {
        addon = " ("+game.i18n.localize("cogent.combatRoll.armorReduction")+": "+armorBonus+")"
    }

    Dice.rollCheck({
        actorData: TactorData,
        skillTotal: base,
        destiny: destiny,
        title: "cogent.combat",
        additional: addon
    })
    actor.render(false);
};

