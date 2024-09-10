<!--
    events: SUCESS_ADD, SUCESS_PUT, SUCESS_DELETE
    event 用來給子組件呼叫父組件彈出右下角彈窗
-->
<template>
    <div class="add-data-button">
        <el-button type="primary" size="large" @click="addClick()">
            <div class="button-content">
                新增授權
            </div>
        </el-button>
    </div>

    <div class="filter-container">
        <el-input v-model="searchTerm" size="large" placeholder="搜尋 MAC 地址, 電腦名稱" style="width: 70%;" />
        <el-button :type="filterVisible ? 'primary' : 'default'" @click="onClickFilter" size="large"
            style="margin-left: 6px;">{{
                filterVisible ? '確認過濾' : '過濾內容' }}</el-button>

        <div class="filter-box" v-if="filterVisible">
            <div class="select-box">
                <el-input v-model="employeeSelect" placeholder="過濾員工名稱" style="width: 240px" />
            </div>
            <div class="select-box">
                <el-select v-model="creatorSelect" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="3"
                    placeholder="創建人員" style="width: 240px">
                    <el-option v-for="item in creatorOption" :key="item" :label="item" :value="item" />
                </el-select>
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

    <el-table v-loading="loading" element-loading-text="載入中..." :data="getFilteredTableData()"
        :table-layout="tableLayout" style="width: 100%; font-size: 16px;"
        :default-sort="{ prop: 'mac_address', order: 'descending' }" border stripe>

        <el-table-column type="index" width="50">
            <template #default="scope">
                <div>
                    {{ (state.page - 1) * state.limit + scope.$index + 1 }}
                </div>
            </template>
        </el-table-column>

        <el-table-column prop="mac_address" label="MAC 地址" sortable min-width="130" />
        <el-table-column prop="computer_name" label="電腦名稱" sortable min-width="130" />
        <el-table-column prop="employee_name" label="員工名稱" sortable min-width="130" />
        <el-table-column prop="creator" label="創建人員" sortable min-width="130" />
        <el-table-column prop="description" label="描述" sortable min-width="130" />
        <el-table-column prop="created_at" label="創建時間" sortable min-width="130" />


        <el-table-column fixed="right" label="動作">
            <template #default="scope">
                <el-button type="primary" class="el-btn" size="default" @click="putClick(scope.row)">編輯</el-button>
                <el-button type="danger" class="el-btn" size="default" @click="deleteClick(scope.row)">刪除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 下方分頁標籤 -->
    <el-pagination background layout="prev, pager, next" :total="filteredAndSortedTableData.length" :page-size="50"
        @current-change="handleCurrentChange" class="d-flex justify-content-center align-items-center" />


    <!-- 添加介面 -->
    <AddRadiusData v-if="addOnClick" :message="'RadiusAdd'" :exit="addOnClick" :onExit="addClick"
        @SUCESS_ADD="showSuccessAddNotify" />

    <!-- 修改介面 -->
    <PutRadiusData v-if="putOnClick" :message="'RadiusPut'" :exit="putOnClick" :onExit="putClick"
        :id="putRadiusData!.id" @SUCESS_PUT="showSuccessPutNotify" />

    <!-- 刪除介面 -->
    <DeleteRadiusData v-if="deleteOnClick" :message="'RadiusDelete'" :exit="deleteOnClick" :onExit="deleteClick"
        :id="deleteRadiusData!.id" @SUCESS_DELETE="showSuccessDeleteNotify" />
</template>


<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted, computed, reactive } from 'vue';

import AddRadiusData from '@/components/manage/data/add/AddRadiusData.vue';
import PutRadiusData from '@/components/manage/data/put/PutRadiusData.vue';
import DeleteRadiusData from '@/components/manage/data/delete/DeleteRadiusData.vue';
import { Success } from '@/components/notification/DataNotification.js';

import { changeLogState } from '@/stores/isLogin';
import { convertUTCtoLocal } from '@/components/util/convertUTCtoLocal';
import { normalizeMacAddress } from '@/components/util/normalizeMacAddress';
import { LoadType } from '@/@types/Response.types';

import type { RadiusData } from '@/@types/category/Radius.types';


/** pinia  */
const store = changeLogState();
const { Login, LogOut } = store;


const tableLayout = ref('auto');            // 表格預設排版
const tableData = ref<RadiusData[]>([]);    // 表格資料
const searchTerm = ref('');                 // 默認搜尋字串為空
const filterVisible = ref(false);           // 過濾彈窗可見性
const errorMessage = ref('');
const loading = ref(true);

const creatorOption = ref<string[]>([]);            // 可用創建人員選項
const employeeSelect = ref('');                     // 使用者輸入的員工名稱
const creatorSelect = ref([]);                      // 使用者選擇的創建人員

const addOnClick = ref(false);
const deleteOnClick = ref(false);
const putOnClick = ref(false);
const deleteRadiusData = ref<RadiusData>();
const putRadiusData = ref<RadiusData>();


/**
 * 組件掛載後獲取資料
 */
onMounted(async () => {
    await getData();

    creatorOption.value = getCreatorOption(tableData.value);
});


const getData = async () => {
    try {
        const response = await axios.get('/api/radius/list?type=1');

        if (response.data.loadType === LoadType.SUCCEED) {
            response.data.data.map((item: any) => {
                item.created_at = convertUTCtoLocal(item.created_at);
                return item;
            });
            tableData.value = response.data.data;
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

/**
 * 讀取 RadiusData[] 獲取 creator 清單
 */
const getCreatorOption = (data: RadiusData[]) => {
    const creatorSet = new Set<string>();

    data.forEach((item) => {
        creatorSet.add(item.creator);
    });

    const creatorList = Array.from(creatorSet);

    return creatorList;
};


// 新增成功彈窗
const showSuccessAddNotify = () => {
    Success.add();

    loading.value = true;
    getData();
};

// 刪除成功彈窗
const showSuccessDeleteNotify = () => {
    Success.delete();

    loading.value = true;
    getData();
};

// 修改成功彈窗
const showSuccessPutNotify = () => {
    Success.put();

    loading.value = true;
    getData();
};

// 過濾器彈窗按鈕
const onClickFilter = () => {
    filterVisible.value = !filterVisible.value;

    // 由 filteredAndSortedTableData 進行過濾處理
};


// 點擊新增
const addClick = () => {
    addOnClick.value = !addOnClick.value;
};

// 點擊修改
const putClick = (item: RadiusData) => {
    putOnClick.value = !putOnClick.value;
    putRadiusData.value = item;
};

const deleteClick = (item: RadiusData) => {
    deleteOnClick.value = !deleteOnClick.value;
    deleteRadiusData.value = item;
};


/**
 * 表格頁數處理
 */
const filteredAndSortedTableData = computed(() => {
    // 先過濾數據
    let filteredData = tableData.value.filter((item) => {
        return (
            searchTerm.value === '' ||
            item.mac_address.includes(normalizeMacAddress(searchTerm.value)) ||
            item.computer_name.includes(searchTerm.value.toUpperCase())
        );
    });

    /**
     * 過濾器處理
     */
    // 員工過濾
    if (employeeSelect.value !== '') {
        filteredData = filteredData.filter((item) => {
            return (item.employee_name.toLowerCase().includes(employeeSelect.value.toLowerCase()));
        });
    }

    // 期號過濾
    if (creatorSelect.value.length > 0) {
        const selectedNos = creatorSelect.value.map(String);
        filteredData = filteredData.filter(item =>
            selectedNos.includes(item.creator)
        );
    }


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
const getFilteredTableData = () => {
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
    margin-top: 10px;
    margin-bottom: 10px;
}

.add-data-button .button-content {
    font-size: 20px;
}

/* 搜尋欄 */
.filter-container {
    max-width: 400px;
    margin-bottom: 10px;
}

/* 搜尋欄 過濾按鈕 */
.filter-container .el-button {
    font-size: 16px;
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