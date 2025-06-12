<template>
    <el-main class="dashboard-main">
        <!-- 加載狀態覆蓋層 -->
        <div v-if="isLoading" class="loading-overlay">
            <el-icon class="loading-icon">
                <Loading />
            </el-icon>
            <span>載入中...</span>
        </div>

        <!-- 頂部統計區塊 -->
        <div class="statistics-row">
            <el-card class="stat-card authorized-devices">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>已授權裝置數</span>
                    </div>
                </template>
                <div class="stat-value-container">
                    <div class="stat-value">{{ authDevData }}</div>
                    <div class="stat-label">台設備</div>
                </div>
            </el-card>

            <el-card class="stat-card success-rate">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>成功率</span>
                    </div>
                </template>
                <div class="stat-value-container">
                    <div class="stat-value">{{ successRate }}%</div>
                    <div class="stat-label">近7天平均</div>
                </div>
            </el-card>

            <el-card class="stat-card total-auths">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Histogram />
                        </el-icon>
                        <span>總驗證次數</span>
                    </div>
                </template>
                <div class="stat-value-container">
                    <div class="stat-value">{{ totalAuths }}</div>
                    <div class="stat-label">近7天總計</div>
                </div>
            </el-card>
        </div>

        <!-- 圖表與排行榜區域 -->
        <div class="charts-row">
            <!-- 驗證趨勢圖 -->
            <el-card class="chart-card trend-chart">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <TrendCharts />
                        </el-icon>
                        <span>驗證趨勢 (近7天)</span>
                        <div class="header-actions">
                            <el-button size="small" circle @click="refreshData">
                                <el-icon>
                                    <Refresh />
                                </el-icon>
                            </el-button>
                        </div>
                    </div>
                </template>
                <div class="chart-container">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </el-card>

            <!-- 當天驗證排行榜 -->
            <el-card class="chart-card rank-list">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>今日裝置驗證排行</span>
                        <div class="header-actions">
                            <el-tooltip content="僅顯示今日驗證資料" placement="top">
                                <el-icon>
                                    <InfoFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                </template>
                <div class="rank-list-container">
                    <el-empty v-if="authRankListData.length === 0" description="今日尚無驗證資料" />
                    <ul v-else class="rank-list-items">
                        <li v-for="(item, index) in authRankListData" :key="index" class="rank-item"
                            :class="{ 'success': item.is_success, 'failure': !item.is_success }">
                            <div class="rank-item-left">
                                <div class="rank-number">{{ index + 1 }}</div>
                                <el-icon v-if="item.is_success" class="status-icon success">
                                    <Check />
                                </el-icon>
                                <el-icon v-else class="status-icon failure">
                                    <Close />
                                </el-icon>
                                <span class="device-name">{{ item.device }}</span>
                            </div>
                            <div class="rank-item-right">
                                <div class="auth-count">{{ item.count }}</div>
                                <span class="count-label">次</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </el-card>
        </div>

        <!-- 最近驗證活動卡片 -->
        <el-card class="activity-card">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Clock />
                    </el-icon>
                    <span>最近驗證活動</span>
                </div>
            </template>
            <div class="activity-timeline">
                <el-timeline v-if="recentActivities && recentActivities.length > 0">
                    <el-timeline-item v-for="(activity, index) in recentActivities" :key="index"
                        :type="activity.success ? 'success' : 'danger'"
                        :color="activity.success ? '#67C23A' : '#F56C6C'">
                        <div class="timeline-content">
                            <span class="activity-device">{{ activity.device }}</span>
                            <span class="activity-time">{{ activity.time }}</span>
                            <span class="activity-status"
                                :class="{ 'success': activity.success, 'failure': !activity.success }">
                                {{ activity.success ? '驗證成功' : '驗證失敗' }}
                            </span>
                        </div>
                    </el-timeline-item>
                </el-timeline>
                <el-empty v-else description="暫無驗證活動記錄" :image-size="100" />
            </div>
        </el-card>
    </el-main>
</template>


<script setup lang="ts">
import axios from 'axios';
import {
    BarElement,
    Chart as ChartJS,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement
} from 'chart.js';
import { ref, onBeforeMount, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
    Check,
    Close,
    Clock,
    Histogram,
    InfoFilled,
    List,
    Loading,
    Monitor,
    Refresh,
    TrendCharts
} from '@element-plus/icons-vue';

import { convertUTCtoLocal, formatDate } from '@/components/util/formatDate';
import { LoadType } from '@/@types/Response.types';

import type { ChartOptions } from 'chart.js';


/**
 * 驗證成功失敗數資料類型
 */
type AuthCountData = {
    date: string;
    success: number;
    fail: number;
}

/**
 * 驗證排行資料類型
 */
type AuthRankList = {
    device: string;
    count: number;
    is_success: boolean;
}

/**
 * 最近驗證活動資料類型
 */
type RecentActivity = {
    device: string;
    time: string;
    success: boolean;
}

// 註冊 Chart.js 元件
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// 資料狀態
const isLoading = ref(true);
const authDevData = ref<number>(0);
const authCountData = ref<AuthCountData[]>([]);
const authRankListData = ref<AuthRankList[]>([]);
const recentActivities = ref<RecentActivity[]>([]);


onBeforeMount(async () => {
    await refreshData();
});


const refreshData = async () => {
    isLoading.value = true;

    try {
        await Promise.allSettled([
            getAuthDevData(),
            getAuthCountData(7),
            getAuthRankListData(10),
            getRecentActivities(5)
        ]);
    } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
    } finally {
        isLoading.value = false;
    }
};

/**
 * 獲取已授權裝置數
 */
const getAuthDevData = async () => {
    try {
        const response = await axios.get('/api/dashboard/authDevices');
        if (response.data.loadType === LoadType.SUCCEED) {
            authDevData.value = response.data.data[0].total_records;
        }
    } catch (error) {
        console.error('Error fetching authorized devices data:', error);
    }
};

/**
 * 獲取最近幾天驗證成功失敗數
 */
const getAuthCountData = async (days: number) => {
    try {
        const response = await axios.get('/api/dashboard/authCount', {
            params: { days }
        });

        if (response.data.loadType === LoadType.SUCCEED) {
            authCountData.value = response.data.data.map((item: any) => ({
                ...item,
                date: formatDate(convertUTCtoLocal(item.date))
            }));
        }
    } catch (error) {
        console.error('Error fetching auth count data:', error);
    }
};

/**
 * 獲取當天驗證數排行
 */
const getAuthRankListData = async (count: number) => {
    try {
        const response = await axios.get('/api/dashboard/authRankList', {
            params: { count }
        });

        if (response.data.loadType === LoadType.SUCCEED) {
            authRankListData.value = response.data.data;
        }
    } catch (error) {
        console.error('Error fetching rank list data:', error);
    }
};

/**
 * 獲取最近驗證活動
 */
const getRecentActivities = async (count: number) => {
    try {
        const params = { limit: count };
        const response = await axios.get('/api/service/logger/radiusAuth', { params });

        if (response.data.loadType === LoadType.SUCCEED) {
            recentActivities.value = response.data.data.map((item: any) => {
                return {
                    device: item.mac_address,
                    time: convertUTCtoLocal(item.authdate),
                    success: item.is_accepted
                };
            });
        }
        else {
            console.error('Failed to fetch recent activities:', response.data);
        }
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        recentActivities.value = [];
    }
};


// 計算成功率
const successRate = computed(() => {
    if (authCountData.value.length === 0) return 0;

    const totalSuccess = authCountData.value.reduce((sum, item) => sum + item.success, 0);
    const totalFail = authCountData.value.reduce((sum, item) => sum + item.fail, 0);
    const total = totalSuccess + totalFail;

    return total > 0 ? Math.round((totalSuccess / total) * 100) : 0;
});

// 計算總驗證次數
const totalAuths = computed(() => {
    return authCountData.value.reduce((sum, item) => sum + item.success + item.fail, 0);
});

// 圖表數據
const chartData = computed(() => {
    const labels = authCountData.value.map(item => item.date);
    const successData = authCountData.value.map(item => item.success);
    const failData = authCountData.value.map(item => item.fail);

    return {
        labels,
        datasets: [
            {
                label: '驗證成功',
                backgroundColor: 'rgba(103, 194, 58, 0.2)',
                borderColor: '#67C23A',
                pointBackgroundColor: '#67C23A',
                pointBorderColor: '#fff',
                data: successData,
                tension: 0.4
            },
            {
                label: '驗證失敗',
                backgroundColor: 'rgba(245, 108, 108, 0.2)',
                borderColor: '#F56C6C',
                pointBackgroundColor: '#F56C6C',
                pointBorderColor: '#fff',
                data: failData,
                tension: 0.4
            }
        ]
    };
});

// 圖表選項配置
const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(200, 200, 200, 0.2)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#e1e1e1',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true
        }
    }
};
</script>


<style lang="scss" scoped>
$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$info-color: #909399;
$border-color: #EBEEF5;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$background-color: #F5F7FA;

:deep(.el-container) {
    height: 100vh;
    overflow: hidden;
}

.dashboard-main {
    padding: 20px;
    background-color: $background-color;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    // 滾動條美化
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 0, 0, 0.3);
        }
    }

    // Firefox 滾動條美化
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);

    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;

        .loading-icon {
            font-size: 32px;
            color: $primary-color;
            animation: rotate 2s linear infinite;
            margin-bottom: 10px;
        }
    }

    .card-header {
        display: flex;
        align-items: center;
        color: $text-primary;
        font-weight: 600;

        .el-icon {
            margin-right: 8px;
            font-size: 18px;
        }

        .header-actions {
            margin-left: auto;
            display: flex;
            align-items: center;

            .el-icon {
                margin-right: 0;
                font-size: 16px;
                color: $info-color;
                cursor: pointer;

                &:hover {
                    color: $primary-color;
                }
            }
        }
    }

    // 頂部統計卡片區域
    .statistics-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 20px;

        .stat-card {
            transition: all 0.3s ease;
            border-radius: 8px;
            overflow: hidden;

            &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }

            &.authorized-devices :deep(.el-card__header) {
                background: linear-gradient(to right, #409EFF, #64B5F6);
                color: white;
            }

            &.success-rate :deep(.el-card__header) {
                background: linear-gradient(to right, #67C23A, #8BC34A);
                color: white;
            }

            &.total-auths :deep(.el-card__header) {
                background: linear-gradient(to right, #E6A23C, #FFC107);
                color: white;
            }

            :deep(.el-card__header) {
                padding: 15px;
                border-bottom: none;
            }

            :deep(.el-card__body) {
                padding: 20px;
            }

            .stat-value-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;

                .stat-value {
                    font-size: 36px;
                    font-weight: 700;
                    color: $text-primary;
                    line-height: 1.2;
                }

                .stat-label {
                    margin-top: 8px;
                    color: $text-secondary;
                    font-size: 14px;
                }
            }
        }
    }

    // 圖表區域
    .charts-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 20px;

        @media (max-width: 992px) {
            grid-template-columns: 1fr;
        }

        .chart-card {
            border-radius: 8px;
            overflow: hidden;

            &.trend-chart {
                .chart-container {
                    height: 300px;
                    position: relative;
                }
            }

            &.rank-list {
                .rank-list-container {
                    max-height: 300px;
                    overflow-y: auto;
                    scrollbar-width: thin;

                    &::-webkit-scrollbar {
                        width: 6px;
                    }

                    &::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 3px;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: #ccc;
                        border-radius: 3px;
                    }

                    &::-webkit-scrollbar-thumb:hover {
                        background: #aaa;
                    }

                    .rank-list-items {
                        list-style: none;
                        padding: 0;
                        margin: 0;

                        .rank-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 15px;
                            margin-bottom: 8px;
                            border-radius: 6px;
                            background-color: #f9f9f9;
                            transition: all 0.2s ease;

                            &:hover {
                                background-color: #f0f0f0;
                            }

                            &.success {
                                border-left: 4px solid $success-color;
                            }

                            &.failure {
                                border-left: 4px solid $danger-color;
                            }

                            .rank-item-left {
                                display: flex;
                                align-items: center;

                                .rank-number {
                                    width: 22px;
                                    height: 22px;
                                    border-radius: 50%;
                                    background-color: #eee;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 12px;
                                    margin-right: 10px;
                                    font-weight: bold;
                                    color: $text-secondary;
                                }

                                .status-icon {
                                    margin-right: 10px;
                                    font-size: 16px;

                                    &.success {
                                        color: $success-color;
                                    }

                                    &.failure {
                                        color: $danger-color;
                                    }
                                }

                                .device-name {
                                    font-size: 14px;
                                    color: $text-regular;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    max-width: 200px;
                                }
                            }

                            .rank-item-right {
                                display: flex;
                                align-items: center;

                                .auth-count {
                                    font-size: 18px;
                                    font-weight: bold;
                                    color: $text-primary;
                                    margin-right: 4px;
                                }

                                .count-label {
                                    font-size: 12px;
                                    color: $text-secondary;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 最近活動時間軸
    .activity-card {
        border-radius: 8px;
        overflow: hidden;

        .activity-timeline {
            padding: 10px 0;

            :deep(.el-timeline) {
                padding-left: 10px;

                .el-timeline-item__wrapper {
                    padding-left: 20px;

                    .timeline-content {
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;

                        .activity-device {
                            font-weight: 500;
                            color: $text-primary;
                        }

                        .activity-time {
                            color: $text-secondary;
                            font-size: 14px;
                        }

                        .activity-status {
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 12px;

                            &.success {
                                background-color: rgba($success-color, 0.1);
                                color: $success-color;
                            }

                            &.failure {
                                background-color: rgba($danger-color, 0.1);
                                color: $danger-color;
                            }
                        }
                    }
                }
            }
        }
    }
}

// 動畫
@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

// 響應式調整
@media (max-width: 768px) {
    .dashboard-main {
        padding: 10px;

        .statistics-row {
            grid-template-columns: 1fr;
            gap: 15px;
        }
    }
}
</style>