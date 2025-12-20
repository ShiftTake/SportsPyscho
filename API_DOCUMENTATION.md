# Sports Psycho API Documentation

## Overview

This document describes the API endpoints for the Sports Psycho application. The current implementation uses a client-side architecture with localStorage, but this documentation describes the RESTful API structure that should be implemented in a production backend.

## Base URL

```
Production: https://api.sportspsycho.com/v1
Development: http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Club Endpoints

### Create Club

Create a new club.

**Endpoint:** `POST /api/clubs`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Pickleball Maniacs",
  "sport": "Pickleball",
  "privacy": "public",
  "state": "TX",
  "city": "Austin",
  "description": "Weekly pickleball games for all skill levels",
  "ownerId": "user_123456789",
  "imageUrl": "https://example.com/club-image.jpg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "club_1234567890",
    "name": "Pickleball Maniacs",
    "sport": "Pickleball",
    "privacy": "public",
    "state": "TX",
    "city": "Austin",
    "description": "Weekly pickleball games for all skill levels",
    "ownerId": "user_123456789",
    "memberIds": ["user_123456789"],
    "imageUrl": "https://example.com/club-image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Clubs

Retrieve all clubs with optional filters.

**Endpoint:** `GET /api/clubs`

**Query Parameters:**
- `privacy` (optional): Filter by privacy ("public" or "private")
- `sport` (optional): Filter by sport
- `state` (optional): Filter by state
- `city` (optional): Filter by city

**Example:** `GET /api/clubs?privacy=public&sport=Pickleball&state=TX`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "club_1234567890",
      "name": "Pickleball Maniacs",
      /* ... club data ... */
    }
  ]
}
```

### Get Club by ID

Retrieve a specific club.

**Endpoint:** `GET /api/clubs/:clubId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "club_1234567890",
    /* ... club data ... */
  }
}
```

### Update Club

Update an existing club.

**Endpoint:** `PUT /api/clubs/:clubId`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Club Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

### Delete Club

Delete a club.

**Endpoint:** `DELETE /api/clubs/:clubId`

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true
}
```

### Add Member to Club

Add a member to a club.

**Endpoint:** `POST /api/clubs/:clubId/members`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "user_987654321"
}
```

**Response:** `200 OK`

### Remove Member from Club

Remove a member from a club.

**Endpoint:** `DELETE /api/clubs/:clubId/members/:userId`

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Clubs by User

Get all clubs a user is a member of.

**Endpoint:** `GET /api/clubs/user/:userId`

**Response:** `200 OK`

---

## Event Endpoints

### Create Event

Create a new event.

**Endpoint:** `POST /api/events`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "clubId": "club_1234567890",
  "name": "Pickleball Double Round",
  "description": "Competitive doubles tournament",
  "dateTime": "2024-02-15T18:00:00.000Z",
  "location": "Sports Plex Court 4",
  "maxParticipants": 12,
  "recurrence": "weekly",
  "recurrenceEndDate": "2024-06-15T18:00:00.000Z",
  "createdBy": "user_123456789"
}
```

**Recurrence Options:**
- `one-time` - Single event
- `daily` - Repeats daily
- `weekly` - Repeats weekly
- `monthly` - Repeats monthly
- `tournament` - Tournament-style event

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "event_1234567890",
    "clubId": "club_1234567890",
    "name": "Pickleball Double Round",
    /* ... event data ... */
  }
}
```

### Get All Events

Retrieve all events with optional filters.

**Endpoint:** `GET /api/events`

**Query Parameters:**
- `clubId` (optional): Filter by club
- `startDate` (optional): Filter events after this date
- `endDate` (optional): Filter events before this date
- `recurrence` (optional): Filter by recurrence type

**Example:** `GET /api/events?clubId=club_123&startDate=2024-01-01`

**Response:** `200 OK`

### Get Event by ID

**Endpoint:** `GET /api/events/:eventId`

**Response:** `200 OK`

### Update Event

**Endpoint:** `PUT /api/events/:eventId`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### Delete Event

**Endpoint:** `DELETE /api/events/:eventId`

**Response:** `200 OK`

### Add Participant to Event

**Endpoint:** `POST /api/events/:eventId/participants`

**Request Body:**
```json
{
  "userId": "user_987654321"
}
```

**Response:** `200 OK`

### Remove Participant from Event

**Endpoint:** `DELETE /api/events/:eventId/participants/:userId`

**Response:** `200 OK`

### Generate Recurring Events

Generate all instances of a recurring event.

**Endpoint:** `POST /api/events/:eventId/generate-recurring`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    /* Array of generated events */
  ]
}
```

---

## Tournament Endpoints

### Create Tournament

Create a new tournament.

**Endpoint:** `POST /api/tournaments`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "clubId": "club_1234567890",
  "name": "Summer Championship 2024",
  "description": "Annual summer tournament",
  "type": "elimination",
  "startDate": "2024-07-01",
  "endDate": "2024-07-15",
  "participantIds": ["user_1", "user_2", "user_3", "user_4"],
  "createdBy": "user_123456789"
}
```

**Tournament Types:**
- `elimination` - Single elimination bracket
- `round-robin` - Round robin format

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "tournament_1234567890",
    "clubId": "club_1234567890",
    "name": "Summer Championship 2024",
    "type": "elimination",
    "bracket": {
      /* Generated bracket structure */
    },
    /* ... tournament data ... */
  }
}
```

### Get All Tournaments

**Endpoint:** `GET /api/tournaments`

**Query Parameters:**
- `clubId` (optional): Filter by club
- `status` (optional): Filter by status ("upcoming", "in-progress", "completed")
- `type` (optional): Filter by type ("elimination", "round-robin")

**Response:** `200 OK`

### Get Tournament by ID

**Endpoint:** `GET /api/tournaments/:tournamentId`

**Response:** `200 OK`

### Update Tournament

**Endpoint:** `PUT /api/tournaments/:tournamentId`

**Response:** `200 OK`

### Delete Tournament

**Endpoint:** `DELETE /api/tournaments/:tournamentId`

**Response:** `200 OK`

### Start Tournament

Change tournament status to "in-progress".

**Endpoint:** `POST /api/tournaments/:tournamentId/start`

**Response:** `200 OK`

### Update Match Result

Record the result of a match.

**Endpoint:** `PUT /api/tournaments/:tournamentId/matches/:matchId`

**Request Body:**
```json
{
  "winnerId": "user_123",
  "score": {
    "participant1": 11,
    "participant2": 8
  }
}
```

**Response:** `200 OK`

### Get Tournament Bracket

Get bracket structure (elimination only).

**Endpoint:** `GET /api/tournaments/:tournamentId/bracket`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rounds": [
      [
        {
          "matchId": "round1_match1",
          "round": 1,
          "participant1": "user_1",
          "participant2": "user_2",
          "winner": null,
          "score": { "participant1": 0, "participant2": 0 }
        }
      ]
    ],
    "size": 8
  }
}
```

### Get Tournament Standings

Get standings table (round-robin only).

**Endpoint:** `GET /api/tournaments/:tournamentId/standings`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "participantId": "user_1",
      "wins": 3,
      "losses": 0,
      "points": 9
    }
  ]
}
```

---

## Invitation Endpoints

### Send Invitation

Send a club invitation to a user.

**Endpoint:** `POST /api/invitations`

**Request Body:**
```json
{
  "clubId": "club_1234567890",
  "recipientUserId": "user_987654321",
  "senderUserId": "user_123456789"
}
```

**Response:** `201 Created`

### Get User Invitations

Get all invitations for a user.

**Endpoint:** `GET /api/invitations/user/:userId`

**Response:** `200 OK`

### Accept Invitation

**Endpoint:** `POST /api/invitations/:invitationId/accept`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invitation": { /* invitation data */ },
    "club": { /* club data */ }
  }
}
```

### Decline Invitation

**Endpoint:** `POST /api/invitations/:invitationId/decline`

**Response:** `200 OK`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are rate limited:
- **Authenticated:** 1000 requests/hour
- **Unauthenticated:** 100 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1610000000
```

---

## Webhooks (Future Enhancement)

Subscribe to events:
- `club.created`
- `club.updated`
- `event.created`
- `event.participant_joined`
- `tournament.started`
- `tournament.completed`

---

## SDK Examples

### JavaScript/Node.js

```javascript
const client = new SportsPsychoAPI('your_api_key');

// Create a club
const club = await client.clubs.create({
  name: 'Pickleball Maniacs',
  sport: 'Pickleball',
  // ...
});

// Create an event
const event = await client.events.create({
  clubId: club.id,
  name: 'Weekly Match',
  // ...
});
```

### Python

```python
from sportspsycho import SportsPsychoAPI

client = SportsPsychoAPI('your_api_key')

# Create a club
club = client.clubs.create(
    name='Pickleball Maniacs',
    sport='Pickleball',
    # ...
)
```

---

## Support

For API support:
- Email: api-support@sportspsycho.com
- Documentation: https://docs.sportspsycho.com
- Status: https://status.sportspsycho.com
