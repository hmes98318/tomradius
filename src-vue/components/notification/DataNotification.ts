/**
 * 增刪改通知處理
 * 
 * type: "success" | "warning" | "error" | "info"
 * 
 */
import { ElNotification } from 'element-plus';


const Success = {
    add: () => {
        ElNotification({
            type: 'success',
            title: '添加成功',
            message: '資料添加成功',
        });
    },

    delete: () => {
        ElNotification({
            type: 'success',
            title: '刪除成功',
            message: '資料刪除成功',
        });
    },

    put: () => {
        ElNotification({
            type: 'success',
            title: '修改成功',
            message: '資料修改成功',
        });
    }
};

const Fail = {
    add: () => {
        ElNotification({
            type: 'error',
            title: '添加失敗',
            message: '資料添加失敗',
        });
    },

    delete: () => {
        ElNotification({
            type: 'error',
            title: '刪除失敗',
            message: '資料刪除失敗',
        });
    },

    put: () => {
        ElNotification({
            type: 'error',
            title: '修改失敗',
            message: '資料修改失敗',
        });
    }
};

export { Success, Fail };