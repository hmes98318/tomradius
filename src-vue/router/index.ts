import { createRouter, createWebHistory } from 'vue-router';

import AuthLoggerPage from '@/views/logger/AuthLoggerPage.vue';
import DashboardPage from '@/views/DashboardPage.vue';
import LoginLoggerPage from '@/views/logger/LoginLoggerPage.vue';
import LoginPage from '@/views/user/LoginPage.vue';
import RadiusLoggerPage from '@/views/logger/RadiusLoggerPage.vue';
import RadiusManagePage from '@/views/RadiusManagePage.vue';

import NullPage from '@/views/NullPage.vue';


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/dashboard',
            name: 'DashboardPage',
            component: DashboardPage,
            props: true
        },
        {
            path: '/radius-manage',
            name: 'RadiusManagePage',
            component: RadiusManagePage,
            props: true
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
            props: true
        },
        {
            path: '/logger/auth',
            name: 'AuthLoggerPage',
            component: AuthLoggerPage,
            props: true
        },
        {
            path: '/logger/login',
            name: 'LoginLoggerPage',
            component: LoginLoggerPage,
            props: true
        },
        {
            path: '/logger/radius',
            name: 'RadiusLoggerPage',
            component: RadiusLoggerPage,
            props: true
        },


        {
            path: '/nullPage',
            name: 'nullPage',
            component: NullPage,
        },

        // catch-all 路由, 其他未定義的路徑
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
});

export default router;
