<template>
    <div class="login-page" v-if="!isForgotPasswordPage">
        <h1 class="main-title">
            <img src="/img/freeradius-network.svg" alt="logo" class="title-logo" />
            Radius 認證管理平台
        </h1>
        <div class="login-container">
            <div class="login-box">
                <h2 class="mb-3">登入</h2>
                <form @submit.prevent="handleLogin()">
                    <div class="input mb-3">
                        <label for="username">帳號:</label>
                        <input v-model="loginForm.username" type="text" id="username" />
                    </div>
                    <div class="input" style="position: relative;">
                        <label for="password">密碼:</label>
                        <input :type="isPasswordVisible ? 'text' : 'password'" v-model="loginForm.password"
                            id="password" />
                        <i :class="isPasswordVisible ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"
                            @click="togglePasswordVisibility()"></i>
                    </div>

                    <!-- 忘記密碼 -->
                    <span class="forgot-password-btn">
                        <i @click="changeForgotPasswordPage()">忘記密碼？</i>
                    </span>

                    <!-- 錯誤訊息 -->
                    <div class="msg-container" v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>

                    <div class="button-container">
                        <button type="submit" class="btn">登入</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 忘記密碼彈窗 -->
    <div v-if="isForgotPasswordPage">
        <ForgotPassword :onExit="changeForgotPasswordPage" />
    </div>

</template>


<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';

import router from '@/router';
import { changeLogState } from '@/stores/isLogin';
import { LoadType } from '@/@types/Response.types';

import ForgotPassword from '@/components/account/ForgotPassword.vue';


// pinia
const store = changeLogState();
const { Login, LogOut } = store;


let errorMessage = ref('');
let isPasswordVisible = ref(false);         // 密碼眼睛按鈕開關

// 忘記密碼介面彈出
const isForgotPasswordPage = ref(false);
const changeForgotPasswordPage = () => {
    isForgotPasswordPage.value = !isForgotPasswordPage.value;
};

// 登入表單
const loginForm = ref({
    username: '',
    password: ''
});


/**
 * 檢查是否含有特定字串
 */
const containsSpecialChars = (str: string): boolean => {
    const specialChars = [' ', '/', '\\', '|', '<', '>', '=', '\'', '"'];
    return specialChars.some(char => str.includes(char));
};

/**
 * 登入處理
 */
const handleLogin = async () => {
    errorMessage.value = '';    // 清除錯誤訊息

    // 參數檢查
    if (!loginForm.value.username || !loginForm.value.password) {
        errorMessage.value = '請填寫所有必填欄位';
        return;
    }
    if (containsSpecialChars(loginForm.value.username) || containsSpecialChars(loginForm.value.password)) {
        errorMessage.value = '欄位中不可包含以下任一字元 / \\ | < > = \\\' "';
        return;
    }


    try {
        const loginResponse = await axios.post('/api/service/login', loginForm.value);

        // console.log(loginForm.value);
        // console.log(loginResponse);

        // 登入成功
        if (loginResponse.data.loadType === LoadType.SUCCEED) {
            Login();
            router.push('/dashboard');
            router.replace('/dashboard');
            history.replaceState(null, '', '/dashboard');

            // console.log('document.cookie', document.cookie);
            return;
        }
        // 已登入 需跳轉
        // 應該在載入網頁時就檢查有沒有 headers.cookie.sessionId 
        else if (loginResponse.data.loadType === LoadType.SESSION_EXISTS) {
            Login();
            router.push('/dashboard');
            // console.log('SESSION_EXISTS document.cookie', document.cookie);
            return;
        }
        // 帳號或密碼錯誤
        else if (loginResponse.data.loadType === LoadType.FAILED_LOGIN) {
            errorMessage.value = '帳號或密碼錯誤';
            LogOut();
            return;
        }
        // 密碼錯誤太多次 被鎖幾分鐘
        else if (loginResponse.data.loadType === LoadType.BLOCKED_LOGIN) {
            errorMessage.value = '密碼錯誤太多次，請稍後再試';
            LogOut();
            return;
        }
        // 參數錯誤 // 前端錯誤
        else if (loginResponse.data.loadType === LoadType.PARAMETER_ERROR) {
            errorMessage.value = '網頁端參數錯誤，請聯絡管理員';
            return;
        }

        // 例外狀況
        throw new Error("An unknown error occurred while logging in: " + JSON.stringify(loginResponse.data));
    } catch (error) {
        console.error('登入錯誤:', error);
        errorMessage.value = '伺服器意外關閉，請聯絡管理員 ' + error;
        // 處理登入錯誤，顯示訊息等
    }
};


/**
 * 密碼眼睛開關
 */
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};
</script>


<style lang="css" scoped>
/*----- loginPage -----*/

/* 標題 */
.main-title {
    text-align: center;
    margin-top: 50px;
    /* 增加標題字體大小 */
    font-size: 2.5rem;
    color: #333;
}

.title-logo {
    width: 100px;
    height: 100px;
    margin-right: 10px;
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
}

.login-box {
    border: 1px solid #000000;
    padding: 40px;
    text-align: center;
    /* 圓角 */
    border-radius: 8px;
    /* 陰影 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    max-width: 400px;
    /* 容器寬度 */
    width: 100%;
}

.login-box label {
    display: inline-block;
    margin-right: 10px;
    /* 字型加粗 */
    font-weight: bold;
    white-space: nowrap;
}

/*----- 輸入框 -----*/

.input {
    display: flex;
    align-items: center;
    position: relative;
}

.input i {
    position: absolute;
    right: 10px;
    cursor: pointer;
}

/* 輸入密碼的眼睛 */
.bi-eye-fill,
.bi-eye-slash-fill {
    font-size: 22px;
}

.bi-eye-fill:hover,
.bi-eye-slash-fill:hover {
    color: #555555;
}

/* 增加輸入框樣式 */
input[type="text"],
input[type="password"],
input[type="email"] {
    border: 1px solid #ccc;
    padding: 10px;
    /* 減去邊框和內邊距的總寬度 */
    width: calc(100% - 22px);
    border-radius: 5px;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
    /* 對焦時邊框顏色 */
    border-color: #01A5E0;
    /* 移除預設輪廓 */
    outline: none;
}

/*----- END 輸入框 -----*/

/*----- 按鈕 -----*/

.btn {
    width: 100%;
    /* 內邊距 */
    padding: 10px 0;
    /* 頂部間距 */
    margin-top: 20px;
    /* 去掉邊框 */
    border: none;
    /* 圓角 */
    border-radius: 5px;
    background-color: #01A5E0;
    /* 文字顏色 */
    color: #fff;
    /* 滑鼠手勢 */
    cursor: pointer;
    /* 過渡效果 */
    transition: background-color 0.3s;
}

/* 按鈕懸停效果 */
.btn:hover {
    background-color: #028abb;
    color: #fff;
}

/* 按鈕禁用 */
.btn[disabled] {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
}

/* 忘記密碼按鈕 */
.forgot-password-btn {
    margin-right: 5px;
    color: #0183b3;
    display: block;
    text-align: right;
}

.forgot-password-btn i:hover {
    color: #028abb;
    cursor: pointer;
    font-weight: bold;
    text-decoration: underline;
}

/*----- END 按鈕 -----*/

/*----- END loginPage -----*/
</style>