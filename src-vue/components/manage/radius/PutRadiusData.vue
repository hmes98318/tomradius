<template>
    <div class="edit-radius-container" @click.self="exitPage">
        <div class="edit-radius-card">
            <!-- 卡片頭部 -->
            <div class="card-header">
                <div class="header-icon">
                    <el-icon>
                        <Edit />
                    </el-icon>
                </div>
                <h2 class="header-title">修改授權設備</h2>
                <el-button type="text" class="close-button" @click="exitPage">
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>

            <!-- 卡片內容 -->
            <div class="card-content">
                <el-form :model="curData" label-position="top" :status-icon="true">
                    <!-- MAC 地址 -->
                    <el-form-item label="MAC 地址" required>
                        <el-input v-model="curData.mac_address" placeholder="格式: XX:XX:XX:XX:XX:XX"
                            prefix-icon="Connection" maxlength="17" @input="handleMacInput" @paste="handleMacPaste" />
                        <div class="form-tip">請輸入設備的 MAC 地址，例如: 00:1A:2B:3C:4D:5E</div>
                    </el-form-item>

                    <!-- 電腦名稱 -->
                    <el-form-item label="電腦名稱" required>
                        <el-input v-model="curData.computer_name" placeholder="輸入設備的電腦名稱" prefix-icon="Monitor" />
                        <div class="form-tip">請輸入設備的識別名稱，例如: SP-25001-NB</div>
                    </el-form-item>

                    <!-- 員工名稱 -->
                    <el-form-item label="員工名稱" required>
                        <el-input v-model="curData.employee_name" placeholder="輸入設備使用者姓名" prefix-icon="User" />
                        <div class="form-tip">請輸入設備使用者姓名，例如: 王小明</div>
                    </el-form-item>

                    <!-- 其他描述 -->
                    <el-form-item label="其他描述">
                        <el-input v-model="curData.description" type="textarea" :rows="3" placeholder="輸入設備的其他相關資訊 (選填)"
                            resize="none" />
                    </el-form-item>
                </el-form>
            </div>

            <!-- 卡片底部 -->
            <div class="card-footer">
                <el-button type="default" @click="exitPage" class="footer-button" :disabled="isSubmitting">
                    取消
                </el-button>
                <el-button type="primary" @click="putData" class="footer-button" :loading="isSubmitting">
                    確認修改
                </el-button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';
import { Edit, Close, Warning } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

import { formatMacAddress, normalizeMacAddress } from '@/components/util/normalizeMacAddress';
import { LoadType } from '@/@types/Response.types';

import type { AxiosResponse } from 'axios';
import type { RadiusEditData } from '@/@types/category/Radius.types';
import type { ResultData } from '@/@types/Response.types';


const props = defineProps({
    message: String,
    exit: Boolean,
    onExit: Function,
    id: Number,
});

const isSubmitting = ref(false);
const isLoading = ref(false);
const emits = defineEmits(['SUCESS_PUT']);

const curData = ref<RadiusEditData>({
    id: 0,
    mac_address: '',
    computer_name: '',
    employee_name: '',
    description: ''
});

/**
 * 顯示錯誤通知
 */
const showErrorNotification = (message: string) => {
    ElNotification({
        title: '錯誤',
        message,
        type: 'error',
        duration: 4500,
        position: 'top-right',
        showClose: true,
        icon: Warning
    });
};

onMounted(async () => {
    if (!props.id) {
        showErrorNotification('出現此錯誤請重新整理網頁，如果重複出現，請聯絡管理員');
        return;
    }

    // 添加事件監聽器
    window.addEventListener('keydown', handleKeyDown);

    // 進入動畫效果
    const card = document.querySelector('.edit-radius-card');
    if (card) {
        card.classList.add('slide-in');
    }

    // 載入數據
    isLoading.value = true;
    await getData(props.id);
    isLoading.value = false;
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
    // Enter 提交表單 (僅當未在 textarea 中時)
    else if (event.key === 'Enter' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        putData();
    }
};

/**
 * 組件掛載時, 使用 id 獲取資料
 */
const getData = async (id: number) => {
    try {
        const data = {
            type: 2,
            id: id
        };
        const result: AxiosResponse<ResultData, any> = await axios.get('/api/radius/list', { params: data });

        if (result.data.loadType === LoadType.SUCCEED) {
            const cropData = result.data.data[0] as RadiusEditData;

            // 格式化 MAC 地址再顯示
            if (cropData.mac_address) {
                cropData.mac_address = formatMacAddress(cropData.mac_address);
            }

            curData.value = { ...cropData };
            return;
        }
        else if (result.data.loadType === LoadType.DATA_NOT_FOUND) {
            showErrorNotification('不存在該資料，請重新新增或選取');
        }
        else if (result.data.loadType === LoadType.UNAUTHORIZED) {
            showErrorNotification('登入狀態已過期，請重新登入');
        }
        else if (result.data.loadType === LoadType.PATH_ERROR) {
            showErrorNotification('網頁請求路徑錯誤，請聯絡管理員');
        }
        else if (result.data.loadType === LoadType.PARAMETER_ERROR) {
            showErrorNotification('網頁參數設定錯誤，請聯絡管理員');
        }
        else if (result.data.loadType === LoadType.QUERY_FAILED) {
            showErrorNotification('伺服器處理錯誤，請聯絡管理員');
        }
        else {
            throw new Error("未知錯誤: " + JSON.stringify(result.data));
        }
    } catch (error) {
        console.error('獲取錯誤:', error);
        showErrorNotification('伺服器連接失敗，請稍後再試或聯絡管理員');
    }
};

/**
 * 格式化 MAC 地址輸入
 */
const handleMacInput = (value: string) => {
    if (!value) return;

    // 移除所有非十六進制字符
    // let mac = value.replace(/[^0-9A-Fa-f]/g, '');
    let mac = value;

    // 插入冒號
    let formattedMac = '';
    for (let i = 0; i < mac.length && i < 12; i++) {
        if (i > 0 && i % 2 === 0 && formattedMac.length < 17) {
            formattedMac += ':';
        }
        formattedMac += mac[i];
    }

    curData.value.mac_address = formattedMac.toUpperCase();
};

/**
 * 處理 MAC 地址貼上事件
 */
const handleMacPaste = (event: ClipboardEvent) => {
    // 阻止默認貼上行為
    event.preventDefault();

    // 獲取剪貼板的文本
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // 清理 MAC 地址並格式化
    const cleanedMac = pastedText.replace(/[^0-9a-fA-F]/g, '');

    // 將清理後的 MAC 地址以 XX:XX:XX:XX:XX:XX 格式設置到輸入框
    if (cleanedMac.length <= 12) {
        let formattedMac = '';
        for (let i = 0; i < cleanedMac.length; i += 2) {
            if (i > 0) formattedMac += ':';
            formattedMac += cleanedMac.substring(i, Math.min(i + 2, cleanedMac.length));
        }
        curData.value.mac_address = formattedMac.toUpperCase();
    }
};

/**
 * 資料修改處理
 */
const putData = async () => {
    // 避免重複提交
    if (isSubmitting.value) return;

    // 過濾掉多餘的空白及換行
    curData.value.mac_address = curData.value.mac_address.trim().replace(/\s+/g, '');
    curData.value.computer_name = curData.value.computer_name.trim();
    curData.value.employee_name = curData.value.employee_name.trim();
    curData.value.description = curData.value.description?.trim() || '';

    // 驗證 MAC 地址
    if (!(/^([0-9a-fA-F]{2}[:.-]?){5}[0-9a-fA-F]{2}$/).test(curData.value.mac_address)) {
        showErrorNotification('請輸入有效 MAC 地址，格式為 XX:XX:XX:XX:XX:XX');
        return;
    }

    // 驗證電腦名稱
    if (!curData.value.computer_name) {
        showErrorNotification('請輸入電腦名稱');
        return;
    }

    // 驗證員工名稱
    if (!curData.value.employee_name) {
        showErrorNotification('請輸入員工名稱');
        return;
    }

    // 開始提交
    isSubmitting.value = true;

    try {
        const data = {
            radcheck_id: props.id,
            mac_address: normalizeMacAddress(curData.value.mac_address),
            computer_name: (curData.value.computer_name).toUpperCase(),
            employee_name: curData.value.employee_name,
            description: curData.value.description
        };

        const result: AxiosResponse<ResultData, any> = await axios.put('/api/radius/editData', data);

        if (result.data.loadType === LoadType.SUCCEED) {
            ElNotification({
                title: '成功',
                message: '已成功修改授權設備',
                type: 'success',
                duration: 3000,
                position: 'top-right'
            });
            emits('SUCESS_PUT');
            exitPage();
            return;
        }
        else if (result.data.loadType === LoadType.DATA_EXISTED) {
            showErrorNotification('已存在該 MAC 地址，請重新填寫');
        }
        else if (result.data.loadType === LoadType.DATA_NOT_FOUND) {
            showErrorNotification('此修改資料不存在，請重新整理網頁獲取最新資料');
        }
        else if (result.data.loadType === LoadType.PATH_ERROR) {
            showErrorNotification('網頁請求路徑錯誤，請聯絡管理員');
        }
        else if (result.data.loadType === LoadType.PARAMETER_ERROR) {
            showErrorNotification('網頁參數設定錯誤，請聯絡管理員');
        }
        else if (result.data.loadType === LoadType.QUERY_FAILED) {
            showErrorNotification('伺服器處理錯誤，請聯絡管理員');
        }
        else {
            throw new Error("未知錯誤: " + JSON.stringify(result.data));
        }
    } catch (error) {
        console.error('修改錯誤:', error);
        showErrorNotification('伺服器連接失敗，請稍後再試或聯絡管理員');
    } finally {
        isSubmitting.value = false;
    }
};

const exitPage = async () => {
    if (props.exit && typeof props.onExit === 'function') {
        // 應用退出動畫
        const card = document.querySelector('.edit-radius-card');
        if (card) {
            card.classList.remove('slide-in');
            card.classList.add('slide-out');

            // 等待動畫完成後再關閉
            setTimeout(async () => {
                await props.onExit!();
            }, 300);
        }
        else {
            await props.onExit();
        }
    }
};
</script>


<style lang="scss" scoped>
$primary-color: #409EFF;
$success-color: #67C23A;
$danger-color: #F56C6C;
$warning-color: #E6A23C;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #EBEEF5;
$background-color: #F5F7FA;
$transition-time: 0.3s;

.edit-radius-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fade-in 0.3s ease-out;
}

.edit-radius-card {
    width: 100%;
    max-width: 540px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(0);
    transition: transform $transition-time ease, opacity $transition-time ease;

    &.slide-in {
        animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    &.slide-out {
        animation: slide-out 0.3s ease-in forwards;
    }
}

/* 卡片頭部 */
.card-header {
    padding: 20px 24px;
    background-color: $primary-color;
    color: white;
    display: flex;
    align-items: center;

    .header-icon {
        width: 36px;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        .el-icon {
            font-size: 20px;
        }
    }

    .header-title {
        flex: 1;
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
    }

    .close-button {
        color: white;
        font-size: 20px;
        margin: -10px;
        padding: 10px;

        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }
}

/* 卡片內容 */
.card-content {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: $background-color;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #d1d1d1;
        border-radius: 6px;
    }

    .el-form {
        margin-bottom: 20px;
    }

    .form-tip {
        font-size: 0.85rem;
        color: $text-secondary;
        margin-top: 4px;
    }

    :deep(.el-form-item) {
        margin-bottom: 24px;

        .el-form-item__label {
            font-weight: 500;
            color: $text-primary;
            line-height: 1.5;
            padding-bottom: 8px;
        }

        .el-input__wrapper,
        .el-textarea__wrapper {
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            padding: 0 15px;
            border-radius: 8px;
            transition: all $transition-time;

            &:hover {
                box-shadow: 0 0 0 1px $primary-color inset;
            }

            &.is-focus {
                box-shadow: 0 0 0 1px $primary-color inset, 0 0 0 3px rgba(64, 158, 255, 0.1);
            }
        }

        .el-input__inner {
            height: 42px;
        }

        .el-input__prefix {
            color: $text-secondary;
        }
    }
}

/* 卡片底部 */
.card-footer {
    padding: 16px 24px;
    border-top: 1px solid $border-color;
    display: flex;
    justify-content: flex-end;
    background-color: $background-color;

    .footer-button {
        min-width: 100px;
        font-size: 16px;

        &+.footer-button {
            margin-left: 12px;
        }
    }
}

/* 動畫 */
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slide-in {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slide-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(30px);
    }
}

/* 響應式設計 */
@media (max-width: 768px) {
    .edit-radius-card {
        width: 90%;
        max-width: none;
        margin: 20px;
    }

    .card-header {
        padding: 16px 20px;

        .header-title {
            font-size: 1.2rem;
        }
    }

    .card-content {
        padding: 20px;
    }

    .card-footer {
        padding: 12px 20px;
    }
}

@media (max-width: 480px) {
    .edit-radius-container {
        align-items: flex-end;
    }

    .edit-radius-card {
        width: 100%;
        max-width: none;
        margin: 0;
        border-radius: 16px 16px 0 0;
        max-height: 90vh;
    }
}
</style>
