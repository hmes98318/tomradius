<!--
    events: SUCESS_ADD, SUCESS_PUT, SUCESS_DELETE
    event 用來給子組件呼叫父組件彈出右下角彈窗
-->
<template>
    <el-main>
        <!-- 操作按鈕區 -->
        <div class="actions-container">
            <el-button type="primary" size="large" @click="addClick()" class="add-button">
                <div class="button-content">新增授權</div>
            </el-button>

            <div class="search-filter-container">
                <el-input v-model="searchTerm" size="large" placeholder="搜尋 MAC 地址, 電腦名稱, 員工名稱" class="search-input"
                    @keyup.enter="handleSearch" clearable @clear="handleClearSearch" />

                <!-- 過濾按鈕-->
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

        <div class="infinite-scroll-container">
            <el-table v-loading="loading" element-loading-text="資料載入中..." :data="tableData" style="height: auto;"
                table-layout="auto" class="data-table" :default-sort="{ prop: 'id', order: 'descending' }" border
                :scrollbar-always-on="true" stripe v-el-table-infinite-scroll="loadMoreData"
                :infinite-scroll-disabled="loadingMore || allDataLoaded" :infinite-scroll-distance="50">

                <el-table-column fixed="left" label="動作" width="160">
                    <template #default="scope">
                        <div class="btn-group">
                            <!-- 編輯 -->
                            <el-button type="primary" class="table-action-btn edit-btn" size="small"
                                @click="putClick(scope.row)" icon="Edit">
                            </el-button>

                            <!-- 刪除 -->
                            <el-button type="danger" class="table-action-btn delete-btn" size="small"
                                @click="deleteClick(scope.row)" icon="Delete">
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="ID" sortable show-overflow-tooltip width="100">
                    <template #default="scope">
                        <div> {{ scope.row.id }} </div>
                    </template>
                </el-table-column>

                <el-table-column prop="mac_address" label="MAC 地址" sortable width="160" />
                <el-table-column prop="computer_name" label="電腦名稱" sortable width="160" />
                <el-table-column prop="employee_name" label="員工名稱" sortable width="160" />
                <el-table-column prop="creator" label="創建人員" sortable width="160" />
                <el-table-column prop="description" label="描述" sortable width="200" />
                <el-table-column prop="created_at" label="創建時間" sortable width="200" />
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
                    <h2 class="header-title">過濾條件設定</h2>
                    <el-button type="text" class="close-button" @click="filterDialogVisible = false">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <!-- 卡片內容 -->
                <div class="card-content">
                    <p class="filter-tip">您可以使用以下條件過濾資料，只會顯示符合所有條件的結果</p>

                    <el-form :model="filterForm" label-position="top" class="filter-form">
                        <div class="form-grid">
                            <!-- MAC 地址 -->
                            <el-form-item label="MAC 地址">
                                <el-input v-model="filterForm.mac_address" placeholder="輸入 MAC 地址" clearable
                                    prefix-icon="Connection" />
                            </el-form-item>

                            <!-- 電腦名稱 -->
                            <el-form-item label="電腦名稱">
                                <el-input v-model="filterForm.computer_name" placeholder="輸入電腦名稱" clearable
                                    prefix-icon="Monitor" />
                            </el-form-item>

                            <!-- 員工名稱 -->
                            <el-form-item label="員工名稱">
                                <el-input v-model="filterForm.employee_name" placeholder="輸入員工名稱" clearable
                                    prefix-icon="User" />
                            </el-form-item>

                            <!-- 創建人員 -->
                            <el-form-item label="創建人員">
                                <el-select v-model="filterForm.creator" placeholder="選擇創建人員" clearable
                                    class="full-width">
                                    <el-option v-for="item in creatorOption" :key="item" :label="item" :value="item" />
                                </el-select>
                            </el-form-item>
                        </div>

                        <!-- 創建時間範圍 -->
                        <el-divider content-position="left">時間範圍</el-divider>
                        <el-form-item label="創建時間範圍">
                            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至"
                                start-placeholder="開始日期時間" end-placeholder="結束日期時間" format="YYYY-MM-DD HH:mm:ss"
                                value-format="x" class="full-width" />
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
                                <el-tag v-if="filterParams.mac_address" closable
                                    @close="clearSingleFilter('mac_address')" type="info" effect="light">
                                    MAC: {{ filterParams.mac_address }}
                                </el-tag>
                                <el-tag v-if="filterParams.computer_name" closable
                                    @close="clearSingleFilter('computer_name')" type="info" effect="light">
                                    電腦: {{ filterParams.computer_name }}
                                </el-tag>
                                <el-tag v-if="filterParams.employee_name" closable
                                    @close="clearSingleFilter('employee_name')" type="info" effect="light">
                                    員工: {{ filterParams.employee_name }}
                                </el-tag>
                                <el-tag v-if="filterParams.creator" closable @close="clearSingleFilter('creator')"
                                    type="info" effect="light">
                                    創建人: {{ filterParams.creator }}
                                </el-tag>
                                <el-tag v-if="filterParams.created_at_start && filterParams.created_at_end" closable
                                    @close="clearDateRangeFilter()" type="info" effect="light">
                                    時間範圍
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

        <!-- 添加介面 -->
        <AddRadiusData v-if="addOnClick" :message="'RadiusAdd'" :exit="addOnClick" :onExit="addClick"
            @SUCESS_ADD="showSuccessAddNotify" />

        <!-- 修改介面 -->
        <PutRadiusData v-if="putOnClick" :message="'RadiusPut'" :exit="putOnClick" :onExit="putClick"
            :id="putRadiusData!.id" @SUCESS_PUT="showSuccessPutNotify" />

        <!-- 刪除介面 -->
        <DeleteRadiusData v-if="deleteOnClick" :message="'RadiusDelete'" :exit="deleteOnClick" :onExit="deleteClick"
            :id="deleteRadiusData!.id" @SUCESS_DELETE="showSuccessDeleteNotify" />

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

import AddRadiusData from '@/components/manage/radius/AddRadiusData.vue';
import PutRadiusData from '@/components/manage/radius/PutRadiusData.vue';
import DeleteRadiusData from '@/components/manage/radius/DeleteRadiusData.vue';
import { Success } from '@/components/notification/DataNotification.js';

import { convertUTCtoLocal } from '@/components/util/formatDate';
import { normalizeMacAddress } from '@/components/util/normalizeMacAddress';
import { LoadType } from '@/@types/Response.types';

import type { RadiusData } from '@/@types/category/Radius.types';


const tableData = ref<RadiusData[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const allDataLoaded = ref(false);
const pageSize = 50;
const searchTerm = ref('');

// 彈窗控制
const addOnClick = ref(false);
const deleteOnClick = ref(false);
const putOnClick = ref(false);
const deleteRadiusData = ref<RadiusData>();
const putRadiusData = ref<RadiusData>();

// 過濾器相關
const filterDialogVisible = ref(false);
const creatorOption = ref<string[]>([]);
const dateRange = ref<[number, number] | null>(null);

// 過濾表單資料
const filterForm = ref({
    mac_address: '',
    computer_name: '',
    employee_name: '',
    creator: ''
});

// API 過濾參數
const filterParams = ref({
    search: '',
    mac_address: '',
    computer_name: '',
    employee_name: '',
    creator: '',
    created_at_start: '',
    created_at_end: ''
});

// 判斷是否有啟用的過濾條件
const hasFilters = computed(() => {
    return Object.values(filterParams.value).some(value => value !== '');
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


/**
 * 重置並重新載入資料
 */
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
        const params: any = { type: 1, limit: pageSize };

        Object.entries(filterParams.value).forEach(([key, value]) => {
            if (value !== '') {
                params[key] = value;
            }
        });

        if (tableData.value.length > 0) {
            const lastItem = tableData.value[tableData.value.length - 1];
            params.before = lastItem.id;
        }

        const response = await axios.get('/api/radius/list', { params });

        if (response.data.loadType === LoadType.SUCCEED) {
            const newData = response.data.data.map((item: any) => {
                item.created_at = convertUTCtoLocal(item.created_at);
                return item;
            });

            tableData.value = tableData.value.concat(newData);

            // 更新創建人員選項
            if (tableData.value.length <= pageSize) {
                updateCreatorOptions();
            }

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
 * 更新創建人員選項
 */
const updateCreatorOptions = () => {
    const creatorSet = new Set<string>();
    tableData.value.forEach(item => {
        if (item.creator) {
            creatorSet.add(item.creator);
        }
    });
    creatorOption.value = Array.from(creatorSet);
};


/**
 * 新增成功彈窗
 */
const showSuccessAddNotify = () => {
    Success.add();
    resetAndLoadData();
};

/**
 * 刪除成功彈窗
 */
const showSuccessDeleteNotify = () => {
    Success.delete();
    resetAndLoadData();
};

/**
 * 修改成功彈窗
 */
const showSuccessPutNotify = () => {
    Success.put();
    resetAndLoadData();
};

/**
 * 點擊新增
 */
const addClick = () => {
    addOnClick.value = !addOnClick.value;
};

/**
 * 點擊修改
 */
const putClick = (item: RadiusData) => {
    putOnClick.value = !putOnClick.value;
    putRadiusData.value = item;
};

/**
 * 點擊刪除
 */
const deleteClick = (item: RadiusData) => {
    deleteOnClick.value = !deleteOnClick.value;
    deleteRadiusData.value = item;
};


/**
 * 套用過濾條件
 */
const applyFilters = () => {
    // 清空搜尋框
    searchTerm.value = '';
    filterParams.value.search = '';

    // 更新過濾參數
    filterParams.value.mac_address = filterForm.value.mac_address.trim()
        ? normalizeMacAddress(filterForm.value.mac_address.trim())
        : '';
    filterParams.value.computer_name = filterForm.value.computer_name.trim();
    filterParams.value.employee_name = filterForm.value.employee_name.trim();
    filterParams.value.creator = filterForm.value.creator.trim();

    // 處理日期範圍，ms 轉 s
    if (dateRange.value && dateRange.value.length === 2) {
        filterParams.value.created_at_start = String(Math.floor(dateRange.value[0] / 1000));
        filterParams.value.created_at_end = String(Math.floor(dateRange.value[1] / 1000));
    }
    else {
        filterParams.value.created_at_start = '';
        filterParams.value.created_at_end = '';
    }

    filterDialogVisible.value = false;
    resetAndLoadData();
};

/**
 * 顯示過濾器彈窗
 */
const showFilterPage = () => {
    // 清空搜尋框內容
    searchTerm.value = '';
    filterParams.value.search = '';

    // 載入當前過濾參數到表單
    filterForm.value.mac_address = filterParams.value.mac_address;
    filterForm.value.computer_name = filterParams.value.computer_name;
    filterForm.value.employee_name = filterParams.value.employee_name;
    filterForm.value.creator = filterParams.value.creator;

    // 處理日期範圍，ms 轉 s
    if (filterParams.value.created_at_start && filterParams.value.created_at_end) {
        dateRange.value = [
            parseInt(filterParams.value.created_at_start) * 1000,
            parseInt(filterParams.value.created_at_end) * 1000
        ];
    }
    else {
        dateRange.value = null;
    }

    filterDialogVisible.value = true;
};

/**
 * 清除所有過濾條件
 */
const clearFilters = () => {
    filterForm.value = {
        mac_address: '',
        computer_name: '',
        employee_name: '',
        creator: ''
    };
    dateRange.value = null;

    // 清除過濾參數
    filterParams.value = {
        search: '',
        mac_address: '',
        computer_name: '',
        employee_name: '',
        creator: '',
        created_at_start: '',
        created_at_end: ''
    };

    // 清空搜尋框
    searchTerm.value = '';

    resetAndLoadData();
};

/**
 * 處理搜尋 - 全域搜尋
 */
const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.value.trim();

    if (trimmedSearchTerm) {
        // 清空所有過濾參數
        filterParams.value = {
            search: trimmedSearchTerm,
            mac_address: '',
            computer_name: '',
            employee_name: '',
            creator: '',
            created_at_start: '',
            created_at_end: ''
        };

        // 清空過濾表單
        filterForm.value = {
            mac_address: '',
            computer_name: '',
            employee_name: '',
            creator: ''
        };
        dateRange.value = null;

        resetAndLoadData();
    }
};

/**
 * 清除搜尋
 */
const handleClearSearch = () => {
    searchTerm.value = '';
    filterParams.value.search = '';
    resetAndLoadData();
};

/**
 * 清除單個過濾條件
 */
const clearSingleFilter = (key: string) => {
    // 清除過濾參數
    filterParams.value[key as keyof typeof filterParams.value] = '';

    // 同步清除過濾表單
    if (key in filterForm.value) {
        filterForm.value[key as keyof typeof filterForm.value] = '';
    }

    // 重新加載數據
    resetAndLoadData();
};

/**
 * 清除日期範圍過濾
 */
const clearDateRangeFilter = () => {
    filterParams.value.created_at_start = '';
    filterParams.value.created_at_end = '';
    dateRange.value = null;

    // 重新加載數據
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

/* 新增按鈕 */
.add-button {
    flex-shrink: 0;
}

.button-content {
    font-size: 18px;
}

/* 搜尋和過濾區 */
.search-filter-container {
    display: flex;
    flex: 1;
    max-width: 600px;
    gap: 8px;
}

.search-input {
    flex: 1;
    max-width: 400px;
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

/* 數據表格 */
.data-table {
    width: 100%;
    font-size: 16px;
    flex: 1;
    margin-bottom: 15px;
}

/* 表格操作按鈕 */
.table-action-btn {
    width: 30px;
    font-size: 20px;
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

    .filter-form {
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;

            @media (max-width: 576px) {
                grid-template-columns: 1fr;
            }
        }
    }

    :deep(.el-form-item) {
        margin-bottom: 20px;

        .el-form-item__label {
            padding-bottom: 8px;
            font-weight: 500;
            color: #303133;
            line-height: 1.5;
        }

        .el-input__wrapper,
        .el-select .el-input__wrapper {
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

        .el-input__inner {
            height: 40px;
        }

        .el-input__prefix {
            color: #909399;
        }

        // 特別針對 el-select 進行調整
        .el-select {
            width: 100%;

            .el-input {
                height: 40px;
            }
        }
    }

    .el-divider {
        margin: 16px 0;

        :deep(.el-divider__text) {
            font-size: 14px;
            font-weight: 600;
            color: #606266;
            background-color: white;
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