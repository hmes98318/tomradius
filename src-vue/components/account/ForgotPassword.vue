<template>
    <div>
        <div class="forgot-password-container">
            <div class="forgot-password-box">
                <h2>忘記密碼</h2>
                <p>此帳號與 Ubuntu 上的帳號相通</p>

                <button @click="closePage()" class="btn">關閉</button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';


const props = defineProps({
    onExit: Function,
});




/**
 * 關閉介面
 */
const closePage = () => {
    if (props.onExit) {
        props.onExit();
    }
};
</script>


<style lang="scss" scoped>
/*----- registerPage -----*/

.forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
}

/* 添加背景模糊效果 */
.forgot-password-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    /* 模糊效果 權重 */
    z-index: -1;
}

.forgot-password-box {
    /* 註冊框 權重 */
    z-index: 100;
    border: 1px solid #ccc;
    padding: 40px;
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    max-width: 600px;
    width: 100%;
    transform: translateY(60px);
}

.forgot-password-box label {
    display: inline-block;
    margin-right: 10px;
    font-weight: bold;
}

/*----- 輸入框 -----*/

.input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
}

input[type="text"],
input[type="password"],
input[type="email"] {
    border: 1px solid #ccc;
    padding: 10px;
    width: calc(100% - 22px);
    border-radius: 5px;
    margin: 5px 0;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
    border-color: #498A67;
    outline: none;
}

/*----- 輸入框左右對切 -----*/

.form-container {
    display: flex;
}

.left-column {
    flex: 1;
    padding-right: 10px;
}

.right-column {
    flex: 1;
    padding-left: 10px;
}

/*----- END 輸入框左右對切 -----*/

/*----- END 輸入框 -----*/


/*----- 按鈕 -----*/

.btn {
    /* 按鈕寬度 */
    width: calc(35% - 12px);
    padding: 10px 0;
    margin-top: 20px;
    border: none;
    border-radius: 5px;
    background-color: #01A5E0;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
}

/* 按鈕懸停效果 */
.btn:hover {
    background-color: #028abb;
    color: #fff;
}

/* 調整按鈕並排間距 */
.btn+.btn {
    margin-left: 15%;
}

/*----- END 按鈕 -----*/

/* 錯誤訊息 */
.msg-container {
    margin-top: 10px;
    color: red;
}

/*----- END registerPage -----*/
</style>