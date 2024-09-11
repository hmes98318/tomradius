<template>
    <div class="contain">
        <div class="col text-center dashboard-card m-2 flex-fill">
            <h4 class="title">已授權裝置數</h4>
            <div class="fs-2">{{ AuthDevData }} <i class="fs-6">台</i></div>
        </div>
    </div>
</template>


<script setup lang="ts">
import axios from 'axios';
import { ref, onBeforeMount, computed } from 'vue';
import { LoadType } from '@/@types/Response.types';


const AuthDevData = ref<number>(0);      // 已授權裝置數

const getAuthDevData = async () => {
    try {
        const Response = await axios.get('/api/dashboard/authDevices');
        if (Response.data.loadType === LoadType.SUCCEED) {
            AuthDevData.value = Response.data.data[0].total_records;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


onBeforeMount(async () => {
    await Promise.allSettled([
        getAuthDevData()
    ]);
});

</script>

<style scoped>
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
    min-width: 300px;
    height: 200px;
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

.dashboard-card:hover {
    transform: scale(1.005);
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
    /* 螢光效果的 box-shadow，可以根據需要進行調整 */
}
</style>