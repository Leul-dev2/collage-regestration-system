

Online Student Registration System — AAU, CoSc3311
Page 1 of 23
## Addis Ababa University
Department of Computer Science
## A Course Project
## Semester 2, Year 2026
Course Title: Introduction to Software Engineering  |  Course Code: CoSc3311
Online Registration System for
## Students
Submitted by:
Aklesiya Yonas  nse///14
Dagmawi Alemayehu   nse//14
Feben Kassa     nse//14
Leul seyoum  nse/4606/14
Submitted to:
## Dr. Dagmawi
## 25 / 05 / 2026
## Addis Ababa, Ethiopia


Online Student Registration System — AAU, CoSc3311
Page 2 of 23
Table of Contents
Table of Contents .................................................................................................................. 2
- General Information .......................................................................................................... 4
1.1 Purpose of the System ................................................................................................ 4
1.2 Objectives of the Project .............................................................................................. 4
1.3 Scope of the System.................................................................................................... 4
1.4 Definitions, Acronyms, and Abbreviations .................................................................... 4
- Existing System ................................................................................................................ 6
2.1 Organization of the Existing System ............................................................................ 6
2.1.1 Admission Office ................................................................................................... 6
2.2 Identified Problems ...................................................................................................... 6
Major Problems in the Existing System .......................................................................... 7
- Proposed System .............................................................................................................. 8
3.1 Overview ..................................................................................................................... 8
3.2 Product Backlog .......................................................................................................... 8
3.3 Functional Requirements ............................................................................................. 9
3.4 Non-Functional Requirements ................................................................................... 10
3.4.1 Business Rules ................................................................................................... 10
3.4.2 User Interface and Human Factors ..................................................................... 10
3.4.3 Documentation .................................................................................................... 10
3.4.4 Performance Characteristics ............................................................................... 11
3.4.5 Security Issues .................................................................................................... 11
3.4.6 Error Handling and Extreme Conditions .............................................................. 11
3.4.7 Quality Issues ..................................................................................................... 11
- System Model ................................................................................................................. 12
4.1 Identified Actors ......................................................................................................... 12
4.2 Functional Model ....................................................................................................... 12
Use Case Diagram ....................................................................................................... 12
Mapping Epics to Use Cases ....................................................................................... 13
4.3 Identified Use Cases.................................................................................................. 13
UC-001: Search College .............................................................................................. 13
UC-002: Search Program ............................................................................................. 14
UC-003: View Program Details .................................................................................... 14
UC-004: Register Student ............................................................................................ 14
UC-005: Upload Documents ........................................................................................ 15
UC-006: Make Payment ............................................................................................... 16
UC-007: Verify Application ........................................................................................... 16
UC-008: Approve / Reject Application .......................................................................... 17
UC-009: Track Application Status ................................................................................ 17

Online Student Registration System — AAU, CoSc3311
Page 3 of 23
UC-010: Manage Colleges & Programs ....................................................................... 17
4.4 Dynamic Model — Sequence Diagram ...................................................................... 19
4.5 Static Model — Class Diagram .................................................................................. 20
Class Descriptions and Relationships .......................................................................... 20
Key Relationships ........................................................................................................ 21
References ......................................................................................................................... 22
Annex ................................................................................................................................. 23
Annex 1: Sample Application Form Fields ....................................................................... 23
Annex 2: Clearance / Confirmation Form Fields .............................................................. 23



Online Student Registration System — AAU, CoSc3311
Page 4 of 23
## 1. General Information
1.1 Purpose of the System
The purpose of the Online Student Registration System is to provide a digital platform that
enables students to search for colleges, explore available academic programs, and complete
the registration process remotely. The system is designed to reduce the need for physical
visits to multiple institutions by allowing students to access information, submit required
documents, and complete registration procedures online in an efficient and user-friendly
manner.
1.2 Objectives of the Project
The specific objectives of this project are:
- To develop an online system that allows students to easily search for colleges and
available programs.
- To enable students to register for their chosen programs without needing to visit
colleges physically.
- To provide a platform for uploading required documents in PDF format during the
application process.
- To streamline the registration process by integrating fee submission and verification
mechanisms.
- To reduce time, cost, and effort for both students and educational institutions.
- To improve accessibility to higher education opportunities by centralizing information
in one system.
1.3 Scope of the System
The Online Student Registration System will cover the following functionalities:
- Listing and searching of colleges and academic programs.
- Viewing detailed information about programs offered by different colleges.
- Online student registration and application submission.
- Uploading of required documents (e.g., certificates, identification) in PDF format.
- Fee submission and registration verification process.
- Notification or confirmation of successful registration.

The system will be accessible via the internet and is intended for use by students and
participating colleges. However, it does not include in-person academic activities, classroom
management, or post-registration academic services.
1.4 Definitions, Acronyms, and Abbreviations
## Term Definition
System The Online Student Registration System being developed.
User Any individual interacting with the system (primarily students and
administrators).
Registration The process of applying and enrolling in a college program through the system.
PDF Portable Document Format — a file format used by students to upload required
documents.

Online Student Registration System — AAU, CoSc3311
Page 5 of 23
Verification The process of confirming the accuracy of submitted information and
documents.
Admin The system administrator responsible for managing the platform, colleges, and
applications.
Program A specific course or field of study offered by a college.
Database The structured collection of data used to store student, college, and program
information.
SRS Software Requirements Specification — this document.
UC Use Case.
FR Functional Requirement.
NFR Non-Functional Requirement.



Online Student Registration System — AAU, CoSc3311
Page 6 of 23
## 2. Existing System
2.1 Organization of the Existing System
The current student registration process is primarily manual and decentralized. Students are
required to physically visit different colleges to gather information about available programs,
admission requirements, and registration procedures. Each institution operates
independently, with its own registration offices, documentation processes, and payment
systems.
The system typically involves multiple departments within a college, each responsible for a
specific part of the registration process. These departments include the Admission Office,
Finance Office, and Registrar Office. Communication between these departments is often
not integrated digitally, leading to inefficiencies and delays.
## 2.1.1 Admission Office
The Admission Office is responsible for providing information about available programs,
admission requirements, and application procedures. Staff members guide students,
distribute application forms, and perform initial screening of submitted documents.
## Actors:
## • Admission Officer (e.g., Mr. Bekele)
- Student (Applicant)
## Use Cases:
- Provide program information
- Distribute application forms
- Receive and check submitted documents
## Forms / Data Used:
- Application forms (paper-based)
- Student academic documents (certificates, transcripts)
## Business Rules:
- Students must meet minimum academic requirements to apply.
- All required documents must be submitted before application review.
## 2.2 Identified Problems
The existing system relies heavily on manual processes and physical interactions. Students
must travel to different colleges to collect information, submit applications, and complete
registration. Each department handles its tasks separately, resulting in fragmented
workflows and a lack of centralized data management.
## Actor Role Responsibility
## Admission Officer
Information Provider Provide program details, distribute
application forms, perform preliminary
document verification.
## Finance Office
Payment Processor Collect registration and application fees,
issue payment receipts, verify payment
status.
## Registrar Office
Record Keeper Confirm registration, maintain student
enrollment records, issue registration
certificates.

Online Student Registration System — AAU, CoSc3311
Page 7 of 23
## Student
Primary User Search for available colleges and
programs, prepare and submit required
documents in PDF format.

Major Problems in the Existing System
- Time-consuming process due to physical movement between departments and
colleges.
- High cost for students traveling to multiple institutions.
- Lack of centralized information about colleges and programs.
- Poor communication and coordination between departments.
- Risk of document loss due to paper-based storage.
- Inability to track application status in real time.
- Limited accessibility for students living far from colleges.


Online Student Registration System — AAU, CoSc3311
Page 8 of 23
## 3. Proposed System
## 3.1 Overview
The proposed Online Student Registration System is a centralized, web-based platform
designed to modernize and streamline the student admission and registration process.
Unlike the existing manual system, the new system enables students to search for colleges
and academic programs, apply online, upload required documents, and complete
registration without physically visiting institutions.
The system introduces the following key features:
- Centralized database of colleges and programs
- Online application and registration process
- Digital document upload (PDF format)
- Integrated fee submission and verification
- Automated registration confirmation and notifications
- Role-based access control for students and administrators

This system improves efficiency, reduces time and cost, enhances accessibility, and
provides a transparent and traceable registration process for all stakeholders.
## 3.2 Product Backlog
US ID User Story Priority
## Story
## Pts
## Sprint Epic Acceptance Criteria
## US-
## 001
As a Student, I
want to search for
colleges so that I
can find suitable
institutions.
High 3 1 EP-001 Colleges returned matching
search criteria
## US-
## 002
As a Student, I
want to search for
academic
programs so that I
can choose my
preferred field of
study.
High 3 1 EP-001 Programs filtered by college
and field
## US-
## 003
As a Student, I
want to view
detailed program
information so that
I can make
informed decisions.
High 2 1 EP-001 Full program details
displayed
## US-
## 004
As a Student, I
want to register
online so that I do
not need to visit
colleges physically.
High 5 1 EP-002 Application is successfully
submitted
## US-
## 005
As a Student, I
want to upload
required
documents in PDF
High 3 1 EP-002 Documents uploaded and
validated

Online Student Registration System — AAU, CoSc3311
Page 9 of 23
format so that my
application can be
processed.
## US-
## 006
As a Student, I
want to pay
registration fees
online so that I can
complete my
application.
High 4 2 EP-002 Payment confirmed and
linked to application
## US-
## 007
As an Admin, I
want to verify
student
applications so that
only valid
registrations are
approved.
High 4 2 EP-003 Applications reviewed within
72 hours
## US-
## 008
As an Admin, I
want to manage
colleges and
programs so that
the system stays
updated.
Medium 3 2 EP-004 CRUD operations
successful for
colleges/programs
## US-
## 009
As a Student, I
want to track my
application status
so that I know
where I stand.
Medium 2 2 EP-003 Status
## (pending/approved/rejected)
visible
## US-
## 010
As a Student, I
want to receive
email notifications
so that I am
informed about my
application.
Medium 2 3 EP-003 Email sent on status
change

## 3.3 Functional Requirements
Each requirement is uniquely identified and derived from the problems identified in the
existing system.
ID Requirement Description
## FR-01
The system shall allow students to search for colleges using criteria such as name,
location, and program availability.
## FR-02
The system shall allow students to view detailed information about programs, including
program name, duration, requirements, and fees.
## FR-03
The system shall allow students to create an account and log in securely using a
username and password.
## FR-04
The system shall allow students to complete and submit an online registration form
including personal and academic information.
## FR-05
The system shall allow students to upload required documents in PDF format (e.g.,
certificates, transcripts, identification).

Online Student Registration System — AAU, CoSc3311
Page 10 of 23
## FR-06
The system shall validate uploaded documents to ensure they meet format and size
requirements.
## FR-07
The system shall allow students to submit proof of payment or complete fee payment
through the system.
## FR-08
The system shall record payment details including amount, date, and transaction
reference number.
## FR-09
The system shall allow administrators to review and verify student applications and
documents.
## FR-10
The system shall approve or reject applications based on verification results and notify
students accordingly.
## FR-11
The system shall send automated notifications to students about their application status
(Approved / Rejected / Pending).
## FR-12
The system shall generate a registration confirmation document for approved students.
## FR-13
The system shall maintain a database of all students, colleges, programs, and
applications.
## FR-14
The system shall allow administrators to add, update, and delete college and program
information.

3.4 Non-Functional Requirements
## 3.4.1 Business Rules
- A student shall upload all required documents in PDF format before submission is
considered complete.
- A student application shall only be considered valid after successful fee payment
confirmation.
- If a student submits an application without complete documents, the system shall
mark the application as incomplete.
- An application shall be verified by an administrator within 72 hours of submission.
- A student shall not submit multiple applications to the same program at the same
college.
- Once an application is approved, the system shall generate a registration
confirmation and prevent duplicate registration.
- Payment records shall be linked uniquely to a specific student application.
3.4.2 User Interface and Human Factors
- Users shall access the system using a standard web browser without installing
additional software.
- The system interface shall display clear navigation menus for searching colleges,
applying, and tracking status.
- The system shall provide descriptive error messages when invalid data is entered.
- The system shall support simple and understandable language for users with basic
computer skills.
- The system shall be responsive, allowing access from both desktop and mobile
devices.
## 3.4.3 Documentation
- Each development phase shall be documented with a version number and date.

Online Student Registration System — AAU, CoSc3311
Page 11 of 23
- The system shall include user documentation describing how students can register
and apply.
- Technical documentation shall be maintained for developers, including system
architecture and database design.
- All changes and updates to the system shall be recorded in a change log document.
## 3.4.4 Performance Characteristics
- The system shall respond to user requests within 2 seconds under normal load.
- The system shall support at least 500 concurrent users without degradation in
performance.
- Document uploads shall not exceed 10 MB per file.
## 3.4.5 Security Issues
- All data transmitted between the client and server shall be encrypted using
## HTTPS/TLS.
- User passwords shall be stored as hashed values using a secure algorithm (e.g.,
bcrypt).
- The system shall implement role-based access control to restrict unauthorized
access.
- Session tokens shall expire after 30 minutes of inactivity.
3.4.6 Error Handling and Extreme Conditions
- The system shall display user-friendly error messages in case of server errors or
invalid input.
- In the event of a payment failure, the system shall not process the application and
shall notify the student.
- The system shall automatically back up data every 24 hours.
## 3.4.7 Quality Issues
- The system shall achieve at least 99% uptime during the registration period.
- All critical paths (registration, payment, document upload) shall be covered by
automated tests.


Online Student Registration System — AAU, CoSc3311
Page 12 of 23
## 4. System Model
## 4.1 Identified Actors
## Actor Description
Student (Primary Actor)
The main user of the system. Searches for colleges and programs,
submits applications, uploads documents, makes payments, and tracks
application status.
Admin (System
## Administrator)
Manages the overall system, verifies submitted applications, approves
or rejects registrations, and maintains system data (colleges,
programs).
Finance Office (External
## Actor)
An external department responsible for processing student payments,
issuing receipts, and confirming payment status.
Registrar Office (External
## Actor)
An external office responsible for confirming final registration,
maintaining official student enrollment records, and issuing
confirmation documents.

## 4.2 Functional Model
## Use Case Diagram
The following diagram illustrates the key actors and their interactions with the Online Student
## Registration System.

## Figure 1: Use Case Diagram — Online Student Registration System

Online Student Registration System — AAU, CoSc3311
Page 13 of 23

Mapping Epics to Use Cases
UC ID Use Case Name Epic Description
## UC-001
Search College EP-001 Students search and view available colleges
by name, location, and program.
## UC-002
Search Program EP-001 Students search and view academic programs
offered by colleges.
## UC-003
View Program Details EP-001 Displays detailed information about a selected
program.
## UC-004
Register Student EP-002 Students fill in and submit the online
registration form.
## UC-005
Upload Documents EP-002 Students upload required documents in PDF
format.
## UC-006
Make Payment EP-002 Students pay registration fees through the
integrated payment module.
## UC-007
Verify Application EP-003 Admin reviews and verifies student-submitted
applications.
## UC-008
Approve/Reject
## Application
EP-003 Admin makes the final decision on each
application.
## UC-009
Track Application Status EP-003 Students check the current status of their
application.
## UC-010
## Manage Colleges &
## Programs
EP-004 Admin updates college and program data in
the system.

## 4.3 Identified Use Cases
UC-001: Search College
Use Case ID
## UC-001
## Name
## Search College
## Primary Actor
## Student
## Goal
Find a suitable college to apply to
## Precondition
Student is logged into the system
## Postcondition
A list of colleges matching the search criteria is displayed
## Main Flow
- Student navigates to the Search College page.
- Student enters search criteria (name, location, program).
- System queries the database and retrieves matching colleges.
- System displays a list of colleges with summary information.
- Student selects a college to view more details.
## Alternative Flow
3a. No matching colleges found — system displays a "No results found"
message.
## Related User Stories
## US-001, US-003

Online Student Registration System — AAU, CoSc3311
Page 14 of 23
## Priority
## High

UC-002: Search Program
Use Case ID
## UC-002
## Name
## Search Program
## Primary Actor
## Student
## Goal
Browse and select an academic program
## Precondition
Student is logged in; at least one college is selected or browsed
## Postcondition
A list of programs matching the student's query is displayed
## Main Flow
- Student selects a college or goes to the Programs section.
- Student enters a search keyword or selects a field of study.
- System retrieves matching programs from the database.
- System displays programs with name, duration, and requirements.
- Student selects a program to view full details.
## Alternative Flow
3a. No programs match the query — system suggests related programs or
displays an empty state.
## Related User Stories
## US-002, US-003
## Priority
## High

UC-003: View Program Details
Use Case ID
## UC-003
## Name
## View Program Details
## Primary Actor
## Student
## Goal
Obtain detailed information about a program before applying
## Precondition
Student has found a program via search
## Postcondition
Full program details are displayed to the student
## Main Flow
- Student clicks on a program from the search results.
- System fetches full program details from the database.
- System displays program name, duration, requirements, fees, and
deadlines.
- Student decides to apply or return to search.
## Alternative Flow
2a. Program data is unavailable — system shows an error and invites the
student to try again.
## Related User Stories
## US-003
## Priority
## High

UC-004: Register Student

Online Student Registration System — AAU, CoSc3311
Page 15 of 23
Use Case ID
## UC-004
## Name
## Register Student
## Primary Actor
## Student
## Goal
Submit a complete online application for a selected program
## Precondition
Student must have a system account and must have selected a program
## Postcondition
Student application is stored in the system with status "Pending"
## Main Flow
- Student logs into the system.
- Student selects a college and program.
- Student fills in the registration form (personal and academic information).
- Student uploads required documents (see UC-005).
- Student reviews the completed application.
- Student submits the application.
- System validates all fields and documents.
- System saves the application and returns an Application ID.
## Alternative Flow
7a. Validation fails — system highlights missing or invalid fields and requests
correction.
7b. Duplicate application detected — system notifies the student and prevents
submission.
## Related User Stories
## US-004, US-005
## Priority
## High

UC-005: Upload Documents
Use Case ID
## UC-005
## Name
## Upload Documents
## Primary Actor
## Student
## Goal
Attach required supporting documents to the application
## Precondition
Student has started or is completing the registration form (UC-004)
## Postcondition
Documents are securely stored and linked to the student's application
## Main Flow
- Student navigates to the Document Upload section of the form.
- Student selects files to upload (PDF format only).
- System validates each file (format: PDF, size: max 10 MB).
- System uploads and stores the documents, linking them to the application.
- System confirms successful upload with a file name and timestamp.
## Alternative Flow
3a. File is not in PDF format — system rejects the file and prompts the
student to convert it.
3b. File exceeds 10 MB — system notifies the student to reduce the file size.
## Related User Stories
## US-005
## Priority
## High


Online Student Registration System — AAU, CoSc3311
Page 16 of 23
UC-006: Make Payment
Use Case ID
## UC-006
## Name
## Make Payment
## Primary Actor
## Student / Finance Office
## Goal
Complete the registration fee payment
## Precondition
Application has been submitted; payment is required to proceed
## Postcondition
Payment is confirmed and linked to the student's application; application
moves to "Under Review"
## Main Flow
- Student navigates to the Payment section.
- System displays the registration fee amount.
- Student selects a payment method (e.g., bank transfer, mobile payment).
- Student submits payment details.
- Payment System processes the transaction.
- Payment System sends a confirmation to the Registration System.
- System records the payment and updates the application status.
- System sends a payment receipt to the student via email.
## Alternative Flow
5a. Payment fails — system notifies the student and provides an option to
retry.
6a. Payment confirmation is delayed — application remains in "Pending
Payment" status.
## Related User Stories
## US-006
## Priority
## High

UC-007: Verify Application
Use Case ID
## UC-007
## Name
## Verify Application
## Primary Actor
## Admin
## Goal
Review and verify a submitted student application
## Precondition
An application with status "Under Review" exists in the system
## Postcondition
Application is either approved or rejected; student is notified
## Main Flow
- Admin logs into the system.
- Admin views the list of applications under review.
- Admin selects an application.
- System displays application details, uploaded documents, and payment
confirmation.
- Admin checks documents for completeness and accuracy.
- Admin checks payment confirmation.
- Admin approves or rejects the application (UC-008).
## Alternative Flow
5a. Documents are incomplete — Admin marks the application as
"Incomplete" and sends a request for resubmission.
6a. Payment not confirmed — Admin places the application on hold.

Online Student Registration System — AAU, CoSc3311
Page 17 of 23
## Related User Stories
## US-007
## Priority
## High

UC-008: Approve / Reject Application
Use Case ID
## UC-008
## Name
## Approve / Reject Application
## Primary Actor
## Admin
## Goal
Make a final decision on a reviewed application
## Precondition
Admin has reviewed the application (UC-007)
## Postcondition
Application status is updated; student receives an email notification
## Main Flow
- Admin clicks "Approve" or "Reject".
- System updates the application status accordingly.
- If approved: System generates a Registration Confirmation document.
- System sends an email notification to the student with the decision.
- If approved: Registrar Office is notified to finalize enrollment.
## Alternative Flow
1a. Admin adds a rejection reason — System includes the reason in the
notification email.
## Related User Stories
## US-007
## Priority
## High

UC-009: Track Application Status
Use Case ID
## UC-009
## Name
## Track Application Status
## Primary Actor
## Student
## Goal
Monitor the progress of a submitted application
## Precondition
Student has submitted at least one application
## Postcondition
Current application status and history are displayed
## Main Flow
- Student logs in and navigates to "My Applications".
- System retrieves and displays all applications with their current status.
- Student selects an application to view detailed status and history.
- System displays a timeline of status changes with timestamps.
## Alternative Flow
2a. No applications found — System displays a message and prompts the
student to apply.
## Related User Stories
## US-009, US-010
## Priority
## Medium

UC-010: Manage Colleges & Programs

Online Student Registration System — AAU, CoSc3311
Page 18 of 23
Use Case ID
## UC-010
## Name
## Manage Colleges & Programs
## Primary Actor
## Admin
## Goal
Add, update, or remove college and program information
## Precondition
Admin is logged in with administrator privileges
## Postcondition
College and program data is updated in the system database
## Main Flow
- Admin navigates to the College & Program Management section.
- Admin selects an operation: Add, Edit, or Delete.
- Admin fills in or updates the required details.
- System validates the entered data.
- System saves the changes and confirms the operation.
## Alternative Flow
4a. Validation fails — System highlights missing fields.
2a. Delete is requested for a college that has active applications — System
prevents deletion and notifies Admin.
## Related User Stories
## US-008
## Priority
## Medium



Online Student Registration System — AAU, CoSc3311
Page 19 of 23
## 4.4 Dynamic Model — Sequence Diagram
The sequence diagram below illustrates the interaction between the Student, the
Registration System, the Database, the Payment System, and the Admin during the
complete registration process.

## Figure 2: Sequence Diagram — Student Registration Process


Online Student Registration System — AAU, CoSc3311
Page 20 of 23
## 4.5 Static Model — Class Diagram
The class diagram below defines the main entity classes, their attributes, methods, and the
relationships between them.

## Figure 3: Class Diagram — Online Student Registration System

Class Descriptions and Relationships
## Class Type Participating In
## Student
## Entity Register, Apply, Track Status, Upload Documents, Make
## Payment
## Application
Entity Registration Process, Verification, Approval/Rejection
## College
## Entity Search College, Manage Colleges & Programs
## Program
## Entity Search Program, View Program Details
## Payment
## Entity Payment Processing, Registration Confirmation
## Document
## Entity Document Upload, Application Verification
## Admin
Control Verification, Approval/Rejection, Manage Colleges &
## Programs
## Notification
## Entity Status Notification, Payment Receipt, Confirmation
## Email
RegistrationForm
## Boundary Register Student Use Case

Online Student Registration System — AAU, CoSc3311
Page 21 of 23
DocumentUpload
## Boundary Upload Documents Use Case

## Key Relationships
- A Student submits one or more Applications (1 to many).
- Each Application is linked to one Program and one College.
- Each Application requires one Payment and one or more Documents.
- An Admin verifies and approves or rejects Applications.
- A Notification is sent to the Student upon each status change.
- Each Program belongs to a specific College.


Online Student Registration System — AAU, CoSc3311
Page 22 of 23
## References
- Sommerville, I. (2016). Software Engineering (10th ed.). Pearson.
- Pressman, R. S., & Maxim, B. R. (2015). Software Engineering: A Practitioner's Approach
(8th ed.). McGraw-Hill.
- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements
## Specifications.
- Addis Ababa University, Department of Computer Science. CoSc3311 Course Handout,
## 2026.


Online Student Registration System — AAU, CoSc3311
Page 23 of 23
## Annex
## Annex 1: Sample Application Form Fields
## Field Description
## Full Name
Text field — student's full legal name
Date of Birth
Date picker
## Email Address
Text field — validated email format
## Phone Number
Text field — numeric, 10–15 digits
## Previous Education
Dropdown — secondary, diploma, degree
## College
Dropdown — populated from the database
## Program
Dropdown — filtered by selected college
## Document Upload
File input — PDF only, max 10 MB
## Payment Reference
Text field — bank transaction number

## Annex 2: Clearance / Confirmation Form Fields
## Field Value / Source
Application ID
Auto-generated by the system
## Student Full Name
From registration record
## College
Name of the approved college
## Program
Name of the approved program
## Approval Date
Date of admin approval
## Payment Confirmation No
From the payment record
## Admin Signature
Electronic approval stamp
