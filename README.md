# Edirne Events Platform

A comprehensive event discovery and management platform for Edirne, Turkey. Built with modern technologies to provide a seamless experience for event organizers and attendees.

## 🚀 Features

### Event Management
- **Event Discovery**: Browse events by category, date, and location
- **Event Submission**: User-friendly form with unlimited media upload
- **Admin Approval**: Comprehensive review system with editing capabilities
- **Auto-Save**: Real-time form saving with data persistence
- **Media Support**: Images and videos with rotation controls

### Venue Management
- **Venue Directory**: Comprehensive database of local venues
- **Interactive Maps**: Leaflet integration for location visualization
- **Venue Submission**: Community-driven venue additions

### Admin Features
- **Dashboard**: Complete event and venue management
- **Media Gallery**: Unlimited media files with rotation support
- **Real-time Sync**: Instant updates across the platform
- **Bulk Operations**: Efficient content management tools

### Technical Features
- **Mobile-First**: Responsive design for all devices
- **Production-Ready**: Optimized codebase with no debug statements
- **Version Control**: Comprehensive Git workflow with GitHub Actions
- **Database Integration**: PostgreSQL with Drizzle ORM

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Leaflet for interactive mapping
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **File Handling**: Sharp for image optimization

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/[username]/edirne-events-platform.git
cd edirne-events-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your database URL and other required environment variables.

4. **Set up the database**
```bash
npm run db:push
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main tables:

- **events**: Published events
- **pending_events**: Events awaiting approval
- **venues**: Venue directory
- **categories**: Event and venue categories
- **users**: User management
- **announcements**: Platform announcements

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database changes
- `npm run db:generate` - Generate database migrations

## 📝 API Endpoints

### Events
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create new event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Venues
- `GET /api/venues` - Fetch all venues
- `POST /api/venues` - Create new venue

### Admin
- `GET /api/admin/pending-events` - Fetch pending events
- `POST /api/admin/approve-event` - Approve event

## 🎨 Design System

The platform uses a custom design system based on Tailwind CSS with:

- **Color Palette**: Blue primary, red secondary, neutral grays
- **Typography**: Inter font family
- **Components**: Reusable UI components
- **Responsive**: Mobile-first approach

## 🚀 Deployment

The platform is ready for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting provider**

### Environment Variables Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

## 🔄 Version Control

This project uses semantic versioning and includes:

- **CHANGELOG.md**: Detailed version history
- **VERSION_CONTROL.md**: Git workflow guidelines
- **GitHub Actions**: Automated code quality checks

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the Edirne community**