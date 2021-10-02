export default class cogentActor extends Actor {
    prepareData() {
        super.prepareData();

        let actorData = this.data;
        let data = actorData.data;

        data.injuries.malus = data.injuries.minor + (2*data.injuries.medium) + (3*data.injuries.serious) +(4*data.injuries.fatal);
        data.combatData.attributeTotal = data.attributes.str.value+data.attributes.ref.value+data.attributes.int.value+data.attributes.cha.value;
        if (data.attributes.str.malus == "true") {data.combatData.attributeTotal--;};
        if (data.attributes.ref.malus == "true") {data.combatData.attributeTotal--;};
        if (data.attributes.int.malus == "true") {data.combatData.attributeTotal--;};
        if (data.attributes.cha.malus == "true") {data.combatData.attributeTotal--;};

        let armorMalus = 0;
        let armor = actorData.items.filter(function(item) {return item.data.type == "armor"})
        for(let i=0;i<armor.length;i++) {
            armorMalus = armorMalus + armor[i].data.data.armor;
        }
        armorMalus = armorMalus/2;
        armorMalus = Math.floor(armorMalus);
        data.combatData.malus=armorMalus;
    }
}