# Firebase to MongoDB Migration Checklist

## Current Status
- ✅ MongoDB backend implemented
- ✅ Dual-database provider pattern in place
- ✅ Feature flag for database selection (`useMongoDb: true`)
- ⏳ Firebase still used for some services

## Pre-Migration Checklist

### 1. Data Migration
- [ ] Export all Firestore collections
  - [ ] Projects collection
  - [ ] Policies collection
  - [ ] Users collection
  - [ ] Any other collections
- [ ] Run migration script: `npm run migrate`
- [ ] Verify data integrity in MongoDB
- [ ] Compare record counts between databases
- [ ] Test data queries match expected results

### 2. Authentication Migration
Currently using MongoDB auth, but Firebase Auth references remain:
- [ ] Remove all AngularFireAuth imports
- [ ] Update auth guards to use MongoDB auth only
- [ ] Update login/register components
- [ ] Migrate existing user sessions
- [ ] Test authentication flow end-to-end

### 3. File Storage Migration
- [ ] Identify all Firebase Storage usage
- [ ] Choose alternative storage solution:
  - Option 1: MongoDB GridFS for files
  - Option 2: AWS S3 or similar
  - Option 3: Local server storage
- [ ] Migrate existing files
- [ ] Update file upload/download services

### 4. Code Cleanup

#### Components to Update
- [ ] `src/app/home/landing/landing.component.ts` - Remove AngularFirestore
- [ ] `src/app/home/data-analysis/data-analysis.component.ts` - Remove AngularFirestore
- [ ] `src/app/home/open-data/open-data.component.ts` - Remove AngularFirestore
- [ ] All components using `@angular/fire`

#### Services to Update
- [ ] Remove `DatabaseProviderService` (no longer needed)
- [ ] Remove Firebase-specific project service
- [ ] Update all service imports

#### Dependencies to Remove
After all migrations are complete:
```json
// Remove from package.json
"@angular/fire": "^17.0.1",
"firebase": "^10.11.1", 
"firebase-admin": "^12.0.0"
```

### 5. Environment Configuration
- [ ] Remove Firebase config from `environment.ts`
- [ ] Remove `useMongoDb` flag (no longer needed)
- [ ] Update deployment configurations
- [ ] Update CI/CD pipelines

### 6. Testing Plan

#### Unit Tests
- [ ] Update all test files removing Firebase mocks
- [ ] Add MongoDB service mocks
- [ ] Run full test suite: `npm test`

#### Integration Tests
- [ ] Test project CRUD operations
- [ ] Test user authentication flow
- [ ] Test file upload/download
- [ ] Test data export functionality

#### Performance Tests
- [ ] Compare query performance
- [ ] Test concurrent user load
- [ ] Measure page load times

### 7. Deployment Strategy

#### Phase 1: Dual Operation (Current)
- ✅ Both databases running
- ✅ Feature flag controls selection
- Monitor for issues

#### Phase 2: MongoDB Primary
- [ ] Set all environments to use MongoDB
- [ ] Keep Firebase as fallback
- [ ] Monitor for 2 weeks

#### Phase 3: Firebase Removal
- [ ] Remove all Firebase code
- [ ] Remove Firebase dependencies
- [ ] Update documentation
- [ ] Archive Firebase project

## Rollback Plan
If issues arise during migration:
1. Toggle `useMongoDb: false` in environment
2. Restore Firebase services
3. Investigate and fix issues
4. Retry migration

## Post-Migration Benefits
- **Cost Reduction**: ~$50-100/month saved on Firebase
- **Performance**: Better query performance for complex aggregations
- **Bundle Size**: ~2MB reduction in JavaScript bundle
- **Flexibility**: More control over database operations
- **Scalability**: Better horizontal scaling options

## Commands Reference
```bash
# Test MongoDB connection
npm run test-mongo

# Run migration
npm run migrate

# Toggle database (for testing)
npm run toggle-db

# Check MongoDB access
npm run check-ip
```

## Support Contacts
- MongoDB Atlas Support: [support link]
- DevOps Team: [contact]
- Backend Team: [contact]

## Notes
- Keep Firebase project active for 3 months after migration as backup
- Document any custom Firebase features that need reimplementation
- Consider keeping Firebase Auth if it provides features MongoDB doesn't