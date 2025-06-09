<template>
    <el-config-provider :locale="locale">
        <HomePage v-if="isLogin"></HomePage>
        <LoginPage v-else></LoginPage>
    </el-config-provider>
</template>


<script lang="ts" setup>
import axios from 'axios';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import router from '@/router';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/user/LoginPage.vue';
import { changeLogState } from '@/stores/isLogin';
import { LoadType } from './@types/Response.types';

//  <!-- elementPlus 中文全域化設定 -->
import { defineComponent, ref } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhTw from 'element-plus/es/locale/lang/zh-tw';


const locale = ref(zhTw);
defineComponent({
    components: {
        ElConfigProvider,
    },
});


onMounted(async () => {
    // 確認登入狀態
    await checkLoginState();
});

const store = changeLogState();
const { piniaLogin, piniaLogout } = store;
const { isLogin } = storeToRefs(store);

/**
 * 預設值為 true 避免重新整理網頁還會加載一次 <LoginPage> 後消失, 
 * 給 checkLoginState() 判斷, 因為我不會寫 vue :(
 */
isLogin.value = true;


const checkLoginState = async () => {
    if (document.cookie.includes('sessionId=')) {
        try {
            const statusResponse = await axios.get('/api/service/session/validSession');

            // 顯示 homepage (登入成功，並且 sessionID 尚未過期)
            if (statusResponse.data.loadType === LoadType.SUCCEED) {
                piniaLogin();
            }
            else {
                // sessionId 過期, 清除 cookie 的 sessionId
                deleteSessionCookie();
                piniaLogout();
                router.push('/login');
            }
        } catch (error) {
            // API 掛了才會跳此錯誤
            deleteSessionCookie();
            piniaLogout();
            router.push('/login');
        }
    }
    else {
        piniaLogout();
        router.push('/login');
    }
    console.log(`是否登入 : ${isLogin.value}`);
};


/**
 * 清除 cookie 中的 sessionId
 */
const deleteSessionCookie = () => {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const [name] = cookie.split('=');

        if (name === 'sessionId') {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    }
};
</script>