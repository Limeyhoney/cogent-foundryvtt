import * as Dice from "../dice.js";

export default class cogentCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/cogent/templates/sheets/character-sheet.hbs",
            classes: ["cogent", "sheet", "character"]
        });
    }
    getData() {
        const data = super.getData()
        data.data.inventory.weapon = data.items.filter(function(item) {return item.type == "weapon"})
        data.data.inventory.armor = data.items.filter(function(item) {return item.type == "armor"})
        data.data.inventory.items = data.items.filter(function(item) {return item.data.type == "item"})
        data.config = CONFIG.cogent;
        return data;
    }
    activateListeners(html) {
        html.find(".cogent-aroll").click(this._cogentAttributeRoll.bind(this));
        html.find(".cogent-sroll").click(this._cogentSkillRoll.bind(this));
        html.find(".cogent-croll").click(this._cogentSheetCombatRoll.bind(this));
        html.find(".cogent-acroll").click(this._cogentAdvCombatRoll.bind(this));
        html.find(".cogent-item-remove").click(this._cogentItemRemove.bind(this));
        html.find(".cogent-item-add").click(this._cogentItemCreate.bind(this));
        html.find(".cogent-item-edit").click(this._cogentItemEdit.bind(this));
        html.find(".inline-edit").change(this._onEdit.bind(this));
        super.activateListeners(html);
    }
    _cogentRender(options={}) {
        super._render(false, options)
    }

    _cogentAttributeRoll(event) {
        let base = 3+parseInt(event.currentTarget.dataset.value);
        if (event.currentTarget.dataset.malus == "true") {base--;};
        Dice.rollCheck({
            actorData: this.actor.data.data,
            skillTotal: base,
            destiny: event.shiftKey,
            title: event.currentTarget.dataset.skill,
            additional: ""
        });
        super._render(false, this);
    }
    _cogentSkillRoll(event) {
        let base = 3+parseInt(event.currentTarget.dataset.value)+parseInt(event.currentTarget.dataset.pvalue);
        Dice.rollCheck({
            actorData: this.actor.data.data,
            skillTotal: base,
            destiny: event.shiftKey,
            title: event.currentTarget.dataset.skill,
            additional: ""
        })
        super._render(false, this);
    }
    _cogentSheetCombatRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let Id = element.dataset.id;
        let actor = this.actor
        let item = actor.getOwnedItem(Id);

        new Dialog({
            title:'Combat Roll',
            content:`
                <form>
                    <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.weaponMalus")+`</label>
                        <input type='checkbox' name='punished'></input>
                    </div>
                    <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.diceAdded")+`</label>
                        <input type='number' name='value' data-dtype="Number" min="0"></input>
                    </div>
                    <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.diceRemoved")+`</label>
                        <input type='number' name='malus' data-dtype="Number" min="0"></input>
                    </div>
                    <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.destiny")+`</label>
                        <input type='checkbox' name='destiny'></input>
                    </div>
                </form>
            `,
            buttons:{
                yes: {
                  icon: "<i class='fas fa-dice'></i>",
                  label: game.i18n.localize("cogent.roll"),
                  callback: (html) => {
                    let destiny = html.find('input[name=\'destiny\']').is(':checked');
                    let punished = html.find('input[name=\'punished\']').is(':checked');
                    let value = html.find('input[name=\'value\']').val();
                    let malus = html.find('input[name=\'malus\']').val();
                    if(value == "") {value = "0"};
                    if(malus == "") {malus = "0"};
                    malus = parseInt(malus)
                    value = parseInt(value)
                    if(punished==true) {malus += item.data.data.malus}
                    else {value += item.data.data.bonus};
                    console.log(parseInt(item.data.data.malus))
                    let weapon = 0;
                    if (actor == null) {ui.notifications.error(game.i18n.localize("cogent.combatRoll.tokenError"))}
                    else {game.cogent.cogentCombatRoll(actor, weapon, value, malus, destiny, 0);}
                  }
                },
                no: {
                  label: game.i18n.localize("cogent.cancel")
                }
              },
              default:'yes',
              close: html => {
                 
              }
            }).render(true);
    }
    _cogentAdvCombatRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let Id = element.dataset.id;
        let actor = this.actor
        let item = actor.getOwnedItem(Id);
        let body = ``;
        let itemData= item.data.data;
        let armorBonus = itemData.armorBonus;

        if(itemData.speared==true) {
            body += `<div class="form-group">
                        <label>`+game.i18n.localize("advCogent.combatRoll.speared")+`</label>
                        <input type='checkbox' name='spear'></input>
                    </div>`
        }
        if(itemData.hafted==true) {
            body += `<div class="form-group">
                        <label>`+game.i18n.localize("advCogent.combatRoll.hafted")+`</label>
                        <input type='checkbox' name='haft'></input>
                    </div>`
        }
        if(itemData.blunt==true) {
            body += `<div class="form-group">
                        <label>`+game.i18n.localize("advCogent.combatRoll.blunt")+`</label>
                        <input type='checkbox' name='blunt'></input>
                    </div>`
        }
        if(itemData.blade==true) {
            body += `<div class="form-group">
                        <label>`+game.i18n.localize("advCogent.combatRoll.blade")+`</label>
                        <input type='checkbox' name='blade'></input>
                    </div>`
        }

        new Dialog({
            title:'Advanced Combat Roll',
            content:`<form>`+body+`<div class="form-group">
                <label>`+game.i18n.localize("cogent.combatRoll.destiny")+`</label>
                <input type='checkbox' name='destiny'></input>
                </div>
                <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.diceAdded")+`</label>
                        <input type='number' name='value' data-dtype="Number" min="0"></input>
                    </div>
                    <div class="form-group">
                        <label>`+game.i18n.localize("cogent.combatRoll.diceRemoved")+`</label>
                        <input type='number' name='malus' data-dtype="Number" min="0"></input>
                    </div>`+`</form>`,
            buttons:{
                yes: {
                  icon: "<i class='fas fa-dice'></i>",
                  label: game.i18n.localize("cogent.roll"),
                  callback: (html) => {
                    let destiny = html.find('input[name=\'destiny\']').is(':checked');
                    let punished = html.find('input[name=\'punished\']').is(':checked');
                    let value = html.find('input[name=\'value\']').val();
                    let malus = html.find('input[name=\'malus\']').val();
                    let blade = html.find('input[name=\'blade\']').is(':checked');
                    let blunt = html.find('input[name=\'blunt\']').is(':checked');
                    let haft = html.find('input[name=\'half\']').is(':checked');
                    let spear = html.find('input[name=\'spear\']').is(':checked');
                    if(value == "") {value = "0"};
                    if(malus == "") {malus = "0"};
                    if(punished==true) {malus = parseInt(malus)+item.data.data.malus}
                    else {value = parseInt(value)+item.data.data.bonus};
                    if(blade==true) {armorBonus += 1}
                    if(blunt==true) {
                        armorBonus += 1;
                        value+=-1;
                    }
                    if(haft==true) {value+=1}
                    if(spear==true) {
                        armorBonus+=1;
                        value+=1;
                    }
                    value+=itemData.diceBonus;
                    let weapon = 0;
                    if (actor == null) {ui.notifications.error(game.i18n.localize("cogent.combatRoll.tokenError"))}
                    else {game.cogent.cogentCombatRoll(actor, weapon, value, malus, destiny, armorBonus);}
                  }
                },
                no: {
                  label: game.i18n.localize("cogent.cancel")
                }
              },
              default:'yes',
              close: html => {
                 
              }
            }).render(true);
    }
    _cogentItemRemove(event) {
        event.preventDefault();
        let Id = event.currentTarget.dataset.id;
        this.actor.deleteEmbeddedEntity("OwnedItem", Id);
    }
    _cogentItemCreate(event) {
        event.preventDefault();    
        let itemData = {
            name: game.i18n.localize(event.currentTarget.dataset.default),
            type: event.currentTarget.dataset.type,
            data: {
                type: event.currentTarget.dataset.class
            }
        };
        return this.actor.createOwnedItem(itemData);
    }
    _onEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let Id = element.dataset.id;
        let item = this.actor.getOwnedItem(Id);
        let field = element.dataset.field;

        return item.update({ [field]: element.value});
    }
    _cogentItemEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.dataset.id;
        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);
    }
}