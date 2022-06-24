import MainPage from "./main-page.js";

const page = new MainPage();
const element = await page.render();

document.body.prepend(element);
