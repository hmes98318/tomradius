<template>
    <el-container class="layout-container">
        <!-- 側邊欄 -->
        <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
            <div class="sidebar-header">
                <h2 v-if="!isCollapse" class="site-title">Radius 認證管理平台</h2>
            </div>

            <el-scrollbar>
                <el-menu :collapse="isCollapse" :router="true" :default-active="activeMenuItem" class="main-menu"
                    background-color="#263238" text-color="#b8c7ce" active-text-color="#ffffff">

                    <!-- 儀表板 -->
                    <el-menu-item index="/dashboard" class="menu-item">
                        <el-icon>
                            <DataLine />
                        </el-icon>
                        <template #title>
                            <span>儀表板</span>
                        </template>
                    </el-menu-item>

                    <!-- 管理分類 -->
                    <div class="menu-section" v-if="!isCollapse">管理</div>
                    <el-menu-item index="/radius-manage" class="menu-item">
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <template #title>
                            <span>授權管理</span>
                        </template>
                    </el-menu-item>

                    <!-- 紀錄分類 -->
                    <div class="menu-section" v-if="!isCollapse">系統紀錄</div>
                    <el-menu-item index="/logger/login" class="menu-item">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <template #title>
                            <span>登入紀錄</span>
                        </template>
                    </el-menu-item>

                    <el-menu-item index="/logger/auth" class="menu-item">
                        <el-icon>
                            <Key />
                        </el-icon>
                        <template #title>
                            <span>授權紀錄</span>
                        </template>
                    </el-menu-item>

                    <el-menu-item index="/logger/radius" class="menu-item">
                        <el-icon>
                            <List />
                        </el-icon>
                        <template #title>
                            <span>修改紀錄</span>
                        </template>
                    </el-menu-item>
                </el-menu>
            </el-scrollbar>

            <!-- 用戶資訊區域 -->
            <div class="user-profile" v-if="!isCollapse">
                <img src="/img/freeradius-engineer.svg" alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <div class="username">{{ userProfile.username }}</div>
                    <el-button size="small" type="text" @click="logOut" class="logout-link">
                        <el-icon>
                            <SwitchButton />
                        </el-icon> 登出系統
                    </el-button>
                </div>
            </div>

            <div class="user-profile-collapsed" v-else @click="logOut">
                <el-tooltip content="登出系統" placement="right">
                    <el-icon size="20">
                        <SwitchButton />
                    </el-icon>
                </el-tooltip>
            </div>

            <!-- 折疊按鈕 - 移動到側邊欄下方 -->
            <div class="collapse-btn" @click="triggerMenu" :class="{ 'collapsed': isCollapse }">
                <el-icon :size="16">
                    <ArrowLeft v-if="!isCollapse" />
                    <ArrowRight v-else />
                </el-icon>
            </div>
        </el-aside>

        <!-- 內容區域 -->
        <el-container class="main-content">
            <!-- 頂部導航 -->
            <el-header class="main-header">
                <div class="header-left">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/dashboard' }">首頁</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <h1 class="page-title">{{ pageTitle }}</h1>
                </div>

                <div class="header-right">
                    <div class="user-info-minimal" v-if="userProfile.username">
                        <span class="username">{{ userProfile.username }}</span>
                        <img src="/img/freeradius-engineer.svg" alt="Avatar" class="user-avatar-small">
                    </div>
                </div>
            </el-header>

            <!-- 主要內容區域 -->
            <el-main class="page-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>


<script lang="ts" setup>
import axios from 'axios';
import {
    Setting,
    UserFilled,
    Key,
    List,
    DataLine,
    ArrowLeft,
    ArrowRight,
    SwitchButton
} from '@element-plus/icons-vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { changeLogState } from '@/stores/isLogin';
import { LoadType } from '@/@types/Response.types';


const store = changeLogState();
const { piniaLogout } = store;

const errorMessage_userProfile = ref('');
const route = useRoute();
const router = useRouter();
const pageTitle = ref('');
const activeMenuItem = ref(route.path);

// 控制側邊欄折疊狀態
const isCollapse = ref(localStorage.getItem('sidebarCollapsed') === 'true');

// 監聽折疊狀態變化並保存到本地存儲
watch(isCollapse, (newValue) => {
    localStorage.setItem('sidebarCollapsed', String(newValue));
});

const userProfile = ref({
    username: '',
    createdAt: ''
});

onMounted(async () => {
    await fetchUserProfile();
    setPageTitle();

    // 監聽路由變化，更新頁面標題和活動菜單項
    router.afterEach((to) => {
        setPageTitle();
        activeMenuItem.value = to.path;
    });
});

/**
 * 獲取使用者個人資料
 */
const fetchUserProfile = async () => {
    try {
        const response = await axios.get('/api/service/user/data');

        if (response.data.loadType === LoadType.SUCCEED) {
            const userData = response.data.data[0];
            userProfile.value = { ...userData };
            return;
        }
        else {
            if (response.data.loadType === LoadType.UNAUTHORIZED) {
                errorMessage_userProfile.value = '登入狀態已過期，請重新整理網頁';
                return;
            }
            else {
                errorMessage_userProfile.value = '獲取使用者資料失敗，伺服器錯誤，請聯絡管理員' + JSON.stringify(response.data);
                return;
            }
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

/**
 * 登出系統
 */
const logOut = () => {
    axios.post('/api/service/logout')
        .catch((error) => {
            console.error('Error during logout:', error);
        });

    piniaLogout();
    router.push('/login');
};

/**
 * 設置頁面標題
 */
const setPageTitle = () => {
    switch (route.path) {
        case '/dashboard':
            pageTitle.value = '儀表板';
            break;
        case '/radius-manage':
            pageTitle.value = '授權管理';
            break;
        case '/logger/auth':
            pageTitle.value = 'Radius 裝置授權紀錄';
            break;
        case '/logger/login':
            pageTitle.value = '登入紀錄';
            break;
        case '/logger/radius':
            pageTitle.value = 'Radius 修改紀錄';
            break;
        default:
            pageTitle.value = '頁面不存在';
    }
};

/**
 * 折疊/展開側邊欄
 */
const triggerMenu = () => {
    isCollapse.value = !isCollapse.value;
};
</script>


<style lang="scss" scoped>
// 全局樣式
body {
    margin: 0;
    padding: 0;
    font-family: 'PingFang TC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    overflow: hidden;
}

// 主容器
.layout-container {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #f5f7fa;
}

// 側邊欄
.sidebar {
    position: relative;
    background-color: #263238;
    color: #b8c7ce;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;

    .sidebar-header {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .logo {
            height: 40px;
            width: 40px;
            transition: all 0.3s ease;

            &.small-logo {
                height: 30px;
                width: 30px;
            }
        }

        .site-title {
            margin-left: 12px;
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
        }
    }

    .collapse-btn {
        position: absolute;
        right: 0px;
        /* 將按鈕移到底部 - 定位在用戶資訊區域上方 */
        bottom: 150px;
        width: 24px;
        height: 50px;
        background: #409EFF;
        border-radius: 25px 0 0 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        /* 提高 z-index 確保不被其他元素覆蓋 */
        z-index: 100;
        color: white;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        border-left: 1px solid rgba(255, 255, 255, 0.2);

        &:hover {
            width: 28px;
            right: 0px;
            background: #409EFF;
        }

        &:active {
            transform: scale(0.95);
        }

        &.collapsed {
            right: 0px;
            border-radius: 25px 0 0 25px;
        }

        .el-icon {
            transition: transform 0.2s ease;
        }

        &:hover .el-icon {
            transform: scale(1.2);
        }
    }

    .main-menu {
        border-right: none;

        .menu-item {
            border-left: 3px solid transparent;

            &.is-active {
                border-left: 3px solid #409EFF;
                background-color: #1e282c !important;
            }

            &:hover {
                background-color: #2c3b41 !important;
            }

            .el-icon {
                margin-right: 6px;
                font-size: 18px;
            }
        }
    }

    .menu-section {
        font-size: 12px;
        color: #6c7b88;
        padding: 12px 20px 4px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
}

// 用戶資訊區域
.user-profile {
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.1);

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 12px;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
        flex: 1;

        .username {
            font-weight: 600;
            color: #ffffff;
            font-size: 14px;
            margin-bottom: 4px;
        }

        .logout-link {
            font-size: 12px;
            color: #b8c7ce;
            padding: 0;

            &:hover {
                color: #409EFF;
            }

            .el-icon {
                margin-right: 4px;
            }
        }
    }
}

.user-profile-collapsed {
    margin-top: auto;
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #b8c7ce;

    &:hover {
        color: #409EFF;
    }
}

// 頂部導航
.main-header {
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 60px;

    .header-left {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .el-breadcrumb {
            font-size: 12px;
            margin-bottom: 4px;
        }

        .page-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
    }

    .header-right {
        display: flex;
        align-items: center;

        .user-info-minimal {
            display: flex;
            align-items: center;

            .username {
                margin-right: 10px;
                font-size: 14px;
                color: #666;
            }

            .user-avatar-small {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #f2f2f2;
            }
        }
    }
}

// 主內容區域
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.page-content {
    flex: 1;
    overflow: hidden;
    padding: 20px;
}

// 過渡動畫
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>