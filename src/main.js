import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { ObserveVisibility } from 'vue-observe-visibility';

const app = createApp(App);
app.use(router);
app.directive('observe-visibility', ObserveVisibility);
app.mount("#app");
