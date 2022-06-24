import ShipCard from "./ship-card.js";

const BACKEND_URL = "https://getpantry.cloud/apiv1/pantry/8d891169-165c-452c-870e-6cd1419922b1/basket/";

export default class MainPage {
    _element;
    _cardsContainer;
    _ships = {};

    getTemplate() {
        return `<div class="main">
                  <div class="content__header">
                    <h1>EVE online. Ships overview.</h1>
                  </div>
                  <div class="controls-box">
                      <div class="add-ship-button-box">
                        <button type="button" class="add-ship-button">
                          <span>Add ship</span>
                        </button>
                      </div>
                      <div class="ship-type">
                        <label class="ship-type__label">Type</label>
                        <select class="ship-type__category" name="type" id="type">
                          <option value="frigate" selected="selected">Frigate</option>
                          <option value="destroyer">Destroyer</option>
                          <option value="cruiser">Cruiser</option>
                          <option value="battlecruiser">Battlecruiser</option>
                          <option value="battleship">Battleship</option>
                        </select>
                      </div>
                  </div>
                  <div class="cards-container"></div>
                </div>`;
    }

    async render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this._element = wrapper.firstElementChild;

        this._cardsContainer = this._element.querySelector(".cards-container");
        this._shipCategory = this._element.querySelector(".ship-type__category");

        this.addEventListeners();
        await this.getShipsList();
        this.renderCards();

        return this._element;
    }

    addEventListeners() {
        const btn = this._element.querySelector(".add-ship-button-box");
        btn.addEventListener('click', () => {
            this.showShipForm();
        })

        this._cardsContainer.addEventListener('click', (event) => {
            if (event.target.tagName !== 'IMG') return;

            const parent = event.target.closest(".ship-card");

            if (parent) {
                this.showShipForm(parent.id);
            }
        })

        this._shipCategory.addEventListener('change', async () => {
            await this.getShipsList();
            this._cardsContainer.innerHTML = '';
            this.renderCards();
        });
    }

    async getShipsList() {
        const shipClass = this._shipCategory.value;
        const url = new URL(shipClass, BACKEND_URL);

        try {
            const response = await fetch(url.toString());
            this._ships = await response.json();
        } catch(error) {
            console.log(error.message);
        }
    }

    renderCards() {
        for (const ship of Object.values(this._ships)) {
            const shipCard = new ShipCard(ship);
            const element = shipCard.render();

            this._cardsContainer.append(element);
        }
    }

    showShipForm(id = "") {
        const value = id ? JSON.stringify(this._ships[id]) : "";

        localStorage.setItem("currentEveShip", value);

        document.location.href = "../ship-form.html";
    }

    remove() {
        this._element.remove();
    }

    destroy() {
        this._element = null;
        this.remove();
    }
}