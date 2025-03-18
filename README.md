# Student Productivity Hub

A comprehensive productivity application for students with calendar, to-do list, and school binder features.

## Features

### Calendar
- View monthly calendar
- Add and manage events
- View upcoming events

### To-Do List
- Add, edit, and delete tasks
- Set priority levels (low, medium, high)
- Set due dates
- Filter tasks by status (all, active, completed)

### School Binder
- Create and manage subjects
- Take and save notes for each subject
- Upload and manage documents
- Track exam scores and view grade averages

## Technical Implementation

This is a frontend-only implementation using HTML, CSS, and JavaScript. In a real-world scenario, this would connect to a Java backend for data persistence and additional functionality.

### Frontend (Current Implementation)
- HTML for structure
- CSS for styling
- JavaScript for interactivity
- LocalStorage for data persistence

### Backend (Not Implemented)
In a production environment, this application would use:
- Java for the backend logic
- Spring Boot for the web framework
- JPA/Hibernate for database interactions
- RESTful API endpoints for data exchange

## How to Use

1. Navigate between sections using the top navigation bar
2. Calendar:
   - Browse months using the arrow buttons
   - Click on a day to set the date for a new event
   - Add events using the form
   - Click on events to view details or delete them
3. To-Do List:
   - Add tasks with priority and due dates
   - Mark tasks as complete by checking the checkbox
   - Edit or delete tasks using the action buttons
   - Filter tasks using the filter buttons
4. School Binder:
   - Add subjects using the form
   - Select a subject to view its content
   - Use tabs to navigate between notes, documents, and grades
   - Take notes and save them
   - Upload documents (simulated)
   - Add exam scores and view your average

## Data Storage

All data is currently stored in the browser's localStorage. In a production environment, this data would be stored in a database and accessed through a Java backend API.