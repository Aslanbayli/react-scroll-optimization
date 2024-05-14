# Custom React Scroll Optimization

## Description
This is a high-performance React hook that provides an optimized infinite scrolling experience. It features a debounced search bar that waits for the user to finish typing before making the search request, preventing unnecessary API calls. Once the search is complete, the hook leverages lazy loading to render an infinite amount of data seamlessly, without any noticeable delays or lag. This is achieved through a efficient virtualization algorithm that only renders the visible portion of the data, resulting in superior performance even with large datasets. 

https://github.com/Aslanbayli/react-scroll-optimization/assets/48028559/19240c11-8fd2-40ac-9fad-596a4d02ff10

## How to use
⭐ *Note you need to have Go and Node.js installed on your machine before you proceed*
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
5. Open your browser and navigate to `http://localhost:5714` to see the app in action 🌐
