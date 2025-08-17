# Developer Guide - MOZ Climate Finance Portal

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development mode (Angular + Express)
npm run dev

# Production build
npm run build:prod

# Analyze bundle size
npm run analyze
```

## Project Architecture

### Technology Stack
- **Frontend**: Angular 17 with standalone components
- **Backend**: Express.js + MongoDB Atlas
- **Styling**: Tailwind CSS + Bootstrap Icons
- **Database**: MongoDB (primary) + Firebase (legacy, being phased out)
- **Deployment**: Firebase Hosting

### Key Directories
```
src/
├── app/
│   ├── home/          # Public portal
│   ├── dashboard/     # Admin area (lazy-loaded)
│   ├── services/      # Business logic
│   │   ├── mongodb/   # MongoDB services
│   │   └── lazy-loader.service.ts # Lazy loading handler
│   └── models/        # TypeScript interfaces
├── assets/
│   └── i18n/         # Translation files (en, es)
└── environments/     # Environment configs
```

## Performance Optimizations

### 1. Lazy Loading Implementation

#### Heavy Libraries
Libraries are now lazy-loaded to reduce initial bundle size:

```typescript
// Example: Loading XLSX only when needed
import { LazyLoaderService } from '@services/lazy-loader.service';

constructor(private lazyLoader: LazyLoaderService) {}

async exportToExcel(data: any[]) {
  const XLSX = await this.lazyLoader.loadXLSX();
  // Use XLSX here
}
```

Available lazy-loaded libraries:
- `loadECharts()` - Chart library (~800KB)
- `loadXLSX()` - Excel export (~500KB)
- `loadJsPDF()` - PDF generation (~300KB)
- `loadLeaflet()` - Map library (~150KB)
- `loadLeafletMarkerCluster()` - Map clustering (~50KB)

### 2. Bundle Optimization

#### Current Configuration
- **Production build**: Minified, tree-shaken, no source maps
- **Vendor chunking**: Disabled for better caching
- **CSS**: Inlined critical CSS, purged unused styles
- **Budgets**: 2MB warning, 5MB error for initial bundle

#### Analyze Bundle Size
```bash
npm run analyze
```
This opens an interactive visualization of the bundle composition.

### 3. Database Migration

Currently using dual-database pattern:
```typescript
// Environment flag controls database selection
useMongoDb: true  // MongoDB (new)
useMongoDb: false // Firebase (legacy)
```

## Development Workflow

### Local Development

1. **Start MongoDB API server**:
   ```bash
   npm run server
   ```

2. **Start Angular dev server**:
   ```bash
   npm start
   ```

3. **Or run both concurrently**:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
# Standard production build
npm run build:prod

# Build with statistics (for analysis)
npm run build:stats
```

### Testing

```bash
# Unit tests
npm test

# Test MongoDB connection
npm run test-mongo

# Check MongoDB IP access
npm run check-ip
```

## Code Guidelines

### Component Structure

Use standalone components for better tree-shaking:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './example.component.html'
})
```

### Service Patterns

1. **Lazy Loading Pattern**:
```typescript
private libraryCache?: any;

async loadLibrary() {
  if (!this.libraryCache) {
    this.libraryCache = await import('heavy-library');
  }
  return this.libraryCache;
}
```

2. **Database Abstraction**:
```typescript
// Use DatabaseProviderService for database operations
constructor(private dbProvider: DatabaseProviderService) {}

getProjects() {
  return this.dbProvider.getProjects(); // Works with both MongoDB and Firebase
}
```

### Performance Best Practices

1. **Images**: Use WebP format when possible
2. **Fonts**: Limit to 2-3 font weights
3. **Icons**: Use single icon library (prefer @ng-icons)
4. **Imports**: Import only what you need
5. **RxJS**: Unsubscribe properly or use `async` pipe

## Environment Configuration

### Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  mongodb: {
    apiUrl: 'http://localhost:3000/api'
  },
  useMongoDb: true
};
```

### Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  mongodb: {
    apiUrl: 'https://api.yourdomain.com/api'
  },
  useMongoDb: true
};
```

## Troubleshooting

### Common Issues

1. **npm install fails**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **MongoDB connection fails**
   - Check IP whitelist in MongoDB Atlas
   - Run `npm run check-ip` to verify

3. **Large bundle size warnings**
   - Run `npm run analyze` to identify culprits
   - Consider lazy loading heavy components

4. **Firebase errors after migration**
   - Check `useMongoDb` flag in environment
   - Ensure MongoDB server is running

## Deployment

### Firebase Hosting
```bash
npm run build:prod
firebase deploy --only hosting
```

### Environment Variables
Never commit sensitive data. Use environment files:
- `.env` for local development
- Firebase config for production secrets

## Performance Metrics

### Current Status
- **Initial Bundle**: ~4.5MB (after optimizations)
- **Lazy Loaded**: ~2MB (charts, export libs)
- **First Contentful Paint**: ~2s
- **Time to Interactive**: ~4s

### Target Metrics
- Initial Bundle: < 2MB
- FCP: < 1.5s
- TTI: < 3s
- Lighthouse Score: > 90

## Future Optimizations

1. **Short Term**
   - Complete MongoDB migration
   - Remove Firebase dependencies (-2MB)
   - Implement service workers

2. **Medium Term**
   - Server-side rendering (Angular Universal)
   - Image optimization pipeline
   - CDN for static assets

3. **Long Term**
   - Micro-frontend architecture
   - WebAssembly for heavy computations
   - Progressive Web App features

## Resources

- [Angular Performance Guide](https://angular.io/guide/performance)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Tailwind CSS Optimization](https://tailwindcss.com/docs/optimizing-for-production)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)

## Support

- Create issues in the repository
- Check `OPTIMIZATION_REPORT.md` for recent changes
- Review `FIREBASE_MIGRATION_CHECKLIST.md` for migration status

---
Last Updated: 2025-08-16
Version: 1.0.0