<template>
    <div>
        Server api : <strong>{{ serverApiVersion === '0.0.0' ? '' : `v${serverApiVersion}` }}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;
        (<span :style="{ color: serverApiPing === -1 ? 'red' : 'green' }">
            {{ serverApiPing === -1 ? '斷線' : `${serverApiPing}ms` }}
        </span>)
        <br><br>

        NLSC proxy : <strong>{{ nlscProxyVersion === '0.0.0' ? '' : `v${nlscProxyVersion}` }}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;
        (<span :style="{ color: nlscProxyPing === -1 ? 'red' : 'green' }">
            {{ nlscProxyPing === -1 ? '斷線' : `${nlscProxyPing}ms` }}
        </span>)
        <br><br>

        ======== API 模塊啟用狀態 ========
        <br>
        <template v-for="(value, key) in apiModuleStatus">
            <div class="status mb-2">

                <div v-if="value == true" class="status">
                    <div class="button me-2">
                        <span class="shadow"></span>
                        <span class="edge"></span>
                        <span class="front text">
                        </span>
                    </div>
                    <i class="me-2">已啟用</i>
                </div>

                <div v-if="value == false" class="status">

                    <div class="button button_false me-2">
                        <span class="shadow"></span>
                        <span class="edge"></span>
                        <span class="front text">
                        </span>
                    </div>
                    <i class="me-2">未啟用</i>
                </div>

                <div class="title">{{ key }}</div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';


const serverApiVersion = ref('0.0.0');
const nlscProxyVersion = ref('0.0.0');
const apiModuleStatus = ref();
const serverApiPing = ref(-1);
const nlscProxyPing = ref(-1);


// Server api version
const getApiVersion = async () => {
    try {
        const start = Date.now();
        const apiRresult = await axios.get('/api/version');
        const end = Date.now();


        if (apiRresult.data.loadType === LoadType.SUCCEED) {
            serverApiVersion.value = apiRresult.data.data[0].version;
            serverApiPing.value = end - start;
            return;
        }
    } catch (error) {
        console.error('Error fetching getApiVersion():', error);
    }
};

// NLSC proxy version
const getNlscVersion = async () => {
    try {
        const start = Date.now();
        const nlscResult = await axios.get('/mapApi/mapApi/version');
        const end = Date.now();

        if (nlscResult.data.loadType === LoadType.SUCCEED) {
            nlscProxyVersion.value = nlscResult.data.data[0].version;
            nlscProxyPing.value = end - start;
            return;
        }
    } catch (error) {
        console.error('Error fetching getApiVersion():', error);
    }
};

// Api 功能狀態
const getModuleStatus = async () => {
    try {
        const params = {
            type: 0,
        };
        const result = await axios.get('/api/service/status/apiModule', { params });

        if (result.data.loadType === LoadType.SUCCEED) {
            apiModuleStatus.value = result.data.data[0];
            return;
        }
    } catch (error) {
        console.error('Error fetching getModuleStatus():', error);
    }
};

onMounted(async () => {
    await Promise.allSettled([
        await getApiVersion(),
        await getNlscVersion(),
        await getModuleStatus()
    ]);
});
</script>

<style scoped>
.status {
    width: 200px;
    display: flex;
    justify-content: start;
    align-items: center;
}

.label {
    position: relative;
    margin: 0 10px;
    cursor: pointer;
}

.button {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.button_false {
    background: linear-gradient(135deg, #747474 0%, #585858 100%);
}

.button::before,
.button::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transition: all 0.3s ease;
}


.label input {
    display: none;
}

.label input:checked+.button {
    background: linear-gradient(135deg, #5c5c5b31 0%, #252525 100%);
    box-shadow: 0 10px 20px rgba(112, 95, 90, 0.4);
}

.label input:checked+.button::before {
    transform: scale(1.2);
    opacity: 1;
}

.label input:checked+.button::after {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1.1);
        opacity: 1;
    }

    50% {
        transform: scale(1.5);
        opacity: 0;
    }

    100% {
        transform: scale(1.1);
        opacity: 1;
    }
}

.shadow {
    position: absolute;
    bottom: 5px;
    width: 100%;
    height: 10px;
    border-radius: 50%;

}

.front {
    position: relative;
    z-index: 1;
}

.test {
    display: flex;

    justify-content: center;
    align-items: center;
}
</style>