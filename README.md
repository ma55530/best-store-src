# Best Store

The source code of my demo webshop project.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
4. Update the `.env` file with your configuration
5. Start the development server:
```bash
npm start
```

## Environment Variables

- `REACT_APP_WEBAPI_URL`: URL of the backend API

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Security Notes

- Never commit `.env` files
- Keep API keys and secrets in environment variables
- Regularly update dependencies
