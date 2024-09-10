<template>
    <div class="data-container">
        <div class="data-box">
            <div class="data-form">
                <label class="data-name">MAC 地址:</label>
                <el-input v-model="curData.mac_address" type="text" class="input-box" placeholder="-----" disabled />

                <label class="data-name">電腦名稱:</label>
                <el-input v-model="curData.computer_name" type="text" class="input-box" placeholder="-----" disabled />

                <label class="data-name">員工名稱:</label>
                <el-input v-model="curData.employee_name" type="text" class="input-box" placeholder="-----" disabled />

                <label class="data-name">其他描述:</label>
                <el-input v-model="curData.description" type="text" class="input-box" placeholder="-----" disabled />
            </div>

            <div class="msg-container" v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>

            <div class='btn-container'>
                <el-button type="primary" class="el-btn" size="large" @click="exitPage">取消</el-button>
                <el-button type="danger" class="el-btn" size="large" @click="deleteData()">刪除</el-button>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';

import { formatMacAddress } from '@/components/util/normalizeMacAddress';
import { LoadType } from '@/@types/Response.types';

import type { AxiosResponse } from 'axios';
import type { RadiusData } from '@/@types/category/Radius.types';
import type { ResultData } from '@/@types/Response.types';


const propsTemplate = defineProps({
    message: String,
    exit: Boolean,
    onExit: Function,
    id: Number,       // Radius data id
});
const props = ref(propsTemplate);

const errorMessage = ref('');                   // 錯誤訊息顯示
const emits = defineEmits(['SUCESS_DELETE']);   // 添加事件傳回去給父組件

const curData = ref<RadiusData>({
    id: 0,
    mac_address: '',
    computer_name: '',
    employee_name: '',
    description: '',
    creator: '',
    created_at: ''
});


onMounted(async () => {
    if (!props.value.id) {
        errorMessage.value = '出現此錯誤請重新整理網頁，如果重複出現，請聯絡管理員';
        return;
    }

    errorMessage.value = '⚠請確認是否要刪除此筆資料，此動作無法返回⚠';

    // 添加事件監聽器
    window.addEventListener('keydown', handleKeyDown);

    await getData(props.value.id!);
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
 * 組件卦載時, 使用 id 獲取資料
 */
const getData = async (id: number) => {
    try {
        const url = '/api/radius/list';
        const data = {
            type: 2,
            id: id
        };
        const result: AxiosResponse<ResultData, any> = await axios.get(url, { params: data });

        if (result.data.loadType === LoadType.SUCCEED) {
            let radData = result.data.data[0] as RadiusData;
            radData.mac_address = formatMacAddress(radData.mac_address);
            curData.value = { ...radData };
            return;
        }
        else if (result.data.loadType === LoadType.DATA_NOT_FOUND) {
            errorMessage.value = '不存在該資料，請重新新增或選取';
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
        console.error('獲取錯誤:', error);
        errorMessage.value = '伺服器意外關閉，請聯絡管理員 ' + error;
    }
};



/**
 * deleteData() 做資料判斷處理 之後給統一的發送函式 ?
 */
const deleteData = async () => {
    try {
        const url = '/api/radius/deleteData';
        const result: AxiosResponse<ResultData, any> = await axios.delete(url, {
            data: {
                radcheck_id: props.value.id
            }
        });

        // console.log(result.data);

        if (result.data.loadType === LoadType.SUCCEED) {
            emits('SUCESS_DELETE');
            exitPage();
            return;
        }
        else if (result.data.loadType === LoadType.DATA_NOT_FOUND) {
            errorMessage.value = '此修改資料不存在，請重新整理網頁獲取最新資料';
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

        throw new Error("An unknown error occurred while delete data: " + JSON.stringify(result.data));
    } catch (error) {
        console.error('刪除錯誤:', error);
        errorMessage.value = '伺服器意外關閉，請聯絡管理員 ' + error;
    }
};


const exitPage = async () => {
    if (props.value.exit && typeof props.value.onExit === 'function') {
        await props.value.onExit();
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
