# Sports Psycho

A comprehensive web and mobile application for managing sports clubs, events, and tournaments.

## Features

### 🏆 Club Management
- Create public and private clubs
- Sport selection (Pickleball, Golf, Tennis, Basketball, Football, Soccer, Volleyball)
- Location-based clubs (State, City, Venue)
- Member invitations by User ID
- Club visibility controls
- Member management

### 📅 Event Scheduling
- Create one-time or tournament events
- Date, time, and location scheduling
- Participant capacity management
- RSVP system with waitlist support
- Calendar sync (iCalendar .ics format)
- Event notifications

### 🏅 Tournament Management
- Multiple bracket types:
  - Single Elimination
  - Double Elimination
  - Round Robin
- Customizable points system
- Match tracking and result submission
- Real-time standings
- Bracket visualization
- Automatic winner determination

### 📱 Mobile & Web Support
- Responsive design with Tailwind CSS
- Mobile-friendly API endpoints
- Cross-platform compatibility
- Calendar integration with device calendars

## Technology Stack

### Frontend
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Inter Font Family

### Backend API
- Node.js
- Express.js
- JWT Authentication
- RESTful API design

## Getting Started

### Prerequisites
- Node.js 14+ (for backend API)
- Modern web browser
- Text editor or IDE

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShiftTake/SportsPyscho.git
cd SportsPyscho
```

2. Install dependencies:
```bash
npm install
```

3. Start the API server:
```bash
npm start
```

The API server will run on `http://localhost:3000`

### Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Project Structure

```
SportsPyscho/
├── index.html              # Landing page
├── dashboard.html          # User dashboard
├── create-club.html        # Club creation form
├── club.html              # Club details page
├── create-event.html      # Event creation form
├── event.html             # Event details page
├── create-tournament.html # Tournament creation form
├── tournament.html        # Tournament bracket view
├── calendar.html          # Calendar view
├── search.html            # Search page
├── profile.html           # User profile
├── login.html            # Login page
├── signup.html           # Signup page
├── api/                  # Backend API
│   ├── server.js         # Main API server
│   ├── clubs.js          # Club endpoints
│   ├── events.js         # Event endpoints
│   ├── tournaments.js    # Tournament endpoints
│   └── api-utils.js      # Shared utilities
├── assets/               # Static assets
│   └── img/             # Images
├── package.json         # Node.js dependencies
├── API_README.md        # API documentation
└── README.md           # This file
```

## API Documentation

See [API_README.md](API_README.md) for detailed API documentation including:
- Endpoint specifications
- Request/response formats
- Authentication
- Error handling
- Mobile integration guide

## Key Features Implementation

### Club Creation
Form fields include:
- Club Name
- Sport Selection
- State and City
- Venue/Location
- Description
- Visibility (Public/Private)
- Member Invitations (User IDs)

### Event Scheduling
Features include:
- Event name and description
- Club selection
- Date and time picker
- Location input
- Max participants setting
- Event type (one-time or tournament)
- Calendar sync option
- RSVP requirement setting

### Tournament System
Supports:
- Bracket generation (single/double elimination, round robin)
- Points system configuration
- Match scheduling
- Result submission
- Standings calculation
- Winner determination logic

### RSVP System
- Join/withdraw from events
- Waitlist management
- Participant tracking
- Capacity management

### Calendar Integration
- Generate .ics calendar files
- Compatible with:
  - Google Calendar
  - Apple Calendar
  - Outlook
  - Any iCalendar-compatible app

## Design System

### Colors
- Primary Purple: `#5821a6`
- Deep Purple: `#2a0b58`
- Accent Blue: `#4ad2ff`
- Accent Yellow: `#ffdd57`

### Typography
- Font Family: Inter
- Weights: 400, 600, 700, 900

### UI Components
- Glassmorphism cards with backdrop blur
- Rounded corners (18-24px border radius)
- Consistent shadow system
- Mobile-first responsive design

## Development Guidelines

### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow modular architecture
- Maintain consistency with existing patterns

### API Integration
- All forms include JavaScript for API calls
- Fallback to localStorage for demo mode
- Error handling with user-friendly messages
- Loading states and validation

### Mobile Optimization
- Responsive grid layouts
- Touch-friendly button sizes
- Mobile navigation at bottom
- Optimized for iOS and Android

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features
- JWT authentication
- Input sanitization
- Rate limiting (100 req/min per IP)
- CORS configuration
- XSS prevention

## Future Enhancements
- Push notifications
- Social features (chat, feeds)
- Payment integration for tournaments
- Advanced analytics
- GPS-based club discovery
- Video streaming for events
- Real-time match updates

## Contributing
Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commits
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Contact
For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for sports enthusiasts**
