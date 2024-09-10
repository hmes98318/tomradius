<template>
    <div class="data-container">
        <div class="data-box">
            <div class="data-form">
                <label class="data-name">MAC 地址:</label>
                <el-input v-model="newData.mac_address" size="large" placeholder="輸入數值" />

                <label class="data-name">電腦名稱:</label>
                <el-input v-model="newData.computer_name" size="large" placeholder="輸入數值" />

                <label class="data-name">員工名稱:</label>
                <el-input v-model="newData.employee_name" size="large" placeholder="輸入數值" />

                <label class="data-name">其他描述: (選填)</label>
                <el-input v-model="newData.description" size="large" placeholder="輸入數值 (選填)" />
            </div>

            <div class="msg-container" v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>

            <div class="btn-container">
                <el-button type="danger" class="el-btn" size="large" @click="exitPage">取消</el-button>
                <el-button type="primary" class="el-btn" size="large" @click="addData()">新增</el-button>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';

import { normalizeMacAddress } from '@/components/util/normalizeMacAddress';
import { LoadType } from '@/@types/Response.types';

import type { AxiosResponse } from 'axios';
import type { RadiusAddData } from '@/@types/category/Radius.types';
import type { ResultData } from '@/@types/Response.types';


const props = defineProps({
    message: String,
    exit: Boolean,
    onExit: Function,
    uuid: Number,
});

const errorMessage = ref('');               // 錯誤訊息顯示
const emits = defineEmits(['SUCESS_ADD']);  // 添加事件傳回去給父組件

const newData = ref<RadiusAddData>({
    mac_address: '',
    computer_name: '',
    employee_name: '',
    description: ''
});


onMounted(() => {
    // 添加事件監聽器
    window.addEventListener('keydown', handleKeyDown);
});

// 組件銷毀時移除
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

/**
 * 鍵盤事件處理程序
 */
const handleKeyDown = (event: KeyboardEvent) => {
    // ESC 關閉彈窗
    if (event.key === 'Escape') {
        exitPage();
    }
};


/**
 * 資料發送處理
 */
const addData = async () => {
    // 過濾掉多餘的空白及換行
    newData.value.mac_address = newData.value.mac_address.trim().replace(/\s+/g, '');

    if (!(/^([0-9a-fA-F]{2}[:.-]?){5}[0-9a-fA-F]{2}$/).test(newData.value.mac_address)) {
        errorMessage.value = '請輸入有效 MAC 地址';
        return;
    }
    if (!newData.value.computer_name || newData.value.computer_name === '') {
        errorMessage.value = '請輸入有效電腦名稱';
        return;
    }
    if (!newData.value.employee_name || newData.value.employee_name === '') {
        errorMessage.value = '請輸入有效員工名稱';
        return;
    }


    errorMessage.value = '';    // 清除錯誤訊息
    // console.log('newData', newData);

    try {
        const url = '/api/radius/addData';
        const data = {
            mac_address: normalizeMacAddress(newData.value.mac_address),
            computer_name: (newData.value.computer_name).toUpperCase(),
            employee_name: newData.value.employee_name,
            description: newData.value.description
        };
        const result: AxiosResponse<ResultData, any> = await axios.post(url, data);

        // console.log(result.data);

        if (result.data.loadType === LoadType.SUCCEED) {
            emits('SUCESS_ADD');
            exitPage();
            return;
        }
        else if (result.data.loadType === LoadType.DATA_EXISTED) {
            errorMessage.value = '已存在該 MAC 地址，請重新填寫';
            return;
        }
        else if (result.data.loadType === LoadType.UNAUTHORIZED) {
            errorMessage.value = '登入狀態已過期，請重新登入';
            return;
        }
        else if (result.data.loadType === LoadType.PATH_ERROR) {
            errorMessage.value = '網頁請求路徑錯誤，請聯絡管理員';
            return;
        }
        else if (result.data.loadType === LoadType.PARAMETER_ERROR) {
            errorMessage.value = '網頁參數設定錯誤，請聯絡管理員';
            return;
        }
        else if (result.data.loadType === LoadType.QUERY_FAILED) {
            errorMessage.value = '你找到了伺服器BUG，請聯絡管理員';
            return;
        }

        throw new Error("An unknown error occurred while add data: " + JSON.stringify(result.data));
    } catch (error) {
        console.error('新增錯誤:', error);
        errorMessage.value = '伺服器意外關閉，請聯絡管理員 ' + error;
    }
};


const exitPage = async () => {
    if (props.exit && typeof props.onExit === 'function') {
        await props.onExit();
    }
};
</script>


<style lang="scss" scoped>
.data-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(179, 179, 179, 0.6);
    backdrop-filter: blur(5px);
    z-index: 100;
}

.data-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* 彈出介面 權重 (大於模糊效果) */
    z-index: 110;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border-radius: 10px;
    /* 陰影效果 */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    padding: 20px;
    width: 80%;
    /* 最大寬度 */
    max-width: 500px;
}

.data-form {
    margin-left: 6%;
    width: 80%;
}

/* 標題 */
.data-name {
    display: flex;
    text-align: right;
    margin-right: 10px;
    font-size: 18px;
    white-space: nowrap;
    width: 100px;
}

.el-input {
    font-size: 20px;
    width: 90%;
    margin-bottom: 10px;
    margin-left: 5%;
    padding: 8px;

}

.btn-container {
    margin-top: 20px;
    display: flex;
    /* 將按鈕保持在容器內的左右間距 */
    justify-content: space-between;
    /* 增加按鈕之間的間距 */
    gap: 20px;
}


.el-btn {
    font-size: 20px;
    /* 調整按鈕的內邊距 */
    padding: 12px 24px;
}
</style>
