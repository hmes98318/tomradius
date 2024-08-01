/*
* MySQL 8.0.37-0ubuntu0.22.04.3
* FreeRADIUS Version 3.0.26
* 
* rlm_sql - FreeRADIUS SQL Module
* Customized version of schema.sql
* 
* To load:
*   mysql -u root -p radius_db < custom-schema.sql
* 
*/


CREATE TABLE IF NOT EXISTS radacct (
    radacctid BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    acctsessionid VARCHAR(64) NOT NULL DEFAULT '',
    acctuniqueid VARCHAR(32) NOT NULL DEFAULT '',
    username VARCHAR(64) NOT NULL DEFAULT '',
    realm VARCHAR(64) DEFAULT '',
    nasipaddress VARCHAR(15) NOT NULL DEFAULT '',
    nasportid VARCHAR(32) DEFAULT NULL,
    nasporttype VARCHAR(32) DEFAULT NULL,
    acctstarttime DATETIME NULL DEFAULT NULL,
    acctupdatetime DATETIME NULL DEFAULT NULL,
    acctstoptime DATETIME NULL DEFAULT NULL,
    acctinterval INT DEFAULT NULL,
    acctsessiontime INT UNSIGNED DEFAULT NULL,
    acctauthentic VARCHAR(32) DEFAULT NULL,
    connectinfo_start VARCHAR(128) DEFAULT NULL,
    connectinfo_stop VARCHAR(128) DEFAULT NULL,
    acctinputoctets BIGINT DEFAULT NULL,
    acctoutputoctets BIGINT DEFAULT NULL,
    calledstationid VARCHAR(50) NOT NULL DEFAULT '',
    callingstationid VARCHAR(50) NOT NULL DEFAULT '',
    acctterminatecause VARCHAR(32) NOT NULL DEFAULT '',
    servicetype VARCHAR(32) DEFAULT NULL,
    framedprotocol VARCHAR(32) DEFAULT NULL,
    framedipaddress VARCHAR(15) NOT NULL DEFAULT '',
    framedipv6address VARCHAR(45) NOT NULL DEFAULT '',
    framedipv6prefix VARCHAR(45) NOT NULL DEFAULT '',
    framedinterfaceid VARCHAR(44) NOT NULL DEFAULT '',
    delegatedipv6prefix VARCHAR(45) NOT NULL DEFAULT '',
    class VARCHAR(64) DEFAULT NULL,
    PRIMARY KEY (radacctid),
    UNIQUE KEY acctuniqueid (acctuniqueid),
    KEY username (username),
    KEY framedipaddress (framedipaddress),
    KEY framedipv6address (framedipv6address),
    KEY framedipv6prefix (framedipv6prefix),
    KEY framedinterfaceid (framedinterfaceid),
    KEY delegatedipv6prefix (delegatedipv6prefix),
    KEY acctsessionid (acctsessionid),
    KEY acctsessiontime (acctsessiontime),
    KEY acctstarttime (acctstarttime),
    KEY acctinterval (acctinterval),
    KEY acctstoptime (acctstoptime),
    KEY nasipaddress (nasipaddress),
    KEY class (class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radcheck (
    id INT UNSIGNED NOT NULL auto_increment,
    username VARCHAR(64) NOT NULL default '',
    attribute VARCHAR(64) NOT NULL default '',
    op CHAR(2) NOT NULL DEFAULT '==',
    value VARCHAR(253) NOT NULL default '',
    -- custom columns --
    computer_name VARCHAR(64) NOT NULL DEFAULT '',
    employee_name VARCHAR(64) NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL DEFAULT '',
    creator VARCHAR(64) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY username (username(32))
    -- END custom columns --
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radgroupcheck (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '==',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radgroupreply (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '=',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radreply (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '=',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radusergroup (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL DEFAULT '',
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    priority INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS radpostauth (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL DEFAULT '',
    pass VARCHAR(64) NOT NULL DEFAULT '',
    reply VARCHAR(32) NOT NULL DEFAULT '',
    authdate TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    class VARCHAR(64) DEFAULT NULL,
    PRIMARY KEY (id),
    KEY username (username),
    KEY class (class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS nas (
    id INT NOT NULL AUTO_INCREMENT,
    nasname VARCHAR(128) NOT NULL,
    shortname VARCHAR(32),
    type VARCHAR(30) DEFAULT 'other',
    ports INT,
    secret VARCHAR(60) NOT NULL DEFAULT 'secret',
    server VARCHAR(64),
    community VARCHAR(50),
    description VARCHAR(200) DEFAULT 'RADIUS Client',
    PRIMARY KEY (id),
    KEY nasname (nasname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
