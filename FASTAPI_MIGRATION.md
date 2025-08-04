# IoT Hub Frontend - FastAPI Migration

This frontend has been updated to work with a FastAPI backend instead of the original Flask backend.

## Changes Made

### 1. API Configuration
- Updated `src/config.ts` to use `/api/v1` prefix for FastAPI endpoints
- Created `src/lib/api.ts` for centralized API configuration with authentication

### 2. New Pages Added
- **LoginPage** (`/login`) - User authentication
- **UsersPage** (`/users`) - User management
- **OrganisationsPage** (`/organisations`) - Organisation management

### 3. Updated API Endpoints

#### Authentication
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout

#### Users & Organizations
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{user_id}` - Get specific user
- `GET /api/v1/organisations` - Get all organisations
- `POST /api/v1/organisations` - Create organisation
- `GET /api/v1/organisations/{org_id}` - Get specific organisation

#### Devices
- `GET /api/v1/device` - Get all devices (was `/get_devices`)
- `POST /api/v1/device` - Create device (was `/adddevice`)
- `GET /api/v1/device/{deviceID}` - Get specific device (was `/get_device/{deviceID}`)
- `PUT /api/v1/device/{deviceID}` - Update device
- `POST /api/v1/device/{deviceID}/update_firmware` - Update device firmware

#### Profiles
- `GET /api/v1/profiles` - Get all profiles (was `/get_profiles`)
- `POST /api/v1/profiles` - Create profile (was `/addprofile`)
- `GET /api/v1/profiles/{profile_id}` - Get specific profile (was `/get_profile/{profile_id}`)

#### Firmware
- `GET /api/v1/firmware` - List firmware (was `/firmware/display`)
- `POST /api/v1/firmware/upload` - Upload firmware (was `/firmwareupload`)
- `GET /api/v1/firmware/{firmware_id}` - Get firmware details
- `GET /api/v1/firmware/{firmware_id}/download/{file_type}` - Download firmware

#### Device Data & Configuration
- `POST /api/v1/device_data/update` - Update device data (was `/update_device_data`)
- `POST /api/v1/config/update` - Update config data (was `/update_config_data`)
- `POST /api/v1/config/mass_edit` - Mass edit config (was `/mass_edit_config_data`)
- `GET /api/v1/config/{deviceID}` - Get config data

### 4. Data Structure Changes

#### Device Interface
- `id`: Now UUID string (was number)
- `deviceID`: Now number (was string)
- `profile`: Now UUID string (was number)
- Added: `readkey`, `writekey`, `fileDownloadState`
- Properties are now nullable where appropriate

#### Profile Interface
- `id`: Now UUID string (was number)
- Added: `organisation_id` (UUID)
- `fields`, `configs`, `metadata`: Now nullable objects
- Added: `device_count`, `devices` array

#### Firmware Interface
- `id`: Now UUID string (was number)
- `firmware_version`: Renamed from `firmwareVersion`
- `firmware_type`: Now enum with specific values
- Changes now individual fields (`change1` to `change10`) instead of `changes` object
- Added: `organisation_id`

### 5. Navigation Updates
- Added Users and Organisations to sidebar navigation
- Updated routing in `App.tsx`
- Added logout functionality to header

### 6. Authentication
- Added token-based authentication
- Login/logout functionality
- Auth token stored in localStorage
- Automatic redirect to login on 401 errors

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The frontend will be available at `http://localhost:3000`

## FastAPI Backend Requirements

The FastAPI backend should be running on `http://localhost:8000` with the following characteristics:

- API endpoints prefixed with `/api/v1`
- CORS enabled for frontend domain
- Authentication via Bearer tokens
- OpenAPI documentation available at `/docs`

## Key Features

- **User Management**: Create and manage user accounts
- **Organization Management**: Handle multiple organizations
- **Device Management**: Add, configure, and monitor IoT devices
- **Profile Management**: Device profiles with configurable fields
- **Firmware Management**: Upload and manage firmware versions
- **Authentication**: Secure login/logout with token management
- **Real-time Data**: Device status monitoring and data visualization

## Notes

- Dashboard summary is now constructed from individual API calls (devices, profiles, firmware) since no dedicated dashboard endpoint exists in FastAPI
- All form submissions now use JSON instead of FormData where applicable
- Error handling updated to use FastAPI's `detail` field instead of `message`
- UUID fields are properly handled throughout the application
