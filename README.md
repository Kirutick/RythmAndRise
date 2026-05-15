# Landing Page for Wellness Brand

  This is a code bundle for Landing Page for Wellness Brand. The original project is available at https://www.figma.com/design/WLhy33tIHSV7FbGb0WrcvR/Landing-Page-for-Wellness-Brand.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Rhythm & Rise

## Secure OTP Authentication Setup

This project now includes a secure multi-step authentication system with SMS OTP.

### Backend Setup (Server)

1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your Twilio credentials.
4. Start the server: `npm run dev`

### Frontend Setup

1. The frontend calls the API at `http://localhost:5000` (or as configured in `AuthService.ts`).
2. If running the frontend via Vite, ensure you update the `API_BASE` in `AuthService.ts` to the full URL or configure a proxy in `vite.config.ts`.