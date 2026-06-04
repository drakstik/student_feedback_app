To better understand this project, you can divide it into two components:

1. Student & Teacher Module
2. Sentiment Analyzer


# Student & Teacher Module
The student & teacher module is a web application built using the nodejs + Typescript + svelte languages and follows a modern frontend-backend architecture for deployment.

This application leverages:
- Podman for containerization, 
- Nginx as a reverse proxy,
- Redis as a session-store and
- Postgres as a database.

Key node packages used are: 
- `express` node package for the API and session management, and
- `sequelize` as an ORM.

This app only allows students to post comments and view their own comment history, and allows teachers to view the report file and all the comments.

Much of the logic is simplified to prove this concept as a case study and therefor this app is not ready for production. However, much logic goes into building this application with good industry standard practices and security in mind.


# Sentiment Analyzer
The sentiment analysis is done by a python script, triggered by a teacher running an analysis report. The python script reads from a .CSV file of feedback comments and uses a machine learning model to create a report .CSV file.
