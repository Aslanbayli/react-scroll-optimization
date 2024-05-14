# Custom React Scroll Optimization

## Description
This is a custom React hook that optimizes the scroll event listener for performance. It uses the Intersection Observer API to determine if the user is scrolling up or down and then calls the appropriate callback function. This is useful for implementing infinite scrolling or lazy loading in a React application.

## How to use
==Note you need to have Go and Node.js installed on your machine before you proceed== 
1. Clone the repository
2. Setup a local database
    - This project uses PostgreSQL as the database. The database connection URL is located in the `server/.env` file. Change it to your own database URL.
3. Start the server
    - open a new terminal window
    - navigate to the `server` directory and run `go run main.go`
        ```bash
        cd server
        go run main.go
        ```
    - alternatively you can run `go build main.go` to build the binary and then run `./main` to start the server
4. Start the client
    - navigate to the `client` directory and run `npm install` to install the dependencies
    - run `npm run dev` to start the development server
        ```bash
        cd client
        npm install
        npm run dev
        ```
5. Open your browser and navigate to `http://localhost:5714` to see the app in action