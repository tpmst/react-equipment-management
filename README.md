# IT Beschaffung Web Application

This project is a web application designed to manage and track IT procurement processes. It allows users to upload PDF files, view and edit CSV records, and generate and download PDF files based on specific templates.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [Cloning the Repository](#cloning-the-repository)
  - [Installing Dependencies](#installing-dependencies)
  - [Configuring the Environment](#configuring-the-environment)
  - [Setting Up the PDF Template](#setting-up-the-pdf-template)
  - [Create necessary folder](#create-necessary-folder)
- [Running the Application](#running-the-application)
  - [Starting the Backend Server](#starting-the-backend-server)
  - [Starting the Frontend](#starting-the-frontend)
- [Applicationlooks](#application-looks)
- [Application Features](#application-features)
- [Techstack](#technologies-used)
- [Usage](#usage)
  - [Uploading a PDF](#uploading-a-pdf)
  - [Viewing and Editing CSV Data](#viewing-and-editing-csv-data)
  - [Generating and Downloading PDFs](#generating-and-downloading-pdfs)
  - [Languages](#language)
- [API Documentation](#api-documentation)
- [Adding a Printer](#adding-a-printer)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [ToDos](#todos)
- [License](#license)

## Prerequisites

Before you start, ensure you have the following installed on your machine:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Git**

## Setup

### Cloning the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/yourusername/it-beschaffung.git
cd it-beschaffung
```

### Installing Dependencies
Navigate to the root directory of the project and install the required dependencies for both the backend and frontend:

```bash
npm install
```
If you are using yarn:
```bash
yarn install
```

### Configuring the Environment
Create a env.js file in the public directory to store your environment variables. Below is a sample configuration:

```bash
API_URL: "",
API_PORT: "",
COMPANY_NAME: "",
```

Then go to the backend in the .env file and change it according to your environment.

```bash
JWT_SECRET=my_super_secure_secret
JWT_REFRESH_SECRET=my_refresh_secret
JWT_EXPIRATION=2h
REFRESH_TOKEN_EXPIRATION=7d

#network conf
API_PORT=3000

#frontend conf
FRONTEND_URL=
FRONTEND_URL_BACKUP=http://localhost

#backend conf
BACKEND_URL=

# only if rest Password is active
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=someUser
EMAIL_PASS=somePassword
```

Make sure to replace your_jwt_secret_key with a secure string.

### Default User
```bash
username: admin
password: 1234
```

### Setting Up the PDF Template
The application uses JSON templates to generate PDFs. You need to place your PDF template in the appropriate directory:

Navigate to the templates directory in your project:
```bash
mkdir -p templates
```
Create a ```template-betrieb.json``` file inside the templates directory. This file should contain the template for the PDF generation.
You can create own Templates on https://pdfme.com/template-design.

Example template:
```json
{
  "basePdf": "BLANK_PDF",
  "schemas": [
    {
      "produkt": { "type": "text", "position": { "x": 50, "y": 50 }, "width": 200, "height": 20 },
      "accessorie": { "type": "text", "position": { "x": 50, "y": 80 }, "width": 200, "height": 20 },
      "notes": { "type": "text", "position": { "x": 50, "y": 110 }, "width": 200, "height": 20 },
      "Notebook": { "type": "text", "position": { "x": 50, "y": 140 }, "width": 200, "height": 20 },
      "Tablet": { "type": "text", "position": { "x": 50, "y": 170 }, "width": 200, "height": 20 },
      "Mobile": { "type": "text", "position": { "x": 50, "y": 200 }, "width": 200, "height": 20 },
      "Storage": { "type": "text", "position": { "x": 50, "y": 230 }, "width": 200, "height": 20 },
      "Else": { "type": "text", "position": { "x": 50, "y": 260 }, "width": 200, "height": 20 },
      "additionalNotes": { "type": "text", "position": { "x": 50, "y": 290 }, "width": 200, "height": 20 },
      "name": { "type": "text", "position": { "x": 50, "y": 320 }, "width": 200, "height": 20 }
    }
  ]
}
```
Adjust the positions and fields according to your specific requirements.

### Create necessary folder

Go to the ```backend/files``` and create the following folders
1. rechnungen
2. pdf
3. uploads
4. investantrag

## Running the Application
### Starting the Backend Server
To start the backend server navigate into the backend folder and run:
```bash
node app.js
```
This will start the server on http://localhost:3000.

### Starting the Frontend
In a separate terminal window, start the frontend:
```bash
npm run start
```
The frontend will be accessible at http://localhost:5173.

## Application Looks
### Dashboard
![image](https://github.com/user-attachments/assets/14004aca-f7eb-4b4e-80b5-8336c6d0ca73)
![image](https://github.com/user-attachments/assets/c6daec6c-16f9-4b3a-a213-6fd880d8cfd6)
![image](https://github.com/user-attachments/assets/49ae442a-70b9-43c0-8d29-937699d3d8e6)

### Buying
![image](https://github.com/user-attachments/assets/6e305f27-159b-4690-b4f1-9bdebde45a47)

### IT-Purchases
![image](https://github.com/user-attachments/assets/f5acd252-9e82-4f93-9a8f-95bf9ebae0a8)

### Printers
![image](https://github.com/user-attachments/assets/db0f2f3b-783e-4f90-a2da-1216e2ea598e)

### File Management
![image](https://github.com/user-attachments/assets/caa66076-805f-475a-8502-4ec2cc562399)

### Logs
![image](https://github.com/user-attachments/assets/fb66cffc-d917-496a-af05-f14d6a98bf02)

### User and Groupmanagemnt
![image](https://github.com/user-attachments/assets/88bcbbc3-5b83-42d9-8804-fef2be213acf)
![image](https://github.com/user-attachments/assets/b5a00498-377f-4b7b-b873-f850b6d6ba94)

## Application Features
### 1. **Dashboard**
- Overview of key statistics and data
- Content dynamically adapts based on user permissions

### 2. **CSV Viewer**
- Load and edit various CSV formats:
  - **Small Items**: CSV files for small hardware/devices
  - **Purchases**: Procurement-related CSVs
  - **IT Supplies**: Tracking IT inventory

### 3. **Printer Dashboard**
- Monitor printers in real-time
- View printer status and usage stats

### 4. **Phone Management**
- Manage CSV files containing phone-related data
- Edit and organize user/device information

### 5. **User Permissions**
- Dynamic routes and views based on user groups
- Permissions retrieved from backend
- Restricted access with appropriate error feedback

### 6. **Multilingual Support**
- Fully translated in **English** and **German**
- Users can switch languages via header buttons

### 7. **Secure Logout**
- Logout button with secure session clearing
- Designed with accessibility and UX in mind

### 8. **Settings Panel**
- Admin panel for managing global settings
- Easily configure application behavior

## Technologies Used

### Frontend
- ⚛️ **React** (with TypeScript)
- 💅 **TailwindCSS** for styling
- 🧩 **Material-UI** for UI components & icons
- 🌐 **React Router** for navigation
- 🌍 **i18next** for internationalization
- 🔗 **Axios** for API interactions

### Backend
- 🟢 **Node.js**
- 🚂 **Express.js**
- 📁 File handling & CSV processing via custom endpoints

## Usage
### Uploading a PDF.
1. Navigate to the "PDF Files" section from the dashboard.
2. Click on "Upload PDF".
3. Select the PDF file from your file system.
4. Click "Upload". The file will be uploaded to the server, and a notification will prompt you to update the file path in the Excel sheets section.

### Viewing and Editing CSV Data
1. Navigate to the "Excel-Sheet" section.
2. Use the search bar to search for records by any column, such as ID or name.
3. Click on a row to edit it, or click "Add Entry" to create a new record.
4. Save changes, and the CSV file will be updated.

### Generating and Downloading PDFs
Ensure the CSV data is up-to-date with the correct file paths.
The application will automatically generate PDFs when necessary, saving them in the configured directory.
Download the generated PDFs from the "PDF Files" section.

### Language
There is a locals folder where you can take the en/translation.json and translate it into your Language. But in some cases the Language is depending on the CSV-Files you have in your backend, so you maby need to change some parts of the code for example in the EditModals for the tabels.

## API Documentation
The API provides endpoints for managing PDFs, CSV files, and user authentication.

### Endpoints
```bash
For Endpoints look into backend/routes
```
For detailed documentation, refer to the API source code comments.

## Adding a Printer
For adding a Printer take a look into my two reposetorys for kyocera printer:
1. https://github.com/tpmst/read-printer-tonerlevel-kyocera
2. https://github.com/tpmst/read-printer-counts-kyocera

If you dont have koycera printers you can either delete this tap or try to get the SNMP-OIDs for your printers.


## Troubleshooting
Error: Cannot connect to the server.
Ensure that the backend server is running and accessible on the correct port.
PDF template not found.
Make sure the PDF template JSON file is correctly placed in the templates directory.

Other can be looked at in the logs-tab in settings.

## Contributing
If you'd like to contribute to this project, please follow these steps:

Fork the repository.
Create a new branch.
Make your changes.
Submit a pull request.

## Todos
- Printermanagemaent (Contracts, Cost, SerialNumber, Printername) <-- Done but not uploaded to github
- Licence Managment (Software, Licence Key, User, Seller, Usedate, Cost, End of Licence) 

## License
This project is licensed under the MIT License. See the LICENSE file for details.
