# IoT Hub Frontend

This is a modern React + TypeScript frontend for the IoT Hub system, designed to work with a FastAPI backend. It provides device, user, organization, profile, and firmware management for IoT deployments.

## Features

- **User Authentication** (login/logout)
- **User Management** (create, list users)
- **Organization Management** (create, list organizations)
- **Device Management** (add, view, update devices)
- **Profile Management** (create, view device profiles)
- **Firmware Management** (upload, list, download firmware)
- **Config & Data Management** (update device config/data)
- **Dashboard** (summary of devices, profiles, firmware)
- **Responsive UI** (mobile-friendly, modern design)

## Project Structure

```
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── config.ts
│   └── main.tsx
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Requirements

- FastAPI backend running at `http://localhost:8000`
- API endpoints prefixed with `/api/v1`
- CORS enabled for frontend domain
- JWT/Bearer token authentication
- OpenAPI docs at `/docs`

## Environment Variables

- The API base URL is set in `src/config.ts` and automatically switches for development/production.

## Key Endpoints Used

- `POST /api/v1/login` — Login
- `POST /api/v1/logout` — Logout
- `GET /api/v1/users` — List users
- `POST /api/v1/users` — Create user
- `GET /api/v1/organisations` — List organizations
- `POST /api/v1/organisations` — Create organization
- `GET /api/v1/device` — List devices
- `POST /api/v1/device` — Add device
- `GET /api/v1/profiles` — List profiles
- `POST /api/v1/profiles` — Create profile
- `GET /api/v1/firmware` — List firmware
- `POST /api/v1/firmware/upload` — Upload firmware
- `POST /api/v1/config/update` — Update device config

## Authentication

- Auth token is stored in `localStorage` after login
- All API requests include the token in the `Authorization` header
- Automatic redirect to `/login` on 401 errors

## Customization

- UI built with [Tailwind CSS](https://tailwindcss.com/)
- Component library in `src/components/ui/`
- Routing via [React Router](https://reactrouter.com/)
- Data fetching via [React Query](https://tanstack.com/query/latest)

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

MIT

---

For migration details and API mapping, see `FASTAPI_MIGRATION.md`.

npm install
npm run dev


For questions or support, open an issue or contact the [Gibson Oluka](http://github.com/OlukaGibson)
To reach me on other socials
[x.com](https://x.com/OlsGibson)
[youtube](https://www.youtube.com/@theemusicNmovies)
[insta](https://www.instagram.com/olsgibson/)