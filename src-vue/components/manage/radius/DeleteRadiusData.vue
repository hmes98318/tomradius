<template>
    <div class="delete-radius-container" @click.self="exitPage">
        <div class="delete-radius-card">
            <!-- 卡片頭部 -->
            <div class="card-header">
                <div class="header-icon">
                    <el-icon>
                        <Delete />
                    </el-icon>
                </div>
                <h2 class="header-title">刪除授權設備</h2>
                <el-button type="text" class="close-button" @click="exitPage">
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>

            <!-- 卡片內容 -->
            <div class="card-content">
                <!-- 警告訊息 -->
                <div class="warning-message">
                    <el-icon>
                        <Warning />
                    </el-icon>
                    <span>請確認是否要刪除此筆資料，此動作無法還原</span>
                </div>

                <!-- 資料顯示區域 -->
                <el-descriptions :column="1" border class="data-descriptions">
                    <el-descriptions-item label="MAC 地址">
                        <div class="data-field">
                            <el-icon>
                                <Connection />
                            </el-icon>
                            <span>{{ curData.mac_address }}</span>
                        </div>
                    </el-descriptions-item>

                    <el-descriptions-item label="電腦名稱">
                        <div class="data-field">
                            <el-icon>
                                <Monitor />
                            </el-icon>
                            <span>{{ curData.computer_name }}</span>
                        </div>
                    </el-descriptions-item>

                    <el-descriptions-item label="員工名稱">
                        <div class="data-field">
                            <el-icon>
                                <User />
                            </el-icon>
                            <span>{{ curData.employee_name }}</span>
                        </div>
                    </el-descriptions-item>

                    <el-descriptions-item label="其他描述">
                        <div class="data-text-content">
                            {{ curData.description || '無' }}
                        </div>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 創建資訊 -->
                <div class="creator-info">
                    <div class="info-item">
                        <span class="label">創建人員：</span>
                        <span class="value">{{ curData.creator || '無資料' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">創建時間：</span>
                        <span class="value">{{ curData.created_at ? convertUTCtoLocal(curData.created_at) : '無資料'
                            }}</span>
                    </div>
                </div>
            </div>

            <!-- 卡片底部 -->
            <div class="card-footer">
                <el-button type="default" @click="exitPage" class="footer-button" :disabled="isSubmitting">
                    取消
                </el-button>
                <el-button type="danger" @click="deleteData" class="footer-button delete-button"
                    :loading="isSubmitting">
                    確認刪除
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { ref, onMounted, onUnmounted } from 'vue';
import {
    Close,
    Connection,
    Delete,
    Monitor,
    User,
    Warning
} from '@element-plus/icons-vue';

import { formatMacAddress } from '@/components/util/normalizeMacAddress';
import { convertUTCtoLocal } from '@/components/util/formatDate';
import { LoadType } from '@/@types/Response.types';

import type { AxiosResponse } from 'axios';
import type { RadiusData } from '@/@types/category/Radius.types';
import type { ResultData } from '@/@types/Response.types';


const props = defineProps({
    message: String,
    exit: Boolean,
    onExit: Function,
    id: Number,
});

const isSubmitting = ref(false);
const emits = defineEmits(['SUCESS_DELETE']);

const curData = ref<RadiusData>({
    id: 0,
    mac_address: '',
    computer_name: '',
    employee_name: '',
    description: '',
    creator: '',
    created_at: ''
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

/**
 * 顯示成功通知
 */
const showSuccessNotification = (message: string) => {
    ElNotification({
        title: '成功',
        message,
        type: 'success',
        duration: 3000,
        position: 'top-right',
        showClose: true
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
    const card = document.querySelector('.delete-radius-card');
    if (card) {
        card.classList.add('slide-in');
    }

    await getData(props.id);
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
 * 組件掛載時，使用 id 獲取資料
 */
const getData = async (id: number) => {
    try {
        const data = {
            type: 2,
            id: id
        };
        const result: AxiosResponse<ResultData, any> = await axios.get('/api/radius/list', { params: data });

        if (result.data.loadType === LoadType.SUCCEED) {
            let radData = result.data.data[0] as RadiusData;
            radData.mac_address = formatMacAddress(radData.mac_address);
            curData.value = { ...radData };
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
 * 刪除資料處理
 */
const deleteData = async () => {
    // 避免重複提交
    if (isSubmitting.value) return;

    // 開始提交
    isSubmitting.value = true;

    try {
        const result: AxiosResponse<ResultData, any> = await axios.delete('/api/radius/deleteData', {
            data: {
                radcheck_id: props.id
            }
        });

        if (result.data.loadType === LoadType.SUCCEED) {
            showSuccessNotification('已成功刪除授權設備');
            emits('SUCESS_DELETE');
            exitPage();
            return;
        }
        else if (result.data.loadType === LoadType.DATA_NOT_FOUND) {
            showErrorNotification('此資料不存在，請重新整理網頁獲取最新資料');
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
        console.error('刪除錯誤:', error);
        showErrorNotification('伺服器連接失敗，請稍後再試或聯絡管理員');
    } finally {
        isSubmitting.value = false;
    }
};

const exitPage = async () => {
    if (props.exit && typeof props.onExit === 'function') {
        // 應用退出動畫
        const card = document.querySelector('.delete-radius-card');
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
@use "sass:color";

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

.delete-radius-container {
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

.delete-radius-card {
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
    background-color: $danger-color;
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

    .warning-message {
        margin-bottom: 20px;
        padding: 12px 16px;
        background-color: rgba($warning-color, 0.1);
        border-left: 4px solid $warning-color;
        border-radius: 4px;
        color: color.adjust($warning-color, $lightness: -10%);
        display: flex;
        align-items: center;

        .el-icon {
            margin-right: 10px;
            font-size: 18px;
        }
    }

    .data-descriptions {
        margin-bottom: 20px;

        :deep(.el-descriptions__label) {
            font-weight: 500;
            color: $text-primary;
            padding: 12px 15px;
        }

        :deep(.el-descriptions__content) {
            padding: 12px 15px;
        }

        .data-field {
            display: flex;
            align-items: center;

            .el-icon {
                color: $text-secondary;
                margin-right: 10px;
                font-size: 16px;
            }

            span {
                color: $text-primary;
                font-weight: 500;
            }
        }

        .data-text-content {
            color: $text-primary;
            line-height: 1.5;
            white-space: pre-line;
            min-height: 42px;
        }
    }

    .creator-info {
        margin-top: 10px;
        background-color: $background-color;
        padding: 12px 16px;
        border-radius: 8px;

        .info-item {
            display: flex;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }

            .label {
                color: $text-secondary;
                min-width: 90px;
                font-size: 14px;
            }

            .value {
                color: $text-primary;
                font-weight: 500;
                font-size: 14px;
            }
        }
    }

    :deep(.el-form-item) {
        margin-bottom: 20px;

        .el-form-item__label {
            font-weight: 500;
            color: $text-primary;
            line-height: 1.5;
            padding-bottom: 8px;
        }

        .el-input__wrapper,
        .el-textarea__wrapper {
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            background-color: #f9f9f9;
            padding: 0 15px;
            border-radius: 8px;
        }

        .el-input__inner {
            height: 42px;
            color: $text-primary;
            font-weight: 500;
        }

        .el-textarea__inner {
            color: $text-primary;
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

    .delete-button {
        &:not(:disabled) {
            background-color: $danger-color;
            border-color: $danger-color;

            &:hover {
                background-color: color.adjust($danger-color, $lightness: -10%);
                border-color: color.adjust($danger-color, $lightness: -10%);
            }

            &:active {
                background-color: color.adjust($danger-color, $lightness: -20%);
                border-color: color.adjust($danger-color, $lightness: -20%);
            }
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
    .delete-radius-card {
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
    .delete-radius-container {
        align-items: flex-end;
    }

    .delete-radius-card {
        width: 100%;
        max-width: none;
        margin: 0;
        border-radius: 16px 16px 0 0;
        max-height: 90vh;
    }
}
</style>
