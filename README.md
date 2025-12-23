# Sports Psycho - Developer Documentation

## Project Overview

Sports Psycho is a web application for connecting with local sports clubs, scheduling events, and managing tournaments. The application uses a client-side architecture with localStorage for data persistence.

## Technology Stack

- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript
- **Data Storage:** localStorage (client-side)
- **Design System:** Custom CSS variables with Tailwind CSS utilities
- **Mobile Support:** Responsive design with PWA capabilities

## Architecture

### Directory Structure

```
SportsPyscho/
├── api/
│   ├── controllers/      # Business logic controllers
│   ├── models/          # Data models
│   └── routes/          # API route documentation
├── js/
│   ├── api-client.js    # API communication layer
│   ├── club-manager.js  # Club management logic
│   ├── event-manager.js # Event scheduling logic
│   └── tournament-manager.js # Tournament management
├── assets/
│   └── img/            # Images and icons
├── *.html              # Page templates
└── manifest.json       # PWA configuration
```

### Data Models

#### Club Model
```javascript
{
  id: string,
  name: string,
  sport: string,
  privacy: 'public' | 'private',
  state: string,
  city: string,
  description: string,
  ownerId: string,
  memberIds: string[],
  imageUrl: string,
  createdAt: string,
  updatedAt: string
}
```

#### Event Model
```javascript
{
  id: string,
  clubId: string,
  name: string,
  description: string,
  dateTime: string,
  location: string,
  maxParticipants: number,
  participantIds: string[],
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'tournament',
  recurrenceEndDate: string | null,
  tournamentId: string | null,
  createdBy: string,
  createdAt: string,
  updatedAt: string
}
```

#### Tournament Model
```javascript
{
  id: string,
  clubId: string,
  name: string,
  description: string,
  type: 'elimination' | 'round-robin',
  startDate: string,
  endDate: string,
  participantIds: string[],
  matches: Match[],
  bracket: Bracket | null,
  standings: Standing[],
  winnerId: string | null,
  status: 'upcoming' | 'in-progress' | 'completed',
  createdBy: string,
  createdAt: string,
  updatedAt: string
}
```

## Key Features

### 1. Club Management

**Create Club** (`create-club.html`)
- Fields: name, sport, privacy, state, city, description
- Member invitation system
- Form validation

**View Club** (`club.html`)
- Club details with tabs (Events, Members, About)
- Join/leave functionality
- Member management

### 2. Event Scheduling

**Create Event** (`create-event.html`)
- Date & time picker
- Location field
- Participant limit
- Recurrence options:
  - One-time
  - Daily
  - Weekly
  - Monthly
  - Tournament style
- Recurrence end date

**View Event** (`event.html`)
- Event details
- Participant list
- RSVP functionality
- Map placeholder for location

### 3. Tournament Management

**Create Tournament** (`create-tournament.html`)
- Tournament types:
  - Single Elimination (bracket-based)
  - Round Robin (everyone plays everyone)
- Participant registration
- Date range selection

**View Tournament** (`tournament.html`)
- Bracket visualization (elimination)
- Standings table (round-robin)
- Match score entry
- Winner tracking

**Tournament Algorithms:**

*Elimination Bracket:*
- Automatically generates bracket based on participant count
- Rounds up to nearest power of 2
- Supports byes for uneven numbers
- Auto-advances winners through rounds

*Round Robin:*
- Generates all possible match combinations
- Tracks wins/losses/points
- Calculates standings (3 points per win)
- Determines winner based on points

## API Client

The `APIClient` class handles all data operations:

```javascript
// Example usage
const club = await apiClient.createClub({
  name: 'Pickleball Maniacs',
  sport: 'Pickleball',
  privacy: 'public',
  state: 'TX',
  city: 'Austin',
  description: 'Weekly pickleball games',
  ownerId: 'user123'
});
```

### Available Methods

**Clubs:**
- `createClub(clubData)`
- `getClubs(filters)`
- `getClubById(clubId)`
- `updateClub(clubId, updateData)`
- `deleteClub(clubId)`
- `addClubMember(clubId, userId)`
- `removeClubMember(clubId, userId)`

**Events:**
- `createEvent(eventData)`
- `getEvents(filters)`
- `getEventById(eventId)`
- `updateEvent(eventId, updateData)`
- `deleteEvent(eventId)`
- `addEventParticipant(eventId, userId)`
- `removeEventParticipant(eventId, userId)`

**Tournaments:**
- `createTournament(tournamentData)`
- `getTournaments(filters)`
- `getTournamentById(tournamentId)`
- `updateTournament(tournamentId, updateData)`
- `deleteTournament(tournamentId)`

**Invitations:**
- `sendInvitation(invitationData)`
- `getUserInvitations(userId)`
- `acceptInvitation(invitationId)`
- `declineInvitation(invitationId)`

## Styling Guide

### Color Palette
```css
--psycho-purple: #5821a6   /* Primary background */
--psycho-deep: #2a0b58     /* Headers/footers */
--psycho-blue: #4ad2ff     /* Primary actions */
--psycho-yellow: #ffdd57   /* Accents/highlights */
```

### Card Component
```html
<div class="card">
  <!-- Content -->
</div>
```

Properties:
- Semi-transparent background with blur
- Rounded corners (24px)
- White border with opacity
- Drop shadow

### Form Inputs
All form inputs use:
- Black text on white background
- Rounded corners (12px)
- Bold font weight
- Focus outline removed

## Mobile Optimization

### Responsive Design
- Tailwind CSS utilities for responsive breakpoints
- Fixed bottom navigation
- Touch-friendly buttons (minimum 44px touch targets)
- Horizontal scrolling for bracket visualization

### PWA Features
- `manifest.json` for app installation
- Standalone display mode
- Custom theme colors
- Portrait orientation lock

## Development Guidelines

### Code Style
1. Use ES6+ features (const, let, arrow functions, async/await)
2. Comment complex logic
3. Use descriptive variable names
4. Keep functions focused and small

### Form Handling
1. Use `preventDefault()` on form submissions
2. Validate data before API calls
3. Show user feedback (success/error messages)
4. Redirect after successful operations

### Data Management
1. All data operations go through `APIClient`
2. Use async/await for API calls
3. Handle errors gracefully
4. Update UI after data changes

### Testing
Manual testing checklist:
- [ ] Club creation with all fields
- [ ] Event creation with recurrence
- [ ] Tournament bracket generation
- [ ] Form validation
- [ ] Navigation between pages
- [ ] Mobile responsiveness

## Future Enhancements

### Backend Integration
To connect to a real backend:

1. Update `APIClient` base URL
2. Replace localStorage operations with HTTP requests:
```javascript
async createClub(clubData) {
  const response = await fetch(`${this.baseURL}/clubs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clubData)
  });
  return await response.json();
}
```

3. Add authentication/authorization
4. Implement proper error handling

### Recommended Backend Stack
- **Node.js + Express:** For JavaScript consistency
- **Python + Flask/Django:** For rapid development
- **Database:** PostgreSQL or MongoDB
- **Authentication:** JWT tokens
- **File Storage:** AWS S3 or similar for images

### Additional Features
- Real-time notifications
- Chat/messaging
- Payment integration
- Advanced search/filtering
- Social features (posts, comments)
- Statistics and analytics
- Email notifications
- Calendar integration
- GPS location services
- Photo uploads

## Troubleshooting

### Common Issues

**Issue:** Forms not submitting
- Check if JavaScript files are loaded
- Verify form ID matches initialization code
- Check browser console for errors

**Issue:** Data not persisting
- Verify localStorage is enabled
- Check browser privacy settings
- Clear localStorage if corrupted

**Issue:** Layout issues on mobile
- Test with browser dev tools mobile view
- Check Tailwind CSS is loading
- Verify viewport meta tag

## Support

For questions or issues:
1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Review API route documentation

## License

Copyright © 2024 Sports Psycho. All rights reserved.
