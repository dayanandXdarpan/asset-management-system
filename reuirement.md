TABLE OF CONTENTS
1. CHAPTER 1: COMPANY PROFILE 1.1 About BSPHCL 1.2 Organizational Structure 1.3 Role of IT in Power Sector

2. CHAPTER 2: INTRODUCTION TO PROJECT 2.1 Project Overview (InfraMonitor) 2.2 Problem Statement at BSPHCL 2.3 Objectives 2.4 Scope of Study

3. CHAPTER 3: TECHNOLOGY STACK 3.1 React 19 (Frontend) 3.2 Node.js & Hono (Backend) 3.3 Prisma ORM & Database

4. CHAPTER 4: SYSTEM ANALYSIS & DESIGN 4.1 System Architecture 4.2 Database Design (ER Diagram) 4.3 Data Flow Diagrams (DFD)

5. CHAPTER 5: IMPLEMENTATION 5.1 Module Description 5.2 Key Code Snippets

6. CHAPTER 6: RESULTS & SCREENSHOTS 6.1 Login & Authentication 6.2 Dashboard 6.3 Asset Registry

7. CHAPTER 7: CONCLUSION & FUTURE SCOPE

8. BIBLIOGRAPHY

--- [PAGE BREAK] ---

CHAPTER 1: COMPANY PROFILE
1.1 About BSPHCL
Bihar State Power (Holding) Company Limited (BSPHCL), formerly the Bihar State Electricity Board (BSEB), is a state-owned electricity regulation board operating within the state of Bihar in India. It was restructured into five functional companies to improve efficiency and accountability in the power sector.

The company is headquartered at Vidyut Bhawan, Bailey Road, Patna. BSPHCL acts as the holding company, coordinating the activities of its subsidiaries which handle Generation, Transmission, and Distribution.

1.2 Subsidiaries
The unbundled entities under BSPHCL include:

BSPTCL (Bihar State Power Transmission Company Limited): Responsible for the intra-state transmission of electricity. This is the division where my mentor, Smt. Preeti, operates as IT Manager.

BSPGCL (Bihar State Power Generation Company Limited): Handles power generation.

SBPDCL (South Bihar Power Distribution Company Limited): Distributes power to Southern Bihar.

NBPDCL (North Bihar Power Distribution Company Limited): Distributes power to Northern Bihar.

1.3 Role of IT in BSPHCL
The IT Department at BSPHCL/BSPTCL plays a critical role in modernizing the power grid. Their responsibilities include:

ERP Implementation: Managing SAP/Oracle ERP systems for billing and HR.

Smart Metering: Data handling for Smart Prepaid Meters.

Asset Management: Tracking thousands of transformers, servers, and grid equipment across the state.

SCADA: Supervisory Control and Data Acquisition for grid monitoring.

My project, InfraMonitor, was conceptualized to assist the IT department in tracking internal hardware assets (Servers, Routers, Workstations) to ensure seamless operations.

--- [PAGE BREAK] ---

CHAPTER 2: INTRODUCTION TO PROJECT
2.1 Project Overview
InfraMonitor is a web-based IT Asset Management System developed during my internship at BSPHCL. Large organizations like BSPHCL manage vast IT infrastructure across multiple substations and offices. Tracking the lifecycle, warranty status, and maintenance history of these assets is critical.

InfraMonitor provides a Centralized Digital Dashboard where IT administrators can register assets, assign them to employees or locations, and track maintenance tickets.

2.2 Problem Statement
During the training period at BSPHCL, I observed the following challenges in managing IT assets:

Manual Logs: Some inventory data was still maintained in spreadsheets, leading to version conflicts.

Asset Visibility: It was difficult to instantly locate which computer system was assigned to which substation division.

Maintenance Tracking: There was no unified portal to track the repair history of a specific server or router.

2.3 Objectives
The primary objective of this project was to develop a "Proof of Concept" (PoC) application that solves these issues:

Digitization: Convert manual asset registers into a secure SQL database.

Tracking: Implement a search feature to locate assets by Serial Number or Division.

Maintenance: Create a ticketing system for reporting hardware faults.

Reporting: Generate summaries of Total Assets vs. Damaged Assets.

2.4 Scope
Duration: The project was developed between 08/12/2025 and 10/01/2026.

Target Users: IT Managers and System Administrators at BSPTCL.

Technology: Web-based (Accessible via Intranet).

--- [PAGE BREAK] ---

CHAPTER 3: TECHNOLOGY STACK
To ensure the application was modern, scalable, and efficient, the following "Full Stack" technologies were selected:

3.1 Frontend: React 19 & TypeScript
React 19: Utilized for building the user interface. Its component-based architecture allows for reusable UI elements (like Tables and Forms).

TypeScript: Used to ensure type safety, reducing bugs during development.

Vite: Used as the build tool for faster compilation.

3.2 Backend: Node.js & Hono Framework
Node.js: A JavaScript runtime used to execute code on the server side.

Hono: A next-generation, ultrafast web framework chosen over Express.js for its low latency and superior performance.

3.3 Database: SQLite & Prisma ORM
SQLite: A lightweight, serverless database engine used for development simplicity.

Prisma ORM: An Object-Relational Mapper that allows interacting with the database using TypeScript instead of raw SQL queries, ensuring data integrity.

--- [PAGE BREAK] ---

CHAPTER 4: SYSTEM ANALYSIS & DESIGN
4.1 System Architecture
The system follows a Client-Server architecture. The Frontend (React) communicates with the Backend (Node/Hono) via secure REST API calls.

Client: Browser-based Interface (Chrome/Edge).

Server: REST API handling Logic & Authentication.

Database: Stores User info, Asset records, and Logs.

4.2 Database Design (ER Diagram)
The database consists of the following key tables:

Users: Stores Admin and Staff credentials (hashed).

Assets: Stores details like AssetID, Name, Type, PurchaseDate, Status.

Locations: Stores BSPHCL Office locations (e.g., "Vidyut Bhawan", "Grid Substation Vaishali").

Maintenance: Stores repair logs linked to Assets.

[Insert Entity-Relationship Diagram Here] (You can draw a simple diagram showing boxes for User, Asset, and Location connected by lines)

4.3 Operational Workflow
Admin Login: The IT Manager logs in using secure credentials.

Dashboard: Views a summary of Healthy vs. Faulty assets.

Asset Entry: Adds a new device (e.g., "Dell Server PowerEdge") and assigns it to a location.

Fault Reporting: If a device fails, the status is updated to "Under Maintenance".

--- [PAGE BREAK] ---

CHAPTER 5: IMPLEMENTATION
5.1 Project Structure
The code is organized into a modular structure to ensure maintainability.

/InfraMonitor-BSPHCL
├── /client (Frontend)
│   ├── /src/components  (Buttons, Tables)
│   ├── /src/pages       (Dashboard, Login)
│   └── package.json
├── /server (Backend)
│   ├── /src/routes      (API Endpoints)
│   ├── /prisma          (Database Schema)
│   └── server.ts
5.2 Key Code Snippets
Backend: Asset Creation Route (Hono)

TypeScript

app.post('/api/assets', async (c) => {
  const body = await c.req.json();
  const newAsset = await prisma.asset.create({
    data: {
      name: body.name,
      serialNumber: body.serialNumber,
      locationId: body.locationId,
      status: 'OPERATIONAL'
    }
  });
  return c.json(newAsset);
});
Frontend: Asset Fetching Hook (React)

TypeScript

useEffect(() => {
  fetch('/api/assets')
    .then(res => res.json())
    .then(data => setAssets(data));
}, []);
--- [PAGE BREAK] ---

CHAPTER 6: RESULTS & SCREENSHOTS
(Note: In your final printout, you must paste screenshots of your project here. If you don't have the code running, create simple UI designs in Paint or Figma and paste them.)

6.1 Login Page
[Insert Screenshot of Login Screen] Description: Secure login page requiring Employee ID and Password. Only authorized IT staff from BSPHCL can access the system.

6.2 Admin Dashboard
[Insert Screenshot of Dashboard] Description: The main landing page showing the total count of assets (Computers, Printers, Network Gear) across all BSPHCL offices.

6.3 Asset Registry
[Insert Screenshot of Table View] Description: A searchable list of all assets. It includes columns for Serial Number, Model, Assigned Location, and Current Status.

6.4 Maintenance Log
[Insert Screenshot of Maintenance Form] Description: A form used to report faulty hardware. It records the date of failure and the technician assigned to fix it.

--- [PAGE BREAK] ---

CHAPTER 7: CONCLUSION & FUTURE SCOPE
7.1 Conclusion
The 4-week industrial training at Bihar State Power (Holding) Company Limited (BSPHCL) was a transformative experience. Working under the supervision of Smt. Preeti provided me with deep insights into how large-scale public sector enterprises manage their IT infrastructure.

The project "InfraMonitor" successfully demonstrated that moving from manual to digital asset management is feasible and highly beneficial. The system built using React and Node.js is fast, secure, and user-friendly.

7.2 Key Learnings
Corporate Workflow: Understanding how IT requirements flow from various departments (Generation, Transmission) to the IT cell.

Full Stack Development: Gained hands-on experience in connecting a Frontend to a Backend API.

Database Management: Learned the importance of data integrity when handling official records.

7.3 Future Scope
This project can be further enhanced by:

QR Code Integration: Pasting QR codes on physical assets (CPU/Monitors) for instant scanning.

Mobile App: Creating an Android app for field engineers visiting Grid Substations.