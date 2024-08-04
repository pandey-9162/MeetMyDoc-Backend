# Project
## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/yourrepository.git
    cd yourrepository
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root of your project with the following content:
    ```env
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
    TOKEN_PATH=token.json
    ```

4. Run the application:
    ```sh
    node app.js
    ```

5. Follow the console instructions to authorize the application. This will generate a `token.json` file in the root directory.

Make sure to keep your `token.json` file secure and do not commit it to your repository.
