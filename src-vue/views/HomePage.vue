<template>
    <el-container class="layout-container-demo" style="height:100vh">

        <!-- 側邊欄位區域 -->
        <el-aside width="200px" style="height:100vh">
            <!-- active-text-color / --bg-color 可以調整 menu 的顏色 -->
            <el-menu :collapse="isCollapse" active-text-color="#409EFF" :router=true :default-active="activeMenuItem">

                <!-- Dashboard page -->
                <el-menu-item index="/dashboard" class="home">
                    Radius 授權管理平台
                </el-menu-item>

                <!-- Radius manage page -->
                <el-menu-item index="/radius-manage">⚙️ 授權管理</el-menu-item>

                <!-- Logger page -->
                <el-sub-menu index="4">
                    <template #title>
                        <el-icon>
                            📝
                        </el-icon>
                        <span>Log 紀錄</span>
                    </template>
                    <el-menu-item index="/logger/login">登入紀錄</el-menu-item>
                    <el-menu-item index="/logger/auth">授權紀錄</el-menu-item>
                    <el-menu-item index="/logger/radius">修改紀錄</el-menu-item>
                </el-sub-menu>
            </el-menu>
        </el-aside>

        <!-- 內容區域 (包含 header & content) -->
        <el-container>

            <!-- header -->
            <el-header>
                <el-page-header @back="goBack">
                    <template #content>
                        <span class="text-large font-600 mr-3" style="font-size: 20px;">{{ pageTitle }}</span>
                    </template>
                    <template #extra>
                        <img src="/img/freeradius-engineer.svg" alt="Avatar"
                            style="width: 50px; height: 50px; margin-right: 10px; border-radius: 50%;">
                        <span class="text-sm mr-2 user-name">
                            {{ userProfile.username }}
                        </span>

                        <button @click="logOut()" class="logout-button">
                            <i class="bi bi-box-arrow-right"></i>
                        </button>
                    </template>
                </el-page-header>
            </el-header>

            <!-- content -->
            <el-main>
                <RouterView></RouterView>
            </el-main>

        </el-container>
    </el-container>
</template>


<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { changeLogState } from '@/stores/isLogin';
import { LoadType } from '@/@types/Response.types';


// pinia
const store = changeLogState();
const { Login, LogOut } = store;


const errorMessage_userProfile = ref('');
const route = useRoute();
const router = useRouter();
const pageTitle = ref('');      // 頁面標題
const activeMenuItem = ref(route.path);

const userProfile = ref({
    username: '',
    createdAt: ''
});


onMounted(async () => {
    await fetchUserProfile();

    // 設置頁面標題
    setPageTitle();

    // 監聽路由變化，在路由變化時更新頁面標題
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
        // console.log('/api/service/user/data', response.data);

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
        // 這邊跳例外都是 server 掛了
        console.error('Error fetching user profile:', error);
    }
};

const logOut = () => {
    axios.post('/api/service/logout')
        .catch((error) => {
            console.error('Error during logout:', error);
        });

    LogOut();
    router.push('/login');
};

const setPageTitle = () => {
    switch (route.path) {
        case '/dashboard':
            pageTitle.value = 'Dashboard';
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
            pageTitle.value = '404 ERROR';
    }
};

// 控制側邊欄 收合(true)/展開(false)
const isCollapse = ref(false);
const triggerMenu = () => {
    isCollapse.value = !isCollapse.value;
};

const goBack = () => {
    console.log(router.currentRoute.value.path);
    if (router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/') {
        router.go(-1);
    }
};

</script>


<style lang="scss" scoped>
.layout-container-demo {
    .el-menu {
        border-right: none;
    }

    .el-aside {
        border-right: #1fa8da 5px solid;

        // 同时具有 is-active 和 el-menu-item class 名稱的 li 元素，並且不能包含 home 
        li.is-active.el-menu-item:not(.home) {
            background: #97f0b94b;
            border: #000 10px solid inset;
            color: #01A5E0;
            font-weight: 900;
            font-size: 16px;

            &::before {
                content: "";
                display: inline-block;
                width: 30px;
                height: 30px;
                margin-right: 5px;
                background-image: url('/img/freeradius-bright.svg');
                /* 確保圖片不被裁切 */
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
            }

        }
    }
}

.el-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* Distribute space between items */
    padding: 0;
    margin: 0;
    border-bottom: #344332 4px dashed;

    .el-page-header {
        margin-left: 2%;
        width: 100%;
    }

    .user-name {
        color: var(--el-text-color-regular);
        font-size: 18px;
        font-weight: bold;
        margin-right: 22px;
    }

    .logout-button {
        background: none;
        border: none;
        cursor: pointer;
        margin-right: 20px;
        /* Allow positioning adjustments */
        position: relative;
        top: 2px;
    }

    .logout-button i {
        font-size: 26px;
        color: var(--el-text-color-regular);
    }

    .logout-button:hover i {
        color: #409EFF;
    }
}

.el-header .Collapse {
    display: flex;
    align-items: center;
    color: aliceblue;
    background: #86ccbd;
    border: #86ccbd 4px solid;
    border-left: 0;
    border-radius: 0 10px 10px 0;
}
</style>