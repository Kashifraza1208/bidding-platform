# Bidding Platform


## Usage

1. Clone the repository to your local machine or VS code.
   ```bash
   git clone https://github.com/Kashifraza1208/bidding-platform.git
   ```

2. Install NPM in main directory                                   -------> for backend
   ```bash
   1. npm install
   2. npm run dev
   ```

3. Connect with local Database using following command
   
   ```bash
      CREATE USER 'test'@'localhost' IDENTIFIED BY 'test';
      GRANT ALL PRIVILEGES ON *.* TO 'test'@'localhost' WITH GRANT OPTION;
      ALTER USER 'test'@'localhost' IDENTIFIED WITH mysql_native_password BY 'test';
      flush privileges;


      create database if not exists bidding_platform;
      
      use bidding_platform;
      
      CREATE TABLE IF NOT EXISTS `users` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(45) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `email` VARCHAR(45) NOT NULL,
        `role` VARCHAR(45) NOT NULL DEFAULT 'user',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE INDEX `username_UNIQUE` (`username` ASC),
        UNIQUE INDEX `email_UNIQUE` (`email` ASC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      
      
      
      CREATE TABLE IF NOT EXISTS `items` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT NOT NULL,
        `starting_price` DECIMAL(10, 2) NOT NULL,
        `current_price` DECIMAL(10, 2) DEFAULT NULL,
        `image_url` VARCHAR(255) DEFAULT NULL,
        `end_time` DATETIME NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
      );
      
      
      CREATE TABLE IF NOT EXISTS `bids` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `item_id` INT NOT NULL,
        `user_id` INT NOT NULL,
        `bid_amount` DECIMAL(10, 2) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
      );
      
      
      
      CREATE TABLE IF NOT EXISTS `notifications` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `user_id` INT NOT NULL,
        `message` VARCHAR(255) NOT NULL,
        `is_read` BOOLEAN DEFAULT FALSE,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
      );

   ```
   


## Technologies Used

- Node
- Express
- MySQL
