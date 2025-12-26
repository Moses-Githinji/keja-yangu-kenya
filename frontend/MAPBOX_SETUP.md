# 🗺️ Mapbox Integration Setup Guide

This guide will help you set up Mapbox integration for the property map functionality in Keja Yangu Kenya.

## 📋 Prerequisites

- A Mapbox account (free tier available)
- Node.js and npm installed
- Access to the frontend directory

## 🚀 Step-by-Step Setup

### 1. Create a Mapbox Account

1. Go to [mapbox.com](https://mapbox.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Get Your Access Token

1. Log in to your Mapbox account
2. Go to your [Account page](https://account.mapbox.com/)
3. Navigate to "Access tokens" section
4. Copy your default public token (starts with `pk.`)

### 3. Configure Environment Variables

#### Option A: Create .env file (Recommended for development)

1. In the `frontend` directory, create a `.env` file:

```bash
cd frontend
touch .env
```

2. Add your Mapbox token to the `.env` file:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

#### Option B: Set environment variable directly

```bash
# Windows (PowerShell)
$env:VITE_MAPBOX_ACCESS_TOKEN="pk.your_actual_token_here"

# Windows (Command Prompt)
set VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here

# macOS/Linux
export VITE_MAPBOX_ACCESS_TOKEN="pk.your_actual_token_here"
```

### 4. Restart Development Server

After setting the environment variable, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔧 Configuration Options

### Environment Variables

| Variable                   | Description                     | Example              |
| -------------------------- | ------------------------------- | -------------------- |
| `VITE_MAPBOX_ACCESS_TOKEN` | Your Mapbox public access token | `pk.eyJ1IjoieW91...` |

### Map Features

The enhanced PropertyMap component includes:

- **Multiple Map Styles**: Light, Dark, and Satellite views
- **Interactive Markers**: Custom property markers with enhanced popups
- **Navigation Controls**: Zoom, pan, and compass controls
- **Geolocation**: User location tracking
- **Fullscreen Mode**: Toggle fullscreen view
- **Property Information**: Detailed popups with property details
- **Selection Highlighting**: Visual feedback for selected properties

## 📍 Map Integration Points

### 1. Buy Page (`/buy`)

- Shows all properties for sale on the map
- Left side: Interactive map
- Right side: Property listings
- Click markers to select properties

### 2. Rent Page (`/rent`)

- Shows all rental properties on the map
- Same layout as Buy page
- Rental-specific pricing display

### 3. Property Details Page (`/property/:id`)

- Shows single property location
- Zoomed in view (zoom level 15)
- Property-specific marker

### 4. Property Modal

- Embedded map for quick location preview
- Responsive design for mobile and desktop

## 🎨 Customization

### Map Styles

You can customize the available map styles by modifying the `PropertyMap` component:

```typescript
const styleUrls = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-v9",
  // Add custom styles here
  custom: "mapbox://styles/yourusername/styleid",
};
```

### Marker Styling

Customize marker appearance in the `createMarkers` function:

```typescript
const markerElement = document.createElement("div");
markerElement.className = "custom-marker";
markerElement.innerHTML = `
  <div class="relative">
    <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg 
                flex items-center justify-center ${
                  isSelected ? "bg-blue-500 scale-125" : "bg-green-500"
                }">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>
  </div>
`;
```

### Popup Content

Enhance property popups by modifying the `popupContent` template:

```typescript
const popupContent = `
  <div class="p-3 max-w-xs">
    <h3 class="font-semibold text-sm mb-2 text-gray-800">${property.title}</h3>
    <p class="text-sm font-medium text-green-600 mb-2">${property.price}</p>
    <p class="text-xs text-gray-600 mb-1">Type: ${property.propertyType}</p>
    <p class="text-xs text-gray-600 mb-1">Bedrooms: ${property.bedrooms}</p>
    <p class="text-xs text-gray-600 mb-1">Bathrooms: ${property.bathrooms}</p>
    <p class="text-xs text-gray-600 mb-1">Area: ${property.area} sqm</p>
  </div>
`;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Mapbox access token not configured" Error

**Solution**: Ensure your `.env` file is in the correct location and contains the right variable name:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

#### 2. Map Not Loading

**Check**:

- Token is valid and starts with `pk.`
- Environment variable is loaded (restart dev server)
- No console errors in browser developer tools

#### 3. Properties Not Showing on Map

**Check**:

- Property data includes `longitude` and `latitude` fields
- Coordinates are valid numbers
- Map is fully loaded before adding markers

#### 4. Performance Issues

**Optimizations**:

- Limit the number of properties displayed simultaneously
- Use clustering for large datasets
- Implement lazy loading for markers

### Debug Mode

Enable debug logging by checking the browser console:

```typescript
// Add this to PropertyMap component for debugging
console.log("Mapbox Token:", import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
console.log("Properties:", properties);
console.log("Map Instance:", map.current);
```

## 📱 Mobile Optimization

The map component is fully responsive and includes:

- Touch-friendly controls
- Mobile-optimized popups
- Responsive marker sizing
- Gesture support for zoom/pan

## 🔒 Security Considerations

- **Public Token**: The `VITE_MAPBOX_ACCESS_TOKEN` is a public token designed for client-side use
- **Rate Limits**: Be aware of Mapbox usage limits for your account tier
- **Token Rotation**: Consider implementing token rotation for production use

## 📊 Usage Analytics

Monitor your Mapbox usage:

1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Check "Usage" section
3. Monitor API calls and bandwidth usage
4. Set up usage alerts if needed

## 🆘 Support

### Mapbox Support

- [Mapbox Documentation](https://docs.mapbox.com/)
- [Mapbox Community](https://community.mapbox.com/)
- [Mapbox Support](https://support.mapbox.com/)

### Application Support

- Check browser console for errors
- Verify environment variable configuration
- Ensure property data includes coordinates
- Test with a simple property first

## 🎯 Next Steps

After successful setup:

1. **Test the map** on all property pages
2. **Customize markers** and popups as needed
3. **Add clustering** for better performance with many properties
4. **Implement search** functionality on the map
5. **Add directions** and routing features

---

**Happy Mapping! 🗺️✨**
