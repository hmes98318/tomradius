/**
 * 把時間統一格式化成 YYYY-MM-DD 給資料庫 (DATE 格式)
 * @param date - 時間格式
 * @returns - YYYY-MM-DD
 */
const formatDate = (date: string | number | Date | null) => {
    if (date === null) {
        return null;
    }

    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    return [year, month, day].join('-');
}

export { formatDate };