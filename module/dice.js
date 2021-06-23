export function rollCheck({actorData = null, skillTotal = null, destiny = false, title = "", additional = ""} = {}) {
    let rollForumla = "@num d6cs>=@min";
    let minimum = 4;
    if (destiny == true && actorData.destiny.value > 0) {
        minimum = 3;
        actorData.destiny.value--;
    }
    if (actorData.injuries.malus > 0) {
        skillTotal = skillTotal - actorData.injuries.malus;
    }
    let rollData = {
        num: skillTotal,
        min: minimum
    };
    let messageData = {
        speaker: ChatMessage.getSpeaker(),
        flavor: game.i18n.localize(title) + " " + game.i18n.localize("cogent.roll") + additional
    };
    new Roll(rollForumla, rollData).roll().toMessage(messageData)
}