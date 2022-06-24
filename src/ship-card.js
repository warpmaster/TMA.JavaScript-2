export default class ShipCard {
    _element;
    _data = {};

    constructor(data = "") {
        this._data = data;
    }

    getTemplate() {
        return `<div class="ship-card" id="${this._data.id}">
                  <div class="image-box">
                    <picture class="ship-image">
                      <source srcset="${this._data.url}">
                      <img src="${this._data.url}" alt="${this._data.id}">
                    </picture>
                  </div>             
                  <div class="ship-info">
                    <div class="ship-info__name">
                      <span class="section-header">NAME:</span>
                      <span>${this._data.id}</span>
                    </div>
                    <div class="ship-info__class">
                      <span class="section-header">CLASS:</span>
                      <span>${this._data.class}</span>
                    </div>
                    <div class="ship-info__nation">
                      <span class="section-header">NATION:</span>
                      <span>${this._data.nation}</span>
                    </div>
                    <div class="ship-info__brief">
                      <span class="section-header">DESCRIPTION:</span>
                      <span>${this._data.description}</span>
                    </div>
                    <div class="ship-info__bonuses">
                      <span class="section-header">BONUSES:</span>
                      <span>${this._data.bonuses}</span>
                    </div>
                  </div>
                </div>`;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();

        this._element = wrapper.firstElementChild;

        return this._element;
    }

    remove() {
        this._element.remove();
    }

    destroy() {
        this._element = null;
        this._data = null;
        this.remove();
    }
}