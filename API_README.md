# Sports Sicko API Documentation

## Overview
The Sports Sicko API provides RESTful endpoints for managing sports clubs, events, and tournaments. It supports both web and mobile applications with JSON responses.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### Health Check
**GET** `/api/health`
- Returns API status and version
- No authentication required

**Response:**
```json
{
  "success": true,
  "message": "Sports Sicko API is running",
  "timestamp": "2024-12-20T15:42:13.700Z",
  "version": "1.0.0"
}
```

---

## Clubs API

### Create Club
**POST** `/api/clubs/create`
- Creates a new club
- Requires authentication

**Request Body:**
```json
{
  "name": "Pickleball Maniacs",
  "sport": "Pickleball",
  "state": "TX",
  "city": "Austin",
  "location": "Sports Plex Court 4",
  "description": "A fun competitive club for all skill levels",
  "visibility": "public",
  "inviteMembers": ["user123", "user456"],
  "ownerId": "current-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Club created successfully",
  "clubId": "club_1234567890_abc123",
  "club": { ... }
}
```

### Get Club
**GET** `/api/clubs/:id`
- Get club details by ID
- Public for public clubs, requires authentication for private clubs

### Update Club
**PUT** `/api/clubs/:id`
- Update club details
- Requires authentication (owner only)

### Delete Club
**DELETE** `/api/clubs/:id`
- Delete a club
- Requires authentication (owner only)

### Search Clubs
**GET** `/api/clubs/search?sport=Pickleball&city=Austin`
- Search clubs by criteria
- Query parameters: sport, state, city, visibility, searchTerm

### Join Club
**POST** `/api/clubs/:id/join`
- Join a club
- Requires authentication

### Leave Club
**POST** `/api/clubs/:id/leave`
- Leave a club
- Requires authentication

---

## Events API

### Create Event
**POST** `/api/events/create`
- Creates a new event
- Requires authentication

**Request Body:**
```json
{
  "name": "Pickleball Double Round",
  "clubId": "club_123",
  "date": "2024-12-25",
  "time": "18:00",
  "location": "Sports Plex Court 4",
  "maxParticipants": 12,
  "type": "one-time",
  "description": "Fun competitive event",
  "calendarSync": true,
  "rsvpRequired": true,
  "hostId": "current-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "eventId": "event_1234567890_abc123",
  "event": { ... },
  "calendarFileUrl": "/downloads/calendar/event_123.ics"
}
```

### Get Event
**GET** `/api/events/:id`
- Get event details by ID

### Update Event
**PUT** `/api/events/:id`
- Update event details
- Requires authentication (host only)

### Cancel Event
**DELETE** `/api/events/:id`
- Cancel an event
- Requires authentication (host only)

### RSVP to Event
**POST** `/api/events/:id/rsvp`
- RSVP to an event
- Requires authentication

**Request Body:**
```json
{
  "status": "attending"
}
```
Status options: `attending`, `declined`, `maybe`

### Get Event RSVPs
**GET** `/api/events/:id/rsvps`
- Get all RSVPs for an event

### Get Club Events
**GET** `/api/events/club/:clubId?status=upcoming`
- Get all events for a club
- Optional status filter: `upcoming`, `active`, `completed`, `cancelled`

### Get User Calendar
**GET** `/api/events/calendar/:userId?startDate=2024-12-01&endDate=2024-12-31`
- Get calendar view of user's events
- Requires authentication

---

## Tournaments API

### Create Tournament
**POST** `/api/tournaments/create`
- Creates a new tournament
- Requires authentication

**Request Body:**
```json
{
  "name": "Summer Championship 2024",
  "bracketType": "single-elimination",
  "participants": 8,
  "pointsSystem": {
    "win": 3,
    "loss": 0,
    "draw": 1
  },
  "matchDuration": 60,
  "startDate": "2024-12-25",
  "prizePool": "$500 total prizes",
  "rules": "Tournament rules and regulations",
  "organizerId": "current-user-id"
}
```

Bracket types: `single-elimination`, `double-elimination`, `round-robin`

**Response:**
```json
{
  "success": true,
  "message": "Tournament created successfully",
  "tournamentId": "tournament_1234567890_abc123",
  "tournament": { ... }
}
```

### Get Tournament
**GET** `/api/tournaments/:id`
- Get tournament details by ID

### Update Tournament
**PUT** `/api/tournaments/:id`
- Update tournament details
- Requires authentication (organizer only)

### Register for Tournament
**POST** `/api/tournaments/:id/register`
- Register as a participant
- Requires authentication

**Request Body:**
```json
{
  "participantName": "Team Awesome",
  "teamMembers": ["player1", "player2"]
}
```

### Start Tournament
**POST** `/api/tournaments/:id/start`
- Start the tournament and generate first round matches
- Requires authentication (organizer only)

### Submit Match Result
**POST** `/api/tournaments/:id/matches/:matchId/result`
- Submit match result
- Requires authentication (organizer only)

**Request Body:**
```json
{
  "winnerId": "user_123",
  "score": "11-9",
  "stats": {
    "duration": 45,
    "notes": "Close match"
  }
}
```

### Get Tournament Bracket
**GET** `/api/tournaments/:id/bracket`
- Get current tournament bracket with all matches

### Get Tournament Standings
**GET** `/api/tournaments/:id/standings`
- Get current tournament standings

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": { ... }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting
- **Limit:** 100 requests per minute per IP address
- **Response:** 429 status code when limit exceeded

---

## Mobile Integration

### Headers
All mobile apps should include:
```
Content-Type: application/json
Authorization: Bearer <token>
User-Agent: SportsSicko-Mobile/1.0 (iOS/Android)
```

### Calendar Sync
When creating events with `calendarSync: true`, the API returns a `.ics` file URL that can be:
- Downloaded and imported to device calendar
- Opened with native calendar apps
- Synced with Google Calendar, Apple Calendar, etc.

### CORS Support
The API supports cross-origin requests from:
- Web applications (localhost, production domains)
- Mobile applications (no origin header required)
- Development tools (Postman, curl, etc.)

---

## Database Schema

### Clubs Collection
```javascript
{
  id: string,
  name: string,
  sport: string,
  state: string,
  city: string,
  location: string,
  description: string,
  visibility: 'public' | 'private',
  ownerId: string,
  members: string[],
  memberCount: number,
  events: string[],
  createdAt: ISO date string,
  updatedAt: ISO date string,
  status: 'active' | 'inactive'
}
```

### Events Collection
```javascript
{
  id: string,
  name: string,
  clubId: string,
  date: string,
  time: string,
  dateTime: ISO date string,
  location: string,
  maxParticipants: number,
  currentParticipants: number,
  type: 'one-time' | 'tournament',
  description: string,
  calendarSync: boolean,
  rsvpRequired: boolean,
  hostId: string,
  participants: string[],
  waitlist: string[],
  status: 'upcoming' | 'active' | 'completed' | 'cancelled',
  createdAt: ISO date string,
  updatedAt: ISO date string
}
```

### Tournaments Collection
```javascript
{
  id: string,
  name: string,
  bracketType: 'single-elimination' | 'double-elimination' | 'round-robin',
  participants: number,
  pointsSystem: {
    win: number,
    loss: number,
    draw: number
  },
  matchDuration: number,
  startDate: string,
  prizePool: string,
  rules: string,
  organizerId: string,
  bracket: object,
  registeredParticipants: array,
  standings: array,
  status: 'registration' | 'active' | 'completed' | 'cancelled',
  currentRound: number,
  totalRounds: number,
  winner: object,
  createdAt: ISO date string,
  updatedAt: ISO date string
}
```

---

## Getting Started

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Create a `.env` file:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key
DATABASE_URL=your_database_url
```

---

## Support
For API support or questions, contact the development team.

**Version:** 1.0.0  
**Last Updated:** December 20, 2024
