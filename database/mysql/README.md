## 此為 FreeRADIUS 的資料庫配置文件  

### 環境配置
```
Ubuntu 22.04
10.6.18-MariaDB-0ubuntu0.22.04.1
FreeRADIUS Version 3.0.26
```


### 導入說明
FreeRADIUS 預設資料庫檔案路徑 `/etc/freeradius/3.0/mods-config/sql/main/mysql`  

該路徑下含有的檔案為  
```
process-radacct.sql     // 使用者的資料使用統計
queries.conf            // SQL query
schema.sql              // 初始化資料庫架構
setup.sql               // User 配置
```

本專案使用 **MariaDB** 需導入的配置檔為 `custom-schema.sql`。   
(使用 `schema.sql` 進行修改添加本專案所需格式)  


### 導入步驟
創建 MariaDB 使用者 (使用以下方法或參考 `setup.sql`)  
```bash
mysql> CREATE USER 'radius'@'localhost' IDENTIFIED BY 'your_password';
mysql> GRANT ALL PRIVILEGES ON radius_db.* TO 'radius'@'localhost';
mysql> FLUSH PRIVILEGES;
```

創建 Database  
```bash
mysql> CREATE DATABASE radius_db;
```

導入資料庫架構  
```bash
mysql -u root -p radius_db < custom-schema.sql
```
