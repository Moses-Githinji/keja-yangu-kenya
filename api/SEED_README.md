# 🌱 Database Seeding Guide

This guide explains how to populate your KejaYangu Kenya database with realistic dummy property data.

## 📋 What the Seed Script Creates

### 🏠 **Properties (1000+ properties)**

- **Property Types**: Houses, Apartments, Villas, Townhouses, Land, Duplexes, Farmhouses, Penthouses, Commercial buildings, Student hostels, Industrial properties
- **Listing Types**: Sale and Rent properties
- **Locations**: Properties across major Kenyan cities and counties
- **Realistic Pricing**: Based on location tiers and property types
- **Complete Details**: Bedrooms, bathrooms, area, features, descriptions
- **Geographic Data**: Accurate coordinates for map display

### 👥 **Users (50+ users)**

- **Admin User**: admin@kejayangukenya.com (password: admin123)
- **Regular Users**: 40+ users with Kenyan names
- **Agents**: 10% of users are marked as agents
- **Verification Status**: 80% verified users

### 🖼️ **Property Images**

- **Multiple Images**: 3-8 images per property
- **Placeholder URLs**: Ready for development/testing
- **Primary Images**: Each property has a designated main image

## 🗺️ **Geographic Coverage**

### **Tier 1 (Premium) - Nairobi**

- Karen, Westlands, Lavington, Runda, Muthaiga
- **Price Range**: KES 8M - 200M+

### **Tier 2 (Major Cities)**

- Nairobi (other areas), Mombasa, Kiambu, Nakuru
- **Price Range**: KES 4M - 75M

### **Tier 3 (Towns)**

- Kisumu, Eldoret, smaller towns
- **Price Range**: KES 1.5M - 25M

## 🚀 **How to Run the Seed Script**

### **Prerequisites**

1. Database is set up and connected
2. Prisma schema is applied
3. All dependencies are installed

### **Steps**

1. **Navigate to API directory**

   ```bash
   cd api
   ```

2. **Run database migrations (if needed)**

   ```bash
   npm run db:migrate
   ```

3. **Execute the seed script**
   ```bash
   npm run db:seed
   ```

### **Alternative Commands**

```bash
# Reset database and seed fresh data
npm run db:reset

# Or run seed script directly
node prisma/seed.js
```

## 📊 **Expected Output**

When the seeding completes successfully, you should see:

```
🌱 Starting database seeding...
Clearing existing data...
Creating users...
Created 51 users
Creating properties...
Created 1247 properties
✅ Database seeding completed successfully!
📊 Summary:
   - Users: 51
   - Properties: 1247
   - Property Images: 6235 (average)
```

## 🔍 **Verifying Seeded Data**

### **Check with Prisma Studio**

```bash
npm run db:studio
```

### **Check via API**

- **All properties**: `GET /api/v1/properties`
- **Search properties**: `GET /api/v1/search?q=Nairobi`
- **Filter by type**: `GET /api/v1/search?propertyType=HOUSE`

### **Admin Access**

- **Email**: admin@kejayangukenya.com
- **Password**: admin123
- **Role**: ADMIN

## 🗺️ **Map Integration**

All seeded properties include:

- **Latitude/Longitude**: Accurate coordinates for Kenya
- **City/County**: Proper administrative divisions
- **Address**: Realistic Kenyan addresses

Properties will automatically appear on:

- **Buy page map**
- **Rent page map**
- **Property details map**
- **Search results map**

## 🔧 **Customization**

### **Modify Locations**

Edit the `kenyaLocations` array in `prisma/seed.js` to add/remove areas.

### **Adjust Pricing**

Update the `priceRanges` object to change price tiers.

### **Property Features**

Modify the `propertyFeatures` array to add/remove amenities.

### **Property Counts**

Change `getRandomInt(15, 25)` in the main loop to adjust properties per area.

## ⚠️ **Important Notes**

1. **Destructive Operation**: The seed script clears ALL existing data
2. **Development Only**: Don't run on production databases
3. **Image URLs**: Uses placeholder URLs - replace with real images for production
4. **Phone Numbers**: Uses realistic Kenyan formats but are dummy numbers
5. **Coordinates**: Based on real Kenyan locations but with random offsets

## 🐛 **Troubleshooting**

### **Common Issues**

**1. "P2002: Unique constraint failed"**

- Solution: The script handles duplicate emails automatically

**2. "Database connection error"**

- Solution: Check your `.env` file and database connection

**3. "Module not found"**

- Solution: Run `npm install` in the api directory

**4. "Prisma schema out of sync"**

- Solution: Run `npm run db:migrate` or `npm run db:push`

### **Reset Everything**

```bash
npm run db:reset  # Resets migrations and seeds fresh data
```

## 📈 **Performance**

- **Execution Time**: ~2-5 minutes for full seeding
- **Memory Usage**: ~100-200MB during execution
- **Database Size**: ~50-100MB after seeding

## 🔄 **Re-seeding**

To refresh data:

1. The script automatically clears existing data
2. Run `npm run db:seed` again
3. Or use `npm run db:reset` for a complete reset

## 🎯 **Testing Search Functionality**

After seeding, test these searches:

- **Location**: "Nairobi", "Karen", "Mombasa"
- **Property Type**: "HOUSE", "APARTMENT", "VILLA"
- **Price Range**: Various ranges based on tier
- **Features**: "Swimming Pool", "Garden", "Security"

All searches should return relevant results and display properly on the map! 🗺️✨
