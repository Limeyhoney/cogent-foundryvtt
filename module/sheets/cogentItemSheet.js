export default class cogentItemSheet extends ItemSheet {
    get template() {
        return `systems/cogent/templates/sheets/${this.item.data.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.cogent;

        return data;
    }
}