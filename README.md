# Trip Map Diary

A Progressive Web App for documenting family trips with maps, photos, and nature observations.

## Features

- User authentication
- Trip creation and management
- Photo uploads with GPS location
- Interactive maps using Mapy.cz API
- Offline support
- Nature observations logging
- Tag system for organizing trips

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend & Auth)
- OpenLayers (Maps)
- PWA support

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPY_CZ_API_KEY=your_mapy_cz_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

## License

MIT