<template>
    <div class="contain">
        <div class="col text-center dashboard-card m-2 flex-fill">
            <h4 class="title">最近7天授權成功與失敗次數</h4>
            <!-- 折線圖 -->
            <div class="chart-container">
                <Line :data="chartData" :chart-options="chartOptions" />
            </div>
        </div>

        <div class="col text-center dashboard-card rankings m-2 flex-fill">
            <h4 class="title">當天驗證數排行榜</h4>
            <ul class="ranklist-container">
                <li v-if="authRankListData.length === 0" class="no-data">
                    沒有今天數據
                </li>
                <li v-for="(item, index) in authRankListData" :key="index"
                    :class="{ 'success': item.is_success, 'failure': !item.is_success }">
                    <span>{{ item.device }}</span>
                    <span>{{ item.count }}</span>
                </li>
            </ul>
        </div>

        <div class="col text-center dashboard-card m-2 flex-fill">
            <h4 class="title">已授權裝置數</h4>
            <div class="number-data-container">
                <div class="fs-2">{{ authDevData }} <i class="fs-6">台</i></div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement
} from 'chart.js';

import { convertUTCtoLocal } from '@/components/util/formatDate';
import { formatDate } from '@/components/util/formatDate';
import { LoadType } from '@/@types/Response.types';


type AuthCountData = {
    date: string;
    success: number;
    fail: number;
}
type AuthRankList = {
    device: string;
    count: number;
    is_success: boolean;
}


// 註冊 chart.js 模組
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);


const authDevData = ref<number>(0);                     // 已授權裝置數
const authCountData = ref<AuthCountData[]>([]);         // 最近幾天授權成功失敗數
const authRankListData = ref<AuthRankList[]>([]);       // 最近幾天授權成功失敗數


onBeforeMount(async () => {
    await Promise.allSettled([
        getAuthDevData(),
        getAuthCountData(7),
        getAuthRankListData(10)
    ]);
});


const getAuthDevData = async () => {
    try {
        const response = await axios.get('/api/dashboard/authDevices');
        if (response.data.loadType === LoadType.SUCCEED) {
            authDevData.value = response.data.data[0].total_records;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const getAuthCountData = async (days: number) => {
    try {
        const data = {
            days: days
        };
        const response = await axios.get('/api/dashboard/authCount', { params: data });
        if (response.data.loadType === LoadType.SUCCEED) {
            response.data.data.map((item: any) => {
                item.date = formatDate(convertUTCtoLocal(item.date));
                return item;
            });
            authCountData.value = response.data.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const getAuthRankListData = async (count: number) => {
    try {
        const data = {
            count: count
        };
        const response = await axios.get('/api/dashboard/authRankList', { params: data });
        if (response.data.loadType === LoadType.SUCCEED) {
            authRankListData.value = response.data.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


// 处理 authCountData，生成 chart.js 所需的数据格式
const chartData = computed(() => {
    const labels = authCountData.value.map(item => item.date);              // 日期作為 X 軸
    const successData = authCountData.value.map(item => item.success);      // 授權成功
    const failData = authCountData.value.map(item => item.fail);            // 授權失敗

    return {
        labels,
        datasets: [
            {
                label: '成功',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                data: successData,
                fill: false,
            },
            {
                label: '失敗',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: failData,
                fill: false,
            },
        ],
    };
});

// Chart.js 圖表選項
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: '最近7天授權成功與失敗次數',
        },
    },
};

</script>


<style lang="css" scoped>
.contain {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
}


.title {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    font-family: 'Noto Sans TC', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #444444;
    border-bottom: #1d1d1d dotted 1px;
}


.dashboard-card {
    position: relative;
    /* display: flex; */
    flex-direction: column;
    height: auto;
    width: auto;
    min-height: 150px;
    max-width: 600px;
    box-shadow: 4px 4px 6px -1px rgba(0, 0, 0, 0.2),
        -4px -4px 6px -1px rgba(255, 255, 255, 0.7),
        -0.5px -0.5px 0px rgba(255, 255, 255, 1),
        0.5px 0.5px 0px rgba(0, 0, 0, 0.15),
        0px 12px 10px -10px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: transform 0.3s ease-in-out;
    -webkit-user-select: none;
    user-select: none;
}


.number-data-container {
    height: 100%;
    width: 100%;
}

.chart-container {
    height: 100%;
    width: 100%;
    /* 防止溢出 */
    position: relative;
}



.ranklist-container {
    list-style-type: none;
    padding: 0;
    max-height: 300px;
    min-width: 400px;
    /* 滾動條 */
    overflow-y: auto;
}

.ranklist-container li {
    padding: 10px;
    margin: 5px 0;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
}

.success {
    background-color: rgba(144, 238, 144, 0.3);
}

.failure {
    background-color: rgba(255, 99, 132, 0.3);
}

/* Custom scrollbar styles */
.ranklist-container::-webkit-scrollbar {
    /* Width of the scrollbar */
    width: 8px;
}

.ranklist-container::-webkit-scrollbar-track {
    /* Background of the track */
    background: rgba(240, 240, 240, 0.5);
    /* Rounded corners for the track */
    border-radius: 10px;
}

.ranklist-container::-webkit-scrollbar-thumb {
    /* Color of the scrollbar thumb */
    background: rgba(211, 211, 211, 0.7);
    /* Rounded corners for the thumb */
    border-radius: 10px;
}

.ranklist-container::-webkit-scrollbar-thumb:hover {
    /* Color of the thumb on hover */
    background: rgba(182, 182, 182, 0.7);
}
</style>