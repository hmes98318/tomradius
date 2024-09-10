/*
* 10.6.18-MariaDB-0ubuntu0.22.04.1
* FreeRADIUS Version 3.0.26
* 
* rlm_sql - FreeRADIUS SQL Module
* Customized version of schema.sql
* 
* To load:
*   mariadb -u root -p radius_db < custom-schema.sql
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS radcheck (
    id INT UNSIGNED NOT NULL auto_increment,
    username VARCHAR(64) NOT NULL default '',
    attribute VARCHAR(64) NOT NULL default '',
    op CHAR(2) NOT NULL DEFAULT '==',
    value VARCHAR(253) NOT NULL default '',
    -- Custom columns --
    computer_name VARCHAR(64) NOT NULL DEFAULT '',
    employee_name VARCHAR(64) NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL DEFAULT '',
    creator VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    -- END custom columns --
    PRIMARY KEY (id),
    KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS radgroupcheck (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '==',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS radgroupreply (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '=',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY groupname (groupname(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS radreply (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL DEFAULT '',
    attribute VARCHAR(64) NOT NULL DEFAULT '',
    op CHAR(2) NOT NULL DEFAULT '=',
    value VARCHAR(253) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS radusergroup (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL DEFAULT '',
    groupname VARCHAR(64) NOT NULL DEFAULT '',
    priority INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY username (username(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- Custom Tables --

CREATE TABLE IF NOT EXISTS record (
    id INT UNSIGNED NOT NULL auto_increment,
    creator VARCHAR(64) NOT NULL DEFAULT '',
    op_type TINYINT UNSIGNED NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    KEY creator (creator)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS recordlogin (
    id INT UNSIGNED NOT NULL auto_increment,
    record_id INT UNSIGNED DEFAULT NULL,
    ip VARCHAR(45) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY record_id (record_id),
    CONSTRAINT fk_recordlogin_record
        FOREIGN KEY (record_id)
        REFERENCES record(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE IF NOT EXISTS recordrad (
    id INT UNSIGNED NOT NULL auto_increment,
    record_id INT UNSIGNED DEFAULT NULL,
    mac_address VARCHAR(255) DEFAULT NULL,
    computer_name VARCHAR(255) DEFAULT NULL,
    employee_name VARCHAR(255) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    KEY record_id (record_id),
    CONSTRAINT fk_recordrad_record
        FOREIGN KEY (record_id)
        REFERENCES record(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- END custom Tables --


-- Custom Stored Procedure --
DELIMITER //

CREATE PROCEDURE InsertRecord_Login (
    IN p_creator VARCHAR(64), 
    IN p_op_type TINYINT UNSIGNED,
    IN p_success BOOLEAN,
    IN p_ip VARCHAR(45)
)
BEGIN
    -- Insert into the record table
    INSERT INTO record (creator, op_type, success, created_at)
    VALUES (p_creator, p_op_type, p_success, CURRENT_TIMESTAMP());

    -- Get the last inserted id
    SET @last_record_id = LAST_INSERT_ID();

    -- Insert into the recordlogin table
    INSERT INTO recordlogin (record_id, ip)
    VALUES (@last_record_id, p_ip);
END //


CREATE PROCEDURE InsertRecord_Rad (
    IN p_creator VARCHAR(64), 
    IN p_op_type TINYINT UNSIGNED,
    IN p_success BOOLEAN,
    IN p_mac_address VARCHAR(255),
    IN p_computer_name VARCHAR(255),
    IN p_employee_name VARCHAR(255),
    IN p_description VARCHAR(255)
)
BEGIN
    -- Insert into the record table
    INSERT INTO record (creator, op_type, success, created_at)
    VALUES (p_creator, p_op_type, p_success, CURRENT_TIMESTAMP());

    -- Get the last inserted id
    SET @last_record_id = LAST_INSERT_ID();

    -- Insert into the recordrad table
    INSERT INTO recordrad (
        record_id, 
        mac_address, 
        computer_name, 
        employee_name, 
        description
    )
    VALUES (
        @last_record_id, 
        p_mac_address, 
        p_computer_name, 
        p_employee_name, 
        p_description
    );
END //

DELIMITER ;
-- END custom Stored Procedure --
