import EscapeHtml from "../utils/escape-html.js";

const BACKEND_URL = "https://getpantry.cloud/apiv1/pantry/8d891169-165c-452c-870e-6cd1419922b1/basket/";
const IMGUR_CLIENT_ID = "28aaa2e823b03b1";

class ShipForm {
    _id;
    _data;
    _element;
    _controlElements;
    _notificationBox;

    constructor() {
        const value = localStorage.getItem("currentEveShip");

        this._data = value ? JSON.parse(value) : null;
        this._id = this._data?.id;
    }

    getTemplate() {
        return `<form class="form-flex">
                  <div class="form-group">
                    <label class="form-label">Ship name</label>
                    <input required="" type="text" name="id" id="id" class="form-control" placeholder="Ship name">
                  </div>
                  <div class="form-group" >
                    <label class="form-label">Image</label>
                    <div class="form-control" id="url">
                      <img src="src" alt="Image">
                    </div>
                    <button type="button" name="uploadImage" class="form-buttons button-upload-image"><span>Upload</span></button>
                  </div>
                  <div class="input-box">
                    <div class="form-group input-box">
                      <label class="form-label">Nation</label>
                      <select class="form-control" name="nation" id="nation">
                        <option value="Amarr">Amarr Empire</option>
                        <option value="Caldari">Caldari State</option>
                        <option value="Gallente">Gallente Federation</option>
                        <option value="Minmatar">Minmatar Republic</option>
                      </select>
                    </div>
                    <div class="form-group input-box">
                      <label class="form-label">Class</label>
                      <select class="form-control" name="type" id="class">
                        <option value="Frigate">Frigate</option>
                        <option value="Destroyer">Destroyer</option>
                        <option value="Cruiser">Cruiser</option>
                        <option value="Battlecruiser">Battlecruiser</option>
                        <option value="Battleship">Battleship</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea required="" class="form-control" name="description" id="description" placeholder="Ship description"></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Bonuses</label>
                    <textarea required="" class="form-control" name="bonuses" id="bonuses" placeholder="Ship bonuses"></textarea>
                  </div>
                  <div class="buttons-box">
                      <div class="button-box__small">
                        <button type="submit" id="save" name="save" class="form-buttons button-save">
                          <span>${this._id ? "Save ship" : "Add ship"}</span>
                        </button>
                      </div>
                      <div class="button-box__small">
                        <button type="submit" id="delete" name="delete" class="form-buttons button-delete">
                          <span>Delete ship</span>
                        </button>
                      </div>
                  </div>
                  <div class="notification-box"></div>
                </form>`;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();

        this._element = wrapper.firstElementChild;
        this._controlElements = this.getControlElements();
        this.addEventListeners();

        this._notificationBox = this._element.querySelector('.notification-box');

        if (this._id) {
            this.setFormData(this._id);
        }

        return this._element;
    }

    getControlElements() {
        return [...this._element.querySelectorAll(".form-control")]
            .reduce((prev, current) => {
                prev[current.id] = current;
                return prev;
            }, {});
    }

    setFormData() {
        for (let [key, value] of Object.entries(this._data)) {
            if (key === 'url') {
                this._controlElements[key].firstElementChild.src = value;
                continue;
            }
            this._controlElements[key].value = EscapeHtml(value);
        }
    }

    getFormData() {
        const formData = {};

        for (let key of Object.keys(this._controlElements)) {
            if (key === 'url') {
                formData[key] = this._controlElements[key].firstElementChild.src;
                continue;
            }
            formData[key] = EscapeHtml(this._controlElements[key].value);
        }

        return formData;
    }

    async save() {
        const data = { [this._controlElements.id.value] : this.getFormData() };
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            redirect: 'follow'
        };

        await this.fetchWrapper(requestOptions);

        this.notificationHandler("Data saved");
    }

    async delete() {
        let requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow'
        };

        let newCategoryData = await (await this.fetchWrapper(requestOptions)).json();

        delete newCategoryData[this._controlElements.id.value];

        requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategoryData),
            redirect: 'follow'
        };

        try {
            const basket = this._controlElements.class.value.toLowerCase();
            const url = new URL(basket, BACKEND_URL);

            await fetch(url.toString(), requestOptions);
        } catch(error) {
            this.notificationHandler("Network error", error.message);
        }

        this.notificationHandler("Data deleted");
    }

    async fetchWrapper(requestOptions) {
        try {
            const basket = this._controlElements.class.value.toLowerCase();
            const url = new URL(basket, BACKEND_URL);

            return await fetch(url.toString(), requestOptions);
        } catch(error) {
            this.notificationHandler("Network error", error.message);
        }
    }

    uploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async (event) => {
            const [ fileImage ] = fileInput.files;
            if (!fileImage) return;

            const formData = new FormData();
            formData.append('image', fileImage);

            fileInput.disabled = true;

            const requestOptions = {
                method: 'POST',
                headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
                body: formData,
                referrer: ''
            };

            try {
                const response = await fetch(`https://api.imgur.com/3/image`, requestOptions);
                const dataLink = await response.json();

                this._controlElements.url.firstElementChild.src = dataLink.data.link;
            } catch(error) {
                this.notificationHandler("Network error", error.message);
            }

            fileInput.disabled = false;
        }
    }

    addEventListeners() {
        const btnImageUpload = this._element.querySelector(".button-upload-image");
        btnImageUpload.addEventListener(`click`, this.uploadImage);

        this._element.addEventListener('submit', (event) => {
            const submitter = event.submitter;

            event.preventDefault();

            if (submitter.id === 'save') {
                this.save();
            } else if (submitter.id === 'delete') {
                this.delete();
            }
        });

        this._controlElements.id.addEventListener('blur', () => {
            let inputText = this._controlElements.id.value;
            this._controlElements.id.value = inputText.replace(/^\s*/, "").replace(/\s*$/, "");
        });

        this._controlElements.description.addEventListener('blur', () => {
            let inputText = this._controlElements.description.value;
            this._controlElements.description.value = inputText.replace(/^\s*/, "").replace(/\s*$/, "");
        });

        this._controlElements.bonuses.addEventListener('blur', () => {
            let inputText = this._controlElements.bonuses.value;
            this._controlElements.bonuses.value = inputText.replace(/^\s*/, "").replace(/\s*$/, "");
        });
    }

    notificationHandler(type = "", detail = "") {
        let notification = type;
        let newClass = "notification-success";

        if (type === "Network error") {
            newClass = "notification-error";
            notification = detail;
        }

        this._notificationBox.classList.add(newClass);
        this._notificationBox.innerHTML = notification;

        setTimeout(() => {
            this._notificationBox.classList.remove(newClass);
            this._notificationBox.innerHTML = "";
        }, 3000);
    }

    remove() {
        this._element.remove();
    }

    destroy() {
        this._data = null;
        this._controlElements = null;
        this._element = null;
        this.remove();
    }
}

const page = new ShipForm();
const element = page.render();

document.body.prepend(element);