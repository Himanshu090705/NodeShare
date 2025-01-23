# README for Nodeshare: Peer-to-Peer File Sharing and Conversion Website

## Overview

Nodeshare is a peer-to-peer (P2P) platform for seamless file sharing and file format conversions. The website enables users to upload, share, and convert files with ease while maintaining privacy and speed through advanced technology. Inspired by platforms like Convertio and ToffeeShare, Nodeshare provides an intuitive user experience for all file management needs.

## Features

1. **File Sharing**:
    - Upload files and share them via a secure link.
    - Peer-to-peer sharing ensures data is not stored on centralized servers.
2. **File Conversion**:
    - Convert files between popular formats (e.g., PDF to Word, PNG to JPEG).
    - High-speed conversion with support for various file types.
3. **User Management**:
    - Register and log in securely.
    - Manage account details and preferences.
4. **Subscription Plans**:
    - Upgrade to premium plans for advanced features like larger file uploads and priority conversions.
5. **File History**:
    - Maintain version control for edited or converted files.

## Modules and Database Schema

Nodeshare's database is designed to support the platform's features efficiently. Below are the primary modules:

### 1. File Transaction Table

**Description**: Stores details of file transactions (uploads, downloads, etc.).

| Field            | Type        | Constraints | Description                           |
| ---------------- | ----------- | ----------- | ------------------------------------- |
| transaction_id   | Integer     | Primary key | Unique transaction ID                 |
| file_id          | Integer     | Foreign key | References Files.file_id              |
| user_id          | Integer     | Foreign key | References Users.user_id              |
| transaction_type | Varchar(20) | Not null    | Type of transaction (upload/download) |
| transaction_time | Datetime    | Not null    | Timestamp of the transaction          |

### 2. User Management Table

**Description**: Stores information about users of Nodeshare.

| Field         | Type         | Constraints | Description                               |
| ------------- | ------------ | ----------- | ----------------------------------------- |
| user_id       | Integer      | Primary key | Unique user ID                            |
| username      | Varchar(100) | Not null    | User's username                           |
| password_hash | Varchar(100) | Not null    | Hashed password of the user               |
| email         | Varchar(100) | Not null    | Email address of the user                 |
| user_type     | Varchar(20)  | Not null    | Type of user (e.g., free, premium, admin) |

### 3. File Conversion Requests Table

**Description**: Stores details about file conversion requests made by users.

| Field             | Type        | Constraints | Description                                  |
| ----------------- | ----------- | ----------- | -------------------------------------------- |
| request_id        | Integer     | Primary key | Unique request ID                            |
| user_id           | Integer     | Foreign key | References Users.user_id                     |
| file_id           | Integer     | Foreign key | References Files.file_id                     |
| source_format     | Varchar(20) | Not null    | Format of the original file                  |
| target_format     | Varchar(20) | Not null    | Desired format for the converted file        |
| request_time      | Datetime    | Not null    | Timestamp of the conversion request          |
| conversion_status | Varchar(20) | Not null    | Status of the conversion (pending/completed) |

### 4. Shared Files Tracking Table

**Description**: Tracks files that are shared among users.

| Field       | Type     | Constraints | Description                         |
| ----------- | -------- | ----------- | ----------------------------------- |
| share_id    | Integer  | Primary key | Unique share ID                     |
| sender_id   | Integer  | Foreign key | References Users.user_id (sender)   |
| receiver_id | Integer  | Foreign key | References Users.user_id (receiver) |
| file_id     | Integer  | Foreign key | References Files.file_id            |
| share_time  | Datetime | Not null    | Timestamp of the file being shared  |

### 5. Files Table

**Description**: Stores details about the files shared or converted on Nodeshare.

| Field       | Type         | Constraints | Description                  |
| ----------- | ------------ | ----------- | ---------------------------- |
| file_id     | Integer      | Primary key | Unique file ID               |
| user_id     | Integer      | Foreign key | References Users.user_id     |
| file_name   | Varchar(255) | Not null    | Name of the file             |
| file_size   | Integer      | Not null    | Size of the file (in bytes)  |
| file_format | Varchar(20)  | Not null    | Format/extension of the file |
| upload_time | Datetime     | Not null    | Timestamp of file upload     |

### 6. Subscription and Plans Module

**Description**: Tracks user subscriptions for premium features like increased storage or faster conversion speeds.

| Field           | Type          | Constraints | Description                     |
| --------------- | ------------- | ----------- | ------------------------------- |
| subscription_id | Integer       | Primary key | Unique subscription ID          |
| user_id         | Integer       | Foreign key | References Users.user_id        |
| plan_name       | Varchar(50)   | Not null    | Name of the subscription plan   |
| plan_price      | Decimal(10,2) | Not null    | Monthly price of the plan       |
| start_date      | Datetime      | Not null    | Start date of the subscription  |
| end_date        | Datetime      | Not null    | Expiry date of the subscription |

### 7. File History Module

**Description**: Stores the version history of files that have been edited or converted multiple times.

| Field              | Type         | Constraints | Description                        |
| ------------------ | ------------ | ----------- | ---------------------------------- |
| history_id         | Integer      | Primary key | Unique history entry ID            |
| file_id            | Integer      | Foreign key | References Files.file_id           |
| version_number     | Integer      | Not null    | Version number of the file         |
| change_description | Varchar(255) | Not null    | Description of changes made        |
| change_time        | Datetime     | Not null    | Timestamp when the change occurred |

## Getting Started

1. Clone the repository.
2. Install the required dependencies using `npm install`.
3. Configure the database settings in the `.env` file.
4. Start the server using `npm start`.
5. Start the client using `npm run dev`.

## Contribution

We welcome contributions! Feel free to fork the repository and submit pull requests for new features or bug fixes.
