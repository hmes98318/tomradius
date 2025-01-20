<!--
    Radius 裝置授權紀錄
-->
<template>
    <div class="filter-container">
    </div>
    <div class="filter-container">
        <el-input v-model="searchTerm" size="large" placeholder="搜尋修改人員" style="width: 70%;" />
        <el-button :type="filterVisible ? 'primary' : 'default'" @click="onClickFilter" size="large"
            style="margin-left: 6px;">{{
                filterVisible ? '確認過濾' : '過濾內容' }}</el-button>

        <div class="filter-box" v-if="filterVisible">
            <div class="select-box">
                <div class="block">
                    <el-date-picker v-model="timeRangeSelect" type="daterange" start-placeholder="Start date"
                        end-placeholder="End date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </div>
            </div>
        </div>
    </div>

    <div class="msg-container" v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>

    <!-- 上方分頁標籤 -->
    <el-pagination background layout="prev, pager, next" :total="filteredAndSortedTableData.length" :page-size="50"
        @current-change="handleCurrentChange" class="d-flex justify-content-center align-items-center" />

    <!-- 表格間距設置 -->
    <el-radio-group v-model="tableLayout">
        <el-radio-button value="auto">自動</el-radio-button>
        <el-radio-button value="fixed">固定</el-radio-button>
    </el-radio-group>

    <!-- 表格 -->
    <el-table v-loading="loading" element-loading-text="載入中..." :data="tableData()" :table-layout="tableLayout"
        style="width: 100%; font-size: 16px;" :default-sort="{ prop: 'name', order: 'descending' }" border stripe>

        <el-table-column type="index" width="50">
            <template #default="scope">
                <div>
                    {{ (state.page - 1) * state.limit + scope.$index + 1 }}
                </div>
            </template>
        </el-table-column>

        <el-table-column prop="is_accepted" label="狀態" sortable min-width="120">
            <template #default="scope">
                <el-tag :type="scope.row.is_accepted === 1 ? 'success' : 'warning'" style="font-size: 18px;">
                    <!-- success: 是否成功(Y/N) [0, 1] -->
                    {{ scope.row.is_accepted === 1 ? '成功' : '失敗' }}
                </el-tag>
            </template>
        </el-table-column>

        <el-table-column prop="mac_address" label="認證帳號" sortable min-width="130" />
        <el-table-column prop="authdate" label="授權時間" sortable min-width="130" />

    </el-table>

    <!-- 下方分頁標籤 -->
    <el-pagination background layout="prev, pager, next" :total="filteredAndSortedTableData.length" :page-size="50"
        @current-change="handleCurrentChange" class="d-flex justify-content-center align-items-center" />

</template>


<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted, computed, reactive } from 'vue';

import { changeLogState } from '@/stores/isLogin';
import { convertUTCtoLocal } from '@/components/util/convertUTCtoLocal';
import { isValidDateString } from '@/components/util/formatDate';
import { LoadType } from '@/@types/Response.types';

import type { AxiosResponse } from 'axios';
import type { AuthLoggerData } from '@/@types/category/Logger.types';
import type { ResultData } from '@/@types/Response.types';


/** pinia  */
const store = changeLogState();
const { Login, LogOut } = store;


const tableLayout = ref('auto');                // 表格預設排版
const TableData = ref<AuthLoggerData[]>([]);    // 表格資料
const searchTerm = ref('');                     // 默認搜尋字串為空
const filterVisible = ref(false);               // 過濾彈窗可見性
const errorMessage = ref('');
const loading = ref(true);

const timeRangeSelect = ref<string[]>([]);      // 選取的時間區間


/**
 * 組件掛載後獲取資料
 */
onMounted(async () => {
    await getData();
});


const getData = async (startTime?: string, endTime?: string) => {


    try {
        let response: AxiosResponse<ResultData, any>;

        if (startTime && endTime && isValidDateString(startTime) && isValidDateString(endTime)) {
            const data = {
                startDate: startTime,
                endDate: endTime
            };
            response = await axios.get('/api/service/logger/radiusAuth', { params: data });
        }
        else {
            response = await axios.get('/api/service/logger/radiusAuth');
        }


        if (response.data.loadType === LoadType.SUCCEED) {
            response.data.data.map((item: any) => {
                item.authdate = convertUTCtoLocal(item.authdate);
                return item;
            });
            TableData.value = response.data.data as AuthLoggerData[];
        }
        else if (response.data.loadType === LoadType.UNAUTHORIZED) {
            errorMessage.value = '已登出當前使用者狀態，請重新整理網頁';
        }
        else {
            throw TypeError(`Data error: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        errorMessage.value = '獲取資料錯誤' + error;
    }

    loading.value = false;
};

// 過濾器彈窗按鈕
const onClickFilter = async () => {

    // 按下確認過濾按鈕
    if (filterVisible.value === true) {
        loading.value = true;

        if (timeRangeSelect.value && timeRangeSelect.value.length === 2) {
            console.log('timeRangeSelect.value[0]', timeRangeSelect.value[0]);
            console.log('timeRangeSelect.value[1]', timeRangeSelect.value[1]);

            const startTime = timeRangeSelect.value[0];
            const endTime = timeRangeSelect.value[1];

            getData(startTime, endTime);
        }
        else {
            getData();
        }
    }


    filterVisible.value = !filterVisible.value;

    // 由 filteredAndSortedtableData 進行過濾處理

};


/**
 * 表格頁數處理
 */
const filteredAndSortedTableData = computed(() => {
    // 先過濾數據
    const filteredData = TableData.value.filter(item =>
        searchTerm.value === '' || item.mac_address.includes(searchTerm.value)
    );
    return filteredData;
});

/**
 * 用來控制分頁的變量
 * (limit & page-size 要設一樣不然會造成顯示錯誤)
 */
const state = reactive({
    page: 1,            // 默認頁
    limit: 50,          // 一頁顯示的數量
    get total() {       // 總數量
        return filteredAndSortedTableData.value.length;
    }
});

/**
 * 返回當前頁面的表格數據
 */
const tableData = () => {
    // 使用 filter 方法過濾 data.value 中的元素
    return filteredAndSortedTableData.value.filter((item, index) => {
        // 只保留那些索引值在當前頁面範圍內的元素
        return index >= (state.page - 1) * state.limit && index < state.page * state.limit;
    });
};

/**
 * 改變頁碼
 * @param e 當前的頁碼
 */
const handleCurrentChange = (e: number) => {
    state.page = e;
};

</script>


<style lang="scss" scoped>
/* 添加資料按鈕 */
.add-data-button {
    margin: 10px;
}

.add-data-button .button-content {
    font-size: 20px;
}

/* 搜尋欄 */
.filter-container {
    max-width: 400px;
    margin-bottom: 10px;
}

/* 表格中按鈕 */
.el-btn {
    font-size: 16px;
    margin-left: 12px;
    margin-bottom: 5px;
}

/* 過濾彈窗 */
.filter-box {
    border: 1px solid #ccc;
    /* 添加外框 */
    border-radius: 5px;
    padding: 20px;
    margin-top: 10px;
}

.filter-box-content {
    margin: 10px;
}

.filter-box .select-box {
    margin-bottom: 10px;
}
</style>