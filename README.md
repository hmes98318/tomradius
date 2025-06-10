<img width="150" height="150" align="right" style="float: right; margin: 0 10px 0 0;" alt="freeradius-network" src="public/img/freeradius-network.svg">

# Radius 認證管理平台
此為 FreeRADIUS 認證系統網頁管理平台，使用 Node.js 和 Vue 開發。該平台使用網頁管理 FreeRADIUS 授權，用於驗證連接至 Aruba Controller 的裝置 MAC 地址是否有效。  


## 使用環境
### 硬體
* HPE Aruba 7205 Controller v8.11.2.2 *2 HA
* HPE Aruba AP-515, AP-575, AP-615

### Server
* Ubuntu 22.04
* 10.6.18-MariaDB-0ubuntu0.22.04.1
* FreeRADIUS V3.0.26
* Node.js v22.16.0


## 環境配置
Clone 此存儲庫  
```bash
git clone https://github.com/hmes98318/tomradius.git
```

安裝 FreeRADIUS 以及 FreeRADIUS 的 MySQL 模組  
```bash
apt update -y
apt install freeradius freeradius-mysql -y
```

啟用 FreeRADIUS 服務  
```bash
systemctl enable freeradius.service
systemctl start freeradius.service
```

安裝 MariaDB，並參考 [資料庫安裝文檔](./database/mysql/README.md) 進行初始化  
```bash
apt install mariadb-server -y
```

啟用 MariaDB  
```bash
systemctl enable mariadb.service
systemctl start mariadb.service
```

初始化配置資料庫
```bash
mariadb-secure-installation
```


## FreeRADIUS 配置
開啟 FreeRADIUS 目錄 `/etc/freeradius/3.0/`  

修改 `mods-available/sql`，設置資料庫連線  
```conf
sql {
    dialect = "mysql"
    driver = "rlm_sql_mysql"

    server = "localhost"
    port = 3306
    login = "radius"
    password = "your_passwprd"
    radius_db = "radius_db"

    # mysql tls 連接註解掉 (預設啟用 tls)
    mysql {
        # If any of the files below are set, TLS encryption is enabled
        # tls {
        #    ca_file = "/etc/ssl/certs/my_ca.crt"
        #    ca_path = "/etc/ssl/certs/"
        #    certificate_file = "/etc/ssl/certs/private/client.crt"
        #    private_key_file = "/etc/ssl/certs/private/client.key"
        #    cipher = "DHE-RSA-AES256-SHA:AES128-SHA"
        #
        #    tls_required = yes
        #    tls_check_cert = no
        #    tls_check_cert_cn = no
        # }

        warnings = auto
    }

    ...
}
```

修改完成後啟用 MySQL 模組  
```bash
ln -s /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/
```

執行 `ls -l mods-enabled/` 查看模組是否已成功掛載
```
lrwxrwxrwx 1 freerad freerad 38 Sep 10 11:00 sql -> /etc/freeradius/3.0/mods-available/sql
```

重啟 FreeRADIUS 服務  
```bash
systemctl restart freeradius.service
```


## 網頁管理平台配置
安裝 npm 模組  
```bash
npm ci
```

參考 `.env.example` 修改 `.env` 配置  
```env
# Database
DB_HOST = "localhost"
DB_PORT = 3306
DB_DATABASE = "database_name"
DB_USER = "user"
DB_PASSWORD = "password"
```

啟動服務  
```bash
npm run start
```


## 使用 systemd 掛載服務

建立 systemd 配置檔  
```bash
vim /etc/systemd/system/tomradius.service
```

參考 `tomradius.service` 修改配置，node.js 環境使用 nvm 配置  
```conf
[Unit]
Description=FreeRADIUS Web Management App
After=network.target

[Service]
WorkingDirectory=/home/radweb/tomradius

User=radweb
Group=radweb

Environment=NODE_VERSION=22.16.0
Environment=DB_HOST=localhost DB_PORT=3306 DB_DATABASE=radius_db DB_USER=radius DB_PASSWORD=radius_password

ExecStart=/home/radweb/.nvm/nvm-exec npm run start
Restart=always

[Install]
WantedBy=multi-user.target
```

設定檔案權限  
```bash
chmod 644 /etc/systemd/system/tomradius.service
```

重新載入 systemd 配置  
```bash
systemctl daemon-reload
```

啟動服務  
```bash
systemctl enable --now tomradius.service
```
