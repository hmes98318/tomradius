// vue 3 依賴項
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 自定義樣式
import "@/assets/base.css";
import "@/assets/all.css";

// bootstrap 5 樣式引入
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

// vue 3 ElementPlus 組件引入
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElTableInfiniteScroll from "el-table-infinite-scroll";

// ElementPlus 中文設定
import zhTw from 'element-plus/es/locale/lang/zh-tw';
import 'dayjs/locale/zh-tw';

import { createPinia } from 'pinia';


const pinia = createPinia();

const app = createApp(App);

// el-icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(ElementPlus);
app.use(ElementPlus, { locale: zhTw });
app.use(ElTableInfiniteScroll);

app.use(router);
app.use(pinia);

app.mount('#app');
