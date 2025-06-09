<template>
    <div class="login-page-container">
        <!-- 背景區域 -->
        <div class="login-background">
            <div class="left-panel"></div>
            <div class="right-panel"></div>
        </div>

        <!-- 主要登入區域 -->
        <div class="content-container">
            <div class="brand-section">
                <div class="logo-container">
                    <img src="/img/freeradius-network.svg" alt="Logo" class="logo-image" />
                </div>
            </div>

            <!-- 登入表單區域 -->
            <div class="login-form-container">
                <div class="form-header">
                    <h2>Radius 認證管理平台</h2>
                </div>

                <form @submit.prevent="handleLogin()" class="login-form">
                    <!-- 帳號輸入框 -->
                    <div class="form-group">
                        <label for="username">
                            <i class="bi bi-person"></i>
                            帳號
                        </label>
                        <div class="input-container">
                            <input v-model="loginForm.username" type="text" id="username" placeholder="請輸入帳號"
                                autocomplete="username" :disabled="isLoading" />
                        </div>
                    </div>

                    <!-- 密碼輸入框 -->
                    <div class="form-group">
                        <label for="password">
                            <i class="bi bi-lock"></i>
                            密碼
                        </label>
                        <div class="input-container">
                            <input v-model="loginForm.password" :type="isPasswordVisible ? 'text' : 'password'"
                                id="password" placeholder="請輸入密碼" autocomplete="current-password"
                                :disabled="isLoading" />
                            <button type="button" class="password-toggle" @click="togglePasswordVisibility()"
                                tabindex="-1" :disabled="isLoading">
                                <i :class="isPasswordVisible ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 忘記密碼按鈕 -->
                    <div class="forgot-password-section">
                        <a @click.prevent="openForgotPasswordDialog" class="forgot-link"
                            :class="{ 'disabled': isLoading }">
                            忘記密碼?
                        </a>
                    </div>

                    <!-- 登入按鈕 -->
                    <div class="action-section">
                        <button type="submit" class="login-button" :disabled="isLoading">
                            <template v-if="isLoading">
                                <i class="bi bi-arrow-repeat spin-icon"></i>
                                <span>登入中...</span>
                            </template>
                            <template v-else>
                                <span>登入系統</span>
                                <i class="bi bi-arrow-right"></i>
                            </template>
                        </button>
                    </div>
                </form>

                <div class="copyright-info">
                    © 2024 - {{ currentYear }} Radius 認證管理平台 - www.solartech.com.tw
                </div>
            </div>
        </div>

        <!-- 忘記密碼對話框 -->
        <el-dialog v-model="forgotPasswordDialogVisible" title="忘記密碼" :width="dialogWidth" :show-close="true" center
            custom-class="forgot-password-dialog">
            <div class="forgot-password-content">
                <div class="description-section">
                    <i class="bi bi-info-circle-fill"></i>
                    <p>此帳號與 Ubuntu 上的帳號相通，如需重設密碼，請聯絡系統管理員</p>
                </div>

                <!--
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="bi bi-envelope"></i>
                        <span>管理員信箱：<a href="mailto:admin@example.com">admin@example.com</a></span>
                    </div>
                    <div class="contact-item">
                        <i class="bi bi-telephone"></i>
                        <span>分機：1234</span>
                    </div>
                </div>
                -->
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="closeForgotPasswordDialog">我知道了</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>


<script setup lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import {
    computed,
    onMounted,
    onUnmounted,
    ref
} from 'vue';

import router from '@/router';
import { changeLogState } from '@/stores/isLogin';
import { LoadType } from '@/@types/Response.types';


const store = changeLogState();
const { piniaLogin, piniaLogout } = store;

const currentYear = computed(() => new Date().getFullYear());

let isLoading = ref(false);
let isPasswordVisible = ref(false);

// 忘記密碼對話框控制
const forgotPasswordDialogVisible = ref(false);

// 登入表單
const loginForm = ref({
    username: '',
    password: ''
});

// 響應式對話框寬度
const dialogWidth = ref('500px');

// 監聽視窗大小變化
const handleResize = () => {
    // 根據視窗寬度調整對話框寬度
    if (window.innerWidth <= 576) {
        dialogWidth.value = '90%';
    }
    else {
        dialogWidth.value = '500px';
    }
};

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});


/**
 * 開啟忘記密碼對話框
 */
const openForgotPasswordDialog = () => {
    if (isLoading.value) return;
    forgotPasswordDialogVisible.value = true;
};

/**
 * 關閉忘記密碼對話框
 */
const closeForgotPasswordDialog = () => {
    forgotPasswordDialogVisible.value = false;
};

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
    if (isLoading.value) return;

    // 參數檢查
    if (!loginForm.value.username || !loginForm.value.password) {
        ElMessage.error('請填寫所有必填欄位');
        return;
    }
    if (containsSpecialChars(loginForm.value.username) || containsSpecialChars(loginForm.value.password)) {
        ElMessage.error('欄位中不可包含以下任一字元 / \\ | < > = \\\' "');
        return;
    }

    // 開始登入流程，設置載入狀態
    isLoading.value = true;

    try {
        const loginResponse = await axios.post('/api/service/login', loginForm.value);

        // 登入成功
        if (loginResponse.data.loadType === LoadType.SUCCEED) {
            piniaLogin();
            router.push('/dashboard');
            router.replace('/dashboard');
            history.replaceState(null, '', '/dashboard');
            return;
        }
        // 已登入需跳轉
        else if (loginResponse.data.loadType === LoadType.SESSION_EXISTS) {
            ElMessage.info('您已經登入，正在跳轉...');
            piniaLogin();
            router.push('/dashboard');
            return;
        }
        // 帳號或密碼錯誤
        else if (loginResponse.data.loadType === LoadType.FAILED_LOGIN) {
            ElMessage.error('帳號或密碼錯誤');
            piniaLogout();
            return;
        }
        // 密碼錯誤太多次 被鎖幾分鐘
        else if (loginResponse.data.loadType === LoadType.BLOCKED_LOGIN) {
            ElMessage.error('密碼錯誤太多次，請稍後再試');
            piniaLogout();
            return;
        }
        // 參數錯誤 // 前端錯誤
        else if (loginResponse.data.loadType === LoadType.PARAMETER_ERROR) {
            ElMessage.error('網頁端參數錯誤，請聯絡管理員');
            return;
        }

        // 例外狀況
        throw new Error("登入時發生未知錯誤: " + JSON.stringify(loginResponse.data));
    } catch (error) {
        console.error('登入錯誤:', error);
        ElMessage.error('伺服器連接失敗，請稍後再試或聯絡管理員');
    } finally {
        isLoading.value = false;
    }
};

/**
 * 密碼眼睛開關
 */
const togglePasswordVisibility = () => {
    if (isLoading.value) return;
    isPasswordVisible.value = !isPasswordVisible.value;
};
</script>


<style lang="scss" scoped>
$primary-color: #01A5E0;
$primary-dark: #0183b3;
$accent-color: #34c7ff;
$error-color: #dc3545;
$text-color: #333333;
$light-text: #666666;
$border-color: #e0e0e0;
$background-light: #f8f9fa;
$shadow-color: rgba(0, 0, 0, 0.1);
$transition-time: 0.3s;

// 響應式斷點
$breakpoint-xl: 1200px;
$breakpoint-lg: 992px;
$breakpoint-md: 768px;
$breakpoint-sm: 576px;
$breakpoint-xs: 420px;

.login-page-container {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* 背景設計 */
.login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;

    .left-panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 40%;
        height: 100%;
        background: linear-gradient(135deg, #263238 0%, #37474F 100%);

        @media (max-width: $breakpoint-md) {
            width: 30%; // 調整中等尺寸設備的寬度
        }

        @media (max-width: $breakpoint-sm) {
            width: 0; // 在小螢幕上隱藏
        }
    }

    .right-panel {
        position: absolute;
        top: 0;
        left: 40%;
        width: 60%;
        height: 100%;
        background-color: $background-light;

        @media (max-width: $breakpoint-md) {
            left: 30%;
            width: 70%; // 調整中等尺寸設備的寬度
        }

        @media (max-width: $breakpoint-sm) {
            left: 0;
            width: 100%; // 在小螢幕上占據全寬
        }
    }
}

/* 內容容器 */
.content-container {
    display: flex;
    width: 80%;
    max-width: 1200px;
    min-height: 600px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px $shadow-color;
    overflow: hidden;
    margin: 20px;
    animation: fadeIn 0.5s ease-out;

    @media (max-width: $breakpoint-xl) {
        width: 90%;
        min-height: 550px;
    }

    @media (max-width: $breakpoint-lg) {
        flex-direction: column;
        min-height: auto;
    }

    @media (max-width: $breakpoint-sm) {
        width: 95%;
        margin: 10px;
        border-radius: 8px;
    }

    @media (max-width: $breakpoint-xs) {
        width: 98%;
        margin: 5px;
    }
}

/* 背景圖區域 */
.brand-section {
    flex: 1;
    background: linear-gradient(135deg, #01A5E0 0%, #3b7a91 100%);
    padding: 40px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;

    .logo-container {
        margin-bottom: 30px;

        .logo-image {
            width: 120px;
            height: 120px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));

            @media (max-width: $breakpoint-lg) {
                width: 100px;
                height: 100px;
            }

            @media (max-width: $breakpoint-sm) {
                width: 80px;
                height: 80px;
            }

            @media (max-width: $breakpoint-xs) {
                width: 70px;
                height: 70px;
            }
        }
    }

    @media (max-width: $breakpoint-lg) {
        padding: 30px 20px;
    }

    @media (max-width: $breakpoint-sm) {
        padding: 20px 15px;
    }

    @media (max-width: $breakpoint-xs) {
        padding: 15px 10px;
    }
}

/* 登入表單容器 */
.login-form-container {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: white;
    position: relative;

    .form-header {
        margin-bottom: 30px;
        text-align: center;

        h2 {
            font-size: 1.8rem;
            color: $text-color;
            margin: 0 0 10px;
            font-weight: 600;

            @media (max-width: $breakpoint-lg) {
                font-size: 1.6rem;
            }

            @media (max-width: $breakpoint-sm) {
                font-size: 1.4rem;
            }
        }

        @media (max-width: $breakpoint-lg) {
            margin-bottom: 25px;
        }

        @media (max-width: $breakpoint-sm) {
            margin-bottom: 20px;
        }
    }

    @media (max-width: $breakpoint-lg) {
        padding: 30px 20px;
    }

    @media (max-width: $breakpoint-sm) {
        padding: 20px 15px;
    }

    @media (max-width: $breakpoint-xs) {
        padding: 15px 10px;
    }
}

/* 表單樣式 */
.login-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;

    .form-group {
        margin-bottom: 25px;

        label {
            display: block;
            margin-bottom: 8px;
            color: $text-color;
            font-weight: 500;
            font-size: 0.95rem;

            i {
                margin-right: 8px;
                color: $primary-color;
            }

            @media (max-width: $breakpoint-sm) {
                font-size: 0.9rem;
                margin-bottom: 6px;
            }
        }

        .input-container {
            position: relative;

            input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid $border-color;
                border-radius: 8px;
                font-size: 1rem;
                transition: all $transition-time;

                &::placeholder {
                    color: #aaa;
                }

                &:focus {
                    border-color: $primary-color;
                    box-shadow: 0 0 0 3px rgba(1, 165, 224, 0.2);
                    outline: none;
                }

                @media (max-width: $breakpoint-sm) {
                    padding: 10px 12px;
                    font-size: 0.95rem;
                    border-radius: 6px;
                }

                @media (max-width: $breakpoint-xs) {
                    padding: 8px 10px;
                    font-size: 0.9rem;
                }
            }

            .password-toggle {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: $light-text;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 5px;

                &:hover {
                    color: $primary-color;
                }

                &:focus {
                    outline: none;
                }

                @media (max-width: $breakpoint-sm) {
                    font-size: 1.1rem;
                    right: 8px;
                }
            }
        }

        @media (max-width: $breakpoint-lg) {
            margin-bottom: 20px;
        }

        @media (max-width: $breakpoint-sm) {
            margin-bottom: 15px;
        }
    }

    @media (max-width: $breakpoint-sm) {
        max-width: 100%;
    }
}

/* 忘記密碼區塊 */
.forgot-password-section {
    text-align: right;
    margin-bottom: 20px;

    .forgot-link {
        color: $primary-color;
        font-size: 0.9rem;
        text-decoration: none;
        cursor: pointer;
        transition: color $transition-time;

        &:hover {
            color: $primary-dark;
            text-decoration: underline;
        }

        &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            pointer-events: none;
        }

        @media (max-width: $breakpoint-sm) {
            font-size: 0.85rem;
        }
    }

    @media (max-width: $breakpoint-lg) {
        margin-bottom: 15px;
    }

    @media (max-width: $breakpoint-sm) {
        margin-bottom: 12px;
    }
}

/* 按鈕區域 */
.action-section {
    margin-top: 10px;

    .login-button {
        width: 100%;
        padding: 14px 20px;
        background-color: $primary-color;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all $transition-time;
        display: flex;
        justify-content: center;
        align-items: center;

        span {
            margin-right: 10px;
        }

        i {
            font-size: 1.1rem;
            transition: transform $transition-time;
        }

        &:hover {
            background-color: $primary-dark;
            box-shadow: 0 4px 8px rgba(1, 165, 224, 0.3);

            i {
                transform: translateX(5px);
            }
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(1, 165, 224, 0.3);
        }

        &:disabled {
            background-color: #97cbe3;
            cursor: not-allowed;
            box-shadow: none;
        }

        @media (max-width: $breakpoint-sm) {
            padding: 12px 16px;
            font-size: 0.95rem;
            border-radius: 6px;
        }

        @media (max-width: $breakpoint-xs) {
            padding: 10px 14px;
            font-size: 0.9rem;
        }
    }

    @media (max-width: $breakpoint-lg) {
        margin-top: 8px;
    }
}

/* 版權資訊 */
.copyright-info {
    text-align: center;
    color: $light-text;
    font-size: 0.8rem;
    margin-top: 40px;
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;

    @media (max-width: $breakpoint-lg) {
        position: relative;
        margin-top: 30px;
        bottom: auto;
    }

    @media (max-width: $breakpoint-sm) {
        font-size: 0.75rem;
        margin-top: 25px;
    }

    @media (max-width: $breakpoint-xs) {
        font-size: 0.7rem;
        margin-top: 20px;
    }
}

/* 忘記密碼對話框樣式 */
:deep(.forgot-password-dialog) {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
        background-color: $primary-color;
        color: white;
        padding: 16px 20px;
        margin: 0;

        .el-dialog__title {
            color: white;
            font-weight: 600;
            font-size: 1.2rem;

            @media (max-width: $breakpoint-sm) {
                font-size: 1.1rem;
            }
        }

        .el-dialog__headerbtn {
            top: 16px;

            .el-dialog__close {
                color: rgba(255, 255, 255, 0.8);

                &:hover {
                    color: white;
                }
            }
        }

        @media (max-width: $breakpoint-sm) {
            padding: 12px 16px;
        }
    }

    .el-dialog__body {
        padding: 25px;

        @media (max-width: $breakpoint-sm) {
            padding: 20px 15px;
        }

        @media (max-width: $breakpoint-xs) {
            padding: 15px 12px;
        }
    }

    .el-dialog__footer {
        border-top: 1px solid $border-color;
        padding: 16px 20px;
        text-align: center;

        @media (max-width: $breakpoint-sm) {
            padding: 12px 16px;
        }
    }

    @media (max-width: $breakpoint-sm) {
        border-radius: 8px;
    }
}

.forgot-password-content {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .description-section {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        background-color: rgba($primary-color, 0.1);
        padding: 16px;
        border-radius: 8px;

        i {
            font-size: 24px;
            color: $primary-color;
            margin-top: 2px;

            @media (max-width: $breakpoint-sm) {
                font-size: 20px;
            }

            @media (max-width: $breakpoint-xs) {
                font-size: 18px;
            }
        }

        p {
            margin: 0;
            color: $text-color;
            line-height: 1.5;
            font-size: 15px;

            @media (max-width: $breakpoint-sm) {
                font-size: 14px;
                line-height: 1.4;
            }

            @media (max-width: $breakpoint-xs) {
                font-size: 13px;
            }
        }

        @media (max-width: $breakpoint-sm) {
            padding: 12px;
            gap: 12px;
            border-radius: 6px;
        }
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;

            i {
                color: $primary-color;
                font-size: 18px;

                @media (max-width: $breakpoint-sm) {
                    font-size: 16px;
                }
            }

            span {
                color: $text-color;
                font-size: 15px;

                @media (max-width: $breakpoint-sm) {
                    font-size: 14px;
                }
            }

            a {
                color: $primary-color;
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }

            @media (max-width: $breakpoint-sm) {
                gap: 8px;
            }
        }

        @media (max-width: $breakpoint-sm) {
            gap: 10px;
        }
    }

    @media (max-width: $breakpoint-sm) {
        gap: 20px;
    }
}

/* 登入按鈕載入狀態 */
.spin-icon {
    animation: spin 1s linear infinite;
    margin-right: 8px;
    font-size: 1.1rem;

    @media (max-width: $breakpoint-sm) {
        font-size: 1rem;
        margin-right: 6px;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 動畫效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>