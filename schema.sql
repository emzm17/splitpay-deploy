create table `users`(
     user_id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL
);
create table `group_s`(
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     users_id json NOT NULL,
     created_by INT NOT NULL,
     FOREIGN KEY (created_by) REFERENCES users(user_id)
);

create table `expenses`(
     expense_id INT PRIMARY KEY AUTO_INCREMENT,
     amount DECIMAL(10,2) NOT NULL,
     description VARCHAR(255) NOT NULL,
     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     payer_id INT NOT NULL,
     group_id INT NOT NULL,
     FOREIGN KEY (payer_id) REFERENCES users(user_id),
     FOREIGN KEY (group_id) REFERENCES group_s(id)
);