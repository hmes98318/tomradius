import { defineStore } from 'pinia';
import { ref } from 'vue';


export const changeLogState = defineStore('logState', () => {
    const isLogin = ref(false);

    function Login() {
        isLogin.value = true;
        console.log(`[console](isLogin.ts) pinia 內部 isLogin: ${isLogin.value} %c登入成功 !`,'color: #a5df95;');
    }
    function LogOut() {
        isLogin.value = false;
        console.log(`[console](isLogin.ts) pinia 內部 isLogin: ${isLogin.value} %c登出成功 !`,'color: #df9596;');
        deleteSessionCookie();
    }

    /**
    * 清除 cookie 中的 sessionId (會保留其他 cookie) 
    */
    const deleteSessionCookie = () => {
        try{
            const cookies = document.cookie.split(';');

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                const [name] = cookie.split('=');

                if (name === 'sessionId') {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                }
            }
            console.log(`[console](isLogin.ts) %c 狀態 & cookie 清除成功`,'color: #a5df95;');
            
        }catch{
            console.log('[console](isLogin.ts) %c 狀態 & cookie 清除失敗','color: #df9596;');
        }
        
    };

    return { isLogin, Login, LogOut, deleteSessionCookie };
});