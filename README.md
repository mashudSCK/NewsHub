# NewsHub - Modern News Aggregator

A beautiful, responsive news aggregator built with **Next.js 14**, **Tailwind CSS**, and the **NewsAPI**. Stay informed with the latest headlines, search functionality, category filters, and bookmark your favorite articles.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## Features

### Core Functionality
- **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- **Dark Mode** - Toggle between light and dark themes with persistence
- **Smart Search** - Keyword-based search with quick suggestions
- **Bookmarks** - Save articles to read later (stored in localStorage)
- **Infinite Scroll** - Load more articles with pagination
- **Fast Performance** - Optimized with Next.js 14 App Router

### News Categories
- Top Headlines
- Technology
- Business
- Sports
- Entertainment
- Science
- Health

### UI/UX
- Clean, minimalistic design inspired by Google News
- Smooth animations and transitions
- Skeleton loaders for better UX
- Responsive navigation with mobile menu
- Beautiful gradient effects
- Hover animations on cards

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- GNews API key (get it free at [gnews.io](https://gnews.io))

### Installation

1. **Clone or navigate to the project**
   ```powershell
   cd c:\xampp\htdocs\NewsAggregator
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   ```powershell
   Copy-Item .env.example .env.local
   ```
   - Open `.env.local` and add your GNews API key:
   ```env
   NEXT_PUBLIC_GNEWS_API_KEY=your_api_key_here
   NEXT_PUBLIC_DEFAULT_COUNTRY=us
   NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   ```

4. **Run the development server**
   ```powershell
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
NewsAggregator/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout with providers
│   ├── page.js                   # Homepage (Top Headlines)
│   ├── globals.css               # Global styles
│   ├── category/
│   │   └── [category]/
│   │       └── page.js           # Dynamic category pages
│   ├── search/
│   │   └── page.js               # Search results page
│   └── bookmarks/
│       └── page.js               # Saved bookmarks page
│
├── components/                   # Reusable React components
│   ├── Navbar.jsx                # Navigation bar with dark mode toggle
│   ├── NewsCard.jsx              # Article card with bookmark button
│   ├── CategoryTabs.jsx          # Category filter tabs
│   ├── SearchBar.jsx             # Search input with suggestions
│   ├── LoadingSpinner.jsx        # Loading indicator
│   ├── ErrorMessage.jsx          # Error display component
│   └── NewsCardSkeleton.jsx      # Loading skeleton
│
├── context/                      # React Context providers
│   ├── BookmarkContext.js        # Bookmark state management
│   └── ThemeContext.js           # Dark/light mode management
│
├── utils/                        # Utility functions
│   └── fetchNews.js              # API calls and helpers
│
├── package.json                  # Dependencies and scripts
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── jsconfig.json                 # Path aliases
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

---

## Configuration

### API Configuration
The app uses **GNews API** for fetching news. You can customize:

- **Country**: Change `NEXT_PUBLIC_DEFAULT_COUNTRY` (e.g., `us`, `ph`, `gb`)
- **Language**: Change `NEXT_PUBLIC_DEFAULT_LANGUAGE` (e.g., `en`, `es`, `fr`)
- **Categories**: Modify in `utils/fetchNews.js`

### Tailwind Customization
Edit `tailwind.config.js` to customize:
- Colors and themes
- Fonts
- Animations
- Breakpoints

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI component library |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Beautiful icon library |
| **GNews API** | News data source |
| **Context API** | State management |
| **localStorage** | Client-side data persistence |

---

## Pages Overview

### 1. Homepage (`/`)
- Displays top headlines from around the world
- Infinite scroll pagination
- Quick access to categories

### 2. Category Pages (`/category/[category]`)
- Technology, Business, Sports, Entertainment, Science, Health
- Category-specific news articles
- Same infinite scroll functionality

### 3. Search Page (`/search`)
- Keyword-based search
- Quick search suggestions
- Real-time results

### 4. Bookmarks Page (`/bookmarks`)
- View all saved articles
- Remove individual or all bookmarks
- Persists across sessions

---

## Optional Enhancements

### uture Features You Can Add:

1. **AI Summaries**
   - Integrate OpenAI API for article summaries
   - Add a "Summarize" button to NewsCard

2. **Voice Search**
   - Implement Web Speech API
   - Add microphone button to search bar

3. **User Authentication**
   - Add Firebase Authentication
   - Sync bookmarks across devices

4. **Region Filter**
   - Add country selector dropdown
   - Allow users to select news region

5. **Share Functionality**
   - Add social media share buttons
   - Copy link to clipboard

6. **Reading List**
   - Track reading progress
   - Mark articles as read

7. **Email Digest**
   - Send daily/weekly email summaries
   - Customize topics of interest

8. **RSS Feed Support**
   - Add custom RSS feed sources
   - Aggregate multiple sources

---

## Troubleshooting

### Common Issues:

**1. API Rate Limit**
- GNews free tier: 100 requests/day
- Use caching to reduce API calls
- Consider upgrading for production

**2. Images Not Loading**
- Check if `urlToImage` is valid
- Fallback images are configured
- Some sources block external access

**3. Dark Mode Flickering**
- Due to hydration mismatch
- Current implementation prevents this
- Theme loads from localStorage on mount

**4. Build Errors**
- Clear `.next` folder: `Remove-Item -Recurse -Force .next`
- Delete `node_modules` and reinstall
- Check Node.js version compatibility

---

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- **GNews API** - For providing the news data
- **Unsplash** - For fallback images
- **Lucide** - For beautiful icons
- **Vercel** - For hosting and deployment
- **Next.js Team** - For the amazing framework

---

## Support

Having issues? Need help?

- Check the [Issues](../../issues) page
- Review the documentation
- Contact: mashudkhalid.work@gmail.com

---

## Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---


