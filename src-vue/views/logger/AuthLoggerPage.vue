<!--
    Radius 裝置驗證紀錄
-->
<template>
    <el-main>
        <!-- 操作按鈕區 -->
        <div class="actions-container">
            <div class="filter-buttons-container">
                <!-- 過濾按鈕 -->
                <el-button type="default" class="fs-5 fw-bold" size="large" @click="showFilterPage()" title="過濾資料">
                    <el-icon>
                        <Filter />
                    </el-icon>
                </el-button>

                <!-- 過濾清除按鈕 -->
                <el-button v-if="hasFilters" type="default" class="fs-5 fw-bold" size="large" @click="clearFilters()"
                    title="清除過濾條件">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                </el-button>
            </div>
        </div>

        <!-- 表格 -->
        <div class="infinite-scroll-container">
            <el-table v-loading="loading" element-loading-text="資料載入中..." :data="tableData" style="height: auto;"
                table-layout="auto" class="data-table" :default-sort="{ prop: 'authdate', order: 'descending' }" border
                stripe v-el-table-infinite-scroll="loadMoreData"
                :infinite-scroll-disabled="loadingMore || allDataLoaded" :infinite-scroll-distance="50">

                <el-table-column type="index" width="60">
                    <template #default="scope">
                        <div>{{ scope.$index + 1 }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="is_accepted" label="狀態" sortable min-width="120">
                    <template #default="scope">
                        <el-tag :type="scope.row.is_accepted ? 'success' : 'warning'" style="font-size: 16px;">
                            {{ scope.row.is_accepted ? '成功' : '失敗' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="mac_address" label="MAC 地址" sortable min-width="150" />
                <el-table-column prop="authdate" label="驗證時間" sortable min-width="180" />
            </el-table>

            <!-- 無限滾動狀態顯示區 -->
            <div class="infinite-scroll-status">
                <template v-if="loadingMore">
                    <div class="loading-indicator">
                        <el-icon class="is-loading">
                            <Loading />
                        </el-icon>
                        <span>載入中…</span>
                    </div>
                </template>
                <template v-else-if="allDataLoaded && tableData.length > 0">
                    <span>已加載全部資料，共 {{ tableData.length }} 筆記錄</span>
                </template>
                <template v-else-if="tableData.length === 0 && !loading">
                    <span>沒有符合條件的資料</span>
                </template>
                <template v-else-if="tableData.length > 0">
                    <span>已加載 {{ tableData.length }} 筆記錄，向下滾動以載入更多</span>
                </template>
            </div>
        </div>

        <!-- 過濾器彈窗 -->
        <div v-if="filterDialogVisible" class="filter-dialog-container" @click.self="filterDialogVisible = false">
            <div class="filter-dialog-card">
                <!-- 卡片頭部 -->
                <div class="card-header">
                    <div class="header-icon">
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </div>
                    <h2 class="header-title">驗證紀錄過濾</h2>
                    <el-button type="text" class="close-button" @click="filterDialogVisible = false">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <!-- 卡片內容 -->
                <div class="card-content">
                    <p class="filter-tip">您可以設定時間範圍來過濾驗證紀錄，只會顯示在此範圍內的驗證紀錄資料</p>

                    <el-form label-position="top" class="filter-form">
                        <!-- 驗證時間範圍 -->
                        <el-form-item label="驗證時間範圍">
                            <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
                                start-placeholder="開始日期" end-placeholder="結束日期" format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD" class="full-width" />
                        </el-form-item>

                        <!-- 當前啟用的過濾條件 -->
                        <div v-if="hasFilters" class="active-filters">
                            <div class="active-filters-header">
                                <el-icon>
                                    <InfoFilled />
                                </el-icon>
                                <span>已啟用的過濾條件</span>
                            </div>
                            <div class="filter-tags">
                                <el-tag v-if="filterParams.start_date && filterParams.end_date" closable
                                    @close="clearDateRangeFilter()" type="info" effect="light">
                                    驗證時間: {{ filterParams.start_date }} 至 {{ filterParams.end_date }}
                                </el-tag>
                            </div>
                        </div>
                    </el-form>
                </div>

                <!-- 卡片底部 -->
                <div class="card-footer">
                    <div class="left-actions">
                        <el-button v-if="hasFilters" type="warning" plain @click="clearFilters" icon="Delete">
                            清除所有過濾
                        </el-button>
                    </div>
                    <div class="right-actions">
                        <el-button @click="filterDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="applyFilters">套用過濾</el-button>
                    </div>
                </div>
            </div>
        </div>
    </el-main>
</template>


<script lang="ts" setup>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref, onMounted, computed } from 'vue';
import {
    Close,
    Filter,
    InfoFilled,
    Loading,
    Refresh
} from '@element-plus/icons-vue';

import { convertUTCtoLocal } from '@/components/util/formatDate';
import { LoadType } from '@/@types/Response.types';

import type { AuthLoggerData } from '@/@types/category/Logger.types';


const tableData = ref<AuthLoggerData[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const allDataLoaded = ref(false);
const pageSize = 50;

// 過濾器相關
const filterDialogVisible = ref(false);
const dateRange = ref<[string, string] | null>(null);

// API 過濾器參數
const filterParams = ref({
    start_date: '',
    end_date: ''
});

// 判斷是否有啟用的過濾條件
const hasFilters = computed(() => {
    return filterParams.value.start_date !== '' && filterParams.value.end_date !== '';
});


onMounted(async () => {
    try {
        loading.value = true;
        await loadMoreData();
        loading.value = false;
    } catch (error) {
        console.error('初始資料載入失敗:', error);
        ElMessage.error(`初始資料載入失敗: ${error}`);
        loading.value = false;
    }
});


const resetAndLoadData = async () => {
    tableData.value = [];
    allDataLoaded.value = false;
    loading.value = true;

    try {
        await loadMoreData();
    } finally {
        loading.value = false;
    }
};

/**
 * 無限滾動載入資料
 */
const loadMoreData = async () => {
    // 如果正在加載或已經沒有更多資料，則直接返回
    if (loadingMore.value || allDataLoaded.value) return;

    loadingMore.value = true;

    try {
        const params: any = { limit: pageSize };

        // 過濾參數
        Object.entries(filterParams.value).forEach(([key, value]) => {
            if (value !== '') {
                params[key] = value;
            }
        });

        // 如果已有資料，使用最後一筆資料的 ID 作為 before 參數
        if (tableData.value.length > 0) {
            const lastItem = tableData.value[tableData.value.length - 1];
            params.before = lastItem.id;
        }

        const response = await axios.get('/api/service/logger/radiusAuth', { params });

        if (response.data.loadType === LoadType.SUCCEED) {
            const newData = response.data.data.map((item: any) => {
                item.authdate = convertUTCtoLocal(item.authdate);
                return item;
            });

            tableData.value = tableData.value.concat(newData);

            if (newData.length < pageSize) {
                allDataLoaded.value = true;
            }
        }
        else if (response.data.loadType === LoadType.UNAUTHORIZED) {
            ElMessage.error('已登出當前使用者狀態，請重新整理網頁');
        }
        else {
            throw TypeError(`Data error: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        ElMessage.error(`獲取資料錯誤: ${error}`);
    } finally {
        loadingMore.value = false;
    }
};

/**
 * 顯示過濾器彈窗
 */
const showFilterPage = () => {
    // 載入當前過濾參數到表單
    if (filterParams.value.start_date && filterParams.value.end_date) {
        dateRange.value = [
            filterParams.value.start_date,
            filterParams.value.end_date
        ];
    }
    else {
        dateRange.value = null;
    }

    filterDialogVisible.value = true;
};

/**
 * 套用過濾條件
 */
const applyFilters = () => {
    // 處理日期範圍
    if (dateRange.value && dateRange.value.length === 2) {
        filterParams.value.start_date = dateRange.value[0];
        filterParams.value.end_date = dateRange.value[1];
    }
    else {
        filterParams.value.start_date = '';
        filterParams.value.end_date = '';
    }

    filterDialogVisible.value = false;
    resetAndLoadData();
};

/**
 * 清除所有過濾條件
 */
const clearFilters = () => {
    dateRange.value = null;

    // 清除過濾參數
    filterParams.value = {
        start_date: '',
        end_date: ''
    };

    resetAndLoadData();
};

/**
 * 清除日期範圍過濾
 */
const clearDateRangeFilter = () => {
    filterParams.value.start_date = '';
    filterParams.value.end_date = '';
    dateRange.value = null;

    resetAndLoadData();
};
</script>


<style lang="scss" scoped>
@use "sass:color";

/* 操作區容器 */
.actions-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin: 10px 0 15px;
}

/* 過濾按鈕容器 */
.filter-buttons-container {
    display: flex;
    gap: 8px;
}

.button-text {
    margin-left: 6px;
}

/* 按鈕樣式 */
.fs-5 {
    font-size: 1.25rem;
}

.fw-bold {
    font-weight: bold;
}

/* 對話框底部 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

/* 表格 */
.data-table {
    width: 100%;
    font-size: 16px;
    flex: 1;
    margin-bottom: 15px;
}

/* 無限滾動容器 */
.infinite-scroll-container {
    height: calc(100vh - 150px);
    overflow: auto;
    display: flex;
    flex-direction: column;
}

/* 無限滾動狀態顯示區 */
.infinite-scroll-status {
    position: relative;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-top: auto;
    margin-bottom: 10px;
}

/* 載入指示器 */
.loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
}

.loading-indicator .el-icon {
    margin-right: 8px;
    font-size: 18px;
}

/* 過濾器彈窗樣式 */
.filter-dialog-container {
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

.filter-dialog-card {
    width: 100%;
    max-width: 600px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 卡片頭部 */
.card-header {
    padding: 20px 24px;
    background-color: #409EFF;
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
        background: #F5F7FA;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #d1d1d1;
        border-radius: 6px;
    }

    .filter-tip {
        color: #909399;
        margin: 0 0 16px;
        font-size: 14px;
    }

    :deep(.el-form-item) {
        margin-bottom: 20px;

        .el-form-item__label {
            padding-bottom: 8px;
            font-weight: 500;
            color: #303133;
            line-height: 1.5;
        }

        .el-input__wrapper {
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            padding: 0 15px;
            border-radius: 8px;
            transition: all 0.3s;
            height: 40px;

            &:hover {
                box-shadow: 0 0 0 1px #409EFF inset;
            }

            &.is-focus {
                box-shadow: 0 0 0 1px #409EFF inset, 0 0 0 3px rgba(64, 158, 255, 0.1);
            }
        }
    }

    .active-filters {
        margin-top: 20px;
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 12px 16px;

        .active-filters-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            color: #606266;
            font-weight: 500;

            .el-icon {
                color: #409EFF;
                margin-right: 8px;
            }
        }

        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }
}

/* 卡片底部 */
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid #EBEEF5;
    background-color: #f8f9fa;

    .left-actions {
        flex: 1;
    }

    .right-actions {
        display: flex;
        gap: 10px;
    }
}

.full-width {
    width: 100%;
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

/* 響應式設計 */
@media (max-width: 768px) {
    .filter-dialog-card {
        width: 90%;
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
        flex-direction: column;

        .left-actions {
            margin-bottom: 12px;
            width: 100%;
        }

        .right-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
}

@media (max-width: 480px) {
    .filter-dialog-container {
        align-items: flex-end;
    }

    .filter-dialog-card {
        width: 100%;
        margin: 0;
        border-radius: 16px 16px 0 0;
        max-height: 90vh;
    }
}
</style>