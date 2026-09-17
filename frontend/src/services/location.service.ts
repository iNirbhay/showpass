export interface CinemaHouse {
  id: string;
  name: string;
  chain: 'PVR' | 'INOX' | 'Cinépolis' | 'Miraj' | 'AMB' | 'Independent';
  mall: string;
  screenName: string;
  features: string[];
  distanceKm?: number;
  showtimes: {
    time: string;
    format: string;
    totalSeats: number;
    availableSeats: number;
    basePrice: number;
    status: 'AVAILABLE' | 'ALMOST_FULL' | 'FILLING_FAST';
  }[];
}

export interface CityLocation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  cinemas: CinemaHouse[];
}

export const CITIES_DATABASE: Record<string, CityLocation> = {
  'delhi-ncr': {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    state: 'Gurugram / Delhi',
    lat: 28.6139,
    lng: 77.2090,
    cinemas: [
      {
        id: 'pvr-ambience-gurugram',
        name: 'PVR INOX: Ambience Mall',
        chain: 'PVR',
        mall: 'Ambience Mall, NH-8, Gurugram',
        screenName: 'Audi 02 (Dolby Atmos • 4K Laser)',
        features: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Food'],
        showtimes: [
          { time: '10:30 AM', format: '4K Laser', totalSeats: 96, availableSeats: 78, basePrice: 350, status: 'AVAILABLE' },
          { time: '01:45 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 54, basePrice: 380, status: 'FILLING_FAST' },
          { time: '05:00 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 22, basePrice: 450, status: 'ALMOST_FULL' },
          { time: '08:15 PM', format: '4K Laser', totalSeats: 96, availableSeats: 68, basePrice: 420, status: 'AVAILABLE' },
          { time: '10:45 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 82, basePrice: 360, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'cinepolis-airia-gurugram',
        name: 'Cinépolis: Airia Mall',
        chain: 'Cinépolis',
        mall: 'Sector 68, Sohna Road, Gurugram',
        screenName: 'VIP Screen 03 (RealD 3D • Luxe Recliners)',
        features: ['RealD 3D', 'VIP Butler Service', 'Luxe Recliners', 'JBL Surround'],
        showtimes: [
          { time: '11:15 AM', format: '2D Digital', totalSeats: 80, availableSeats: 65, basePrice: 320, status: 'AVAILABLE' },
          { time: '02:30 PM', format: 'VIP Recliner', totalSeats: 80, availableSeats: 48, basePrice: 400, status: 'AVAILABLE' },
          { time: '06:00 PM', format: 'VIP Recliner', totalSeats: 80, availableSeats: 18, basePrice: 480, status: 'ALMOST_FULL' },
          { time: '09:15 PM', format: 'RealD 3D', totalSeats: 80, availableSeats: 58, basePrice: 380, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'pvr-directors-cut-vasant-kunj',
        name: "PVR Director's Cut: Ambience Mall",
        chain: 'PVR',
        mall: 'Nelson Mandela Marg, Vasant Kunj, New Delhi',
        screenName: 'Platinum Lounge Audi 01',
        features: ['Platinum Service', 'Dolby 7.1', 'Full Dining Menu', 'Blanket & Pillow'],
        showtimes: [
          { time: '12:00 PM', format: 'Platinum 2D', totalSeats: 64, availableSeats: 50, basePrice: 650, status: 'AVAILABLE' },
          { time: '03:45 PM', format: 'Platinum 2D', totalSeats: 64, availableSeats: 30, basePrice: 750, status: 'FILLING_FAST' },
          { time: '07:15 PM', format: 'Platinum 2D', totalSeats: 64, availableSeats: 12, basePrice: 850, status: 'ALMOST_FULL' },
          { time: '10:30 PM', format: 'Platinum 2D', totalSeats: 64, availableSeats: 45, basePrice: 650, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'miraj-cinemas-mg-road',
        name: 'Miraj Cinemas: MGF Metropolitan',
        chain: 'Miraj',
        mall: 'MG Road, Sector 28, Gurugram',
        screenName: 'Audi 03 (RGB Laser • Premium Club)',
        features: ['RGB Laser', 'Dolby 7.1', 'Pushback Seats', 'Popcorn Bar'],
        showtimes: [
          { time: '10:00 AM', format: 'RGB Laser', totalSeats: 110, availableSeats: 92, basePrice: 280, status: 'AVAILABLE' },
          { time: '01:15 PM', format: 'RGB Laser', totalSeats: 110, availableSeats: 74, basePrice: 300, status: 'AVAILABLE' },
          { time: '04:45 PM', format: 'RGB Laser', totalSeats: 110, availableSeats: 35, basePrice: 340, status: 'FILLING_FAST' },
          { time: '08:00 PM', format: 'RGB Laser', totalSeats: 110, availableSeats: 60, basePrice: 340, status: 'AVAILABLE' },
        ],
      },
    ],
  },
  'mumbai': {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    cinemas: [
      {
        id: 'pvr-phoenix-palladium',
        name: 'PVR ICON: Phoenix Palladium',
        chain: 'PVR',
        mall: 'High Street Phoenix, Lower Parel, Mumbai',
        screenName: 'IMAX with Laser (Screen 01)',
        features: ['IMAX with Laser', '12-Channel Audio', 'Luxe Seating', 'Live Kitchen'],
        showtimes: [
          { time: '10:15 AM', format: 'IMAX Laser', totalSeats: 120, availableSeats: 88, basePrice: 480, status: 'AVAILABLE' },
          { time: '01:30 PM', format: 'IMAX Laser', totalSeats: 120, availableSeats: 62, basePrice: 550, status: 'FILLING_FAST' },
          { time: '05:15 PM', format: 'IMAX Laser', totalSeats: 120, availableSeats: 24, basePrice: 650, status: 'ALMOST_FULL' },
          { time: '09:00 PM', format: 'IMAX Laser', totalSeats: 120, availableSeats: 70, basePrice: 580, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'maison-inox-bkc',
        name: 'Maison INOX: Jio World Drive',
        chain: 'INOX',
        mall: 'Bandra Kurla Complex (BKC), Mumbai',
        screenName: 'Luxe Audi 02 (Dolby Atmos)',
        features: ['Dolby Atmos', 'Luxe Recliners', 'Curated French Menu', 'Laser 4K'],
        showtimes: [
          { time: '11:45 AM', format: 'Luxe 2D', totalSeats: 84, availableSeats: 66, basePrice: 500, status: 'AVAILABLE' },
          { time: '03:15 PM', format: 'Luxe 2D', totalSeats: 84, availableSeats: 42, basePrice: 600, status: 'FILLING_FAST' },
          { time: '06:45 PM', format: 'Luxe 2D', totalSeats: 84, availableSeats: 14, basePrice: 700, status: 'ALMOST_FULL' },
          { time: '10:15 PM', format: 'Luxe 2D', totalSeats: 84, availableSeats: 58, basePrice: 550, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'cinepolis-viviana-thane',
        name: 'Cinépolis: Viviana Mall',
        chain: 'Cinépolis',
        mall: 'Eastern Express Highway, Thane West, Mumbai',
        screenName: 'Screen 04 (4DX • Motion Sensory)',
        features: ['4DX Motion Seats', 'Environmental Effects', 'RealD 3D', 'Dolby 7.1'],
        showtimes: [
          { time: '10:30 AM', format: '4DX 3D', totalSeats: 96, availableSeats: 74, basePrice: 420, status: 'AVAILABLE' },
          { time: '02:00 PM', format: '4DX 3D', totalSeats: 96, availableSeats: 38, basePrice: 480, status: 'FILLING_FAST' },
          { time: '05:30 PM', format: '4DX 3D', totalSeats: 96, availableSeats: 16, basePrice: 520, status: 'ALMOST_FULL' },
          { time: '09:00 PM', format: '4DX 3D', totalSeats: 96, availableSeats: 62, basePrice: 460, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'inox-megaplex-inorbit',
        name: 'INOX: Megaplex Inorbit Mall',
        chain: 'INOX',
        mall: 'Link Road, Malad West, Mumbai',
        screenName: 'ScreenX Audi 03 (270° Panoramic Screen)',
        features: ['ScreenX 270°', 'Dolby Atmos', 'Laser Projection', 'Gourmet Bistro'],
        showtimes: [
          { time: '11:00 AM', format: 'ScreenX', totalSeats: 110, availableSeats: 90, basePrice: 380, status: 'AVAILABLE' },
          { time: '02:45 PM', format: 'ScreenX', totalSeats: 110, availableSeats: 68, basePrice: 420, status: 'AVAILABLE' },
          { time: '06:15 PM', format: 'ScreenX', totalSeats: 110, availableSeats: 28, basePrice: 460, status: 'ALMOST_FULL' },
          { time: '09:45 PM', format: 'ScreenX', totalSeats: 110, availableSeats: 76, basePrice: 400, status: 'AVAILABLE' },
        ],
      },
    ],
  },
  'bengaluru': {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    cinemas: [
      {
        id: 'pvr-forum-koramangala',
        name: 'PVR IMAX: The Forum Mall',
        chain: 'PVR',
        mall: 'Hosur Road, Koramangala, Bengaluru',
        screenName: 'Audi 01 (IMAX Laser • 12-Channel)',
        features: ['IMAX Laser', 'Next-Gen Sound', 'Stadium Seating', 'Lounge Bar'],
        showtimes: [
          { time: '10:00 AM', format: 'IMAX Laser', totalSeats: 130, availableSeats: 98, basePrice: 450, status: 'AVAILABLE' },
          { time: '01:30 PM', format: 'IMAX Laser', totalSeats: 130, availableSeats: 58, basePrice: 520, status: 'FILLING_FAST' },
          { time: '05:00 PM', format: 'IMAX Laser', totalSeats: 130, availableSeats: 20, basePrice: 600, status: 'ALMOST_FULL' },
          { time: '08:45 PM', format: 'IMAX Laser', totalSeats: 130, availableSeats: 72, basePrice: 550, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'inox-mantri-square',
        name: 'INOX: Mantri Square Mall',
        chain: 'INOX',
        mall: 'Sampige Road, Malleshwaram, Bengaluru',
        screenName: 'Insignia Audi 03 (Ultra Luxury)',
        features: ['Insignia Luxe', 'Plush Recliners', 'Dolby Atmos', 'Chef-Crafted Bites'],
        showtimes: [
          { time: '11:15 AM', format: 'Insignia 2D', totalSeats: 72, availableSeats: 55, basePrice: 480, status: 'AVAILABLE' },
          { time: '02:45 PM', format: 'Insignia 2D', totalSeats: 72, availableSeats: 32, basePrice: 560, status: 'FILLING_FAST' },
          { time: '06:15 PM', format: 'Insignia 2D', totalSeats: 72, availableSeats: 11, basePrice: 640, status: 'ALMOST_FULL' },
          { time: '09:30 PM', format: 'Insignia 2D', totalSeats: 72, availableSeats: 46, basePrice: 520, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'cinepolis-orion-mall',
        name: 'Cinépolis: Orion Mall',
        chain: 'Cinépolis',
        mall: 'Brigade Gateway, Rajajinagar, Bengaluru',
        screenName: 'Audi 02 (Dolby Atmos • RealD 3D)',
        features: ['Dolby Atmos', 'RealD 3D', 'Ergonomic Rockers', 'Coffee House'],
        showtimes: [
          { time: '10:45 AM', format: 'Dolby Atmos', totalSeats: 104, availableSeats: 82, basePrice: 340, status: 'AVAILABLE' },
          { time: '02:15 PM', format: 'Dolby Atmos', totalSeats: 104, availableSeats: 60, basePrice: 380, status: 'AVAILABLE' },
          { time: '05:45 PM', format: 'Dolby Atmos', totalSeats: 104, availableSeats: 26, basePrice: 420, status: 'ALMOST_FULL' },
          { time: '09:15 PM', format: 'Dolby Atmos', totalSeats: 104, availableSeats: 70, basePrice: 380, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'pvr-phoenix-marketcity-blr',
        name: 'PVR: Phoenix Marketcity',
        chain: 'PVR',
        mall: 'Whitefield Main Road, Bengaluru',
        screenName: 'Gold Class Audi 04 (Dolby 7.1)',
        features: ['Gold Class', 'Recliners', 'Dedicated Waiter', 'Laser Projection'],
        showtimes: [
          { time: '11:30 AM', format: 'Gold Class', totalSeats: 60, availableSeats: 48, basePrice: 550, status: 'AVAILABLE' },
          { time: '03:00 PM', format: 'Gold Class', totalSeats: 60, availableSeats: 28, basePrice: 620, status: 'FILLING_FAST' },
          { time: '06:30 PM', format: 'Gold Class', totalSeats: 60, availableSeats: 9, basePrice: 700, status: 'ALMOST_FULL' },
          { time: '10:00 PM', format: 'Gold Class', totalSeats: 60, availableSeats: 40, basePrice: 580, status: 'AVAILABLE' },
        ],
      },
    ],
  },
  'hyderabad': {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    cinemas: [
      {
        id: 'amb-cinemas-gachibowli',
        name: 'AMB Cinemas: Gachibowli',
        chain: 'AMB',
        mall: 'Sarath City Capital Mall, Gachibowli, Hyderabad',
        screenName: 'Screen 01 (Superplex • Dolby Atmos 4K)',
        features: ['Dolby Atmos', 'Barco Laser 4K', 'VIP Recliners', 'Lounge Dining'],
        showtimes: [
          { time: '10:30 AM', format: 'Laser 4K', totalSeats: 140, availableSeats: 105, basePrice: 320, status: 'AVAILABLE' },
          { time: '01:45 PM', format: 'Dolby Atmos', totalSeats: 140, availableSeats: 70, basePrice: 350, status: 'FILLING_FAST' },
          { time: '05:15 PM', format: 'Dolby Atmos', totalSeats: 140, availableSeats: 22, basePrice: 400, status: 'ALMOST_FULL' },
          { time: '08:45 PM', format: 'Laser 4K', totalSeats: 140, availableSeats: 85, basePrice: 360, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'prasads-multiplex-hyd',
        name: 'Prasads Multiplex: Necklace Road',
        chain: 'Independent',
        mall: 'NTR Gardens, Necklace Road, Hyderabad',
        screenName: 'PCX Large Screen (Audi 06)',
        features: ['PCX Giant Screen', 'Dual 4K Laser', 'Surround Sound', 'Iconic Theater'],
        showtimes: [
          { time: '11:00 AM', format: 'PCX Giant Screen', totalSeats: 180, availableSeats: 140, basePrice: 300, status: 'AVAILABLE' },
          { time: '02:30 PM', format: 'PCX Giant Screen', totalSeats: 180, availableSeats: 90, basePrice: 330, status: 'AVAILABLE' },
          { time: '06:00 PM', format: 'PCX Giant Screen', totalSeats: 180, availableSeats: 35, basePrice: 360, status: 'ALMOST_FULL' },
          { time: '09:30 PM', format: 'PCX Giant Screen', totalSeats: 180, availableSeats: 110, basePrice: 320, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'pvr-forum-sujana-hyd',
        name: 'PVR: Forum Sujana Mall',
        chain: 'PVR',
        mall: 'Kukatpally Housing Board Colony, Hyderabad',
        screenName: 'Audi 03 (Dolby Atmos • 4K)',
        features: ['Dolby Atmos', '4K Projection', 'Plush Rockers', 'Quick Grab'],
        showtimes: [
          { time: '10:15 AM', format: '4K Digital', totalSeats: 100, availableSeats: 80, basePrice: 280, status: 'AVAILABLE' },
          { time: '01:30 PM', format: 'Dolby Atmos', totalSeats: 100, availableSeats: 52, basePrice: 320, status: 'FILLING_FAST' },
          { time: '05:00 PM', format: 'Dolby Atmos', totalSeats: 100, availableSeats: 18, basePrice: 360, status: 'ALMOST_FULL' },
          { time: '08:30 PM', format: '4K Digital', totalSeats: 100, availableSeats: 66, basePrice: 300, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'cinepolis-manjeera-hyd',
        name: 'Cinépolis: Manjeera Mall',
        chain: 'Cinépolis',
        mall: 'JNTU Road, Kukatpally, Hyderabad',
        screenName: 'Screen 02 (RealD 3D)',
        features: ['RealD 3D', 'Dolby 7.1', 'Stadium Seating', 'Nachos Bar'],
        showtimes: [
          { time: '11:30 AM', format: '2D Digital', totalSeats: 90, availableSeats: 72, basePrice: 260, status: 'AVAILABLE' },
          { time: '03:00 PM', format: '2D Digital', totalSeats: 90, availableSeats: 48, basePrice: 290, status: 'AVAILABLE' },
          { time: '06:30 PM', format: '2D Digital', totalSeats: 90, availableSeats: 19, basePrice: 340, status: 'ALMOST_FULL' },
          { time: '10:00 PM', format: '2D Digital', totalSeats: 90, availableSeats: 60, basePrice: 280, status: 'AVAILABLE' },
        ],
      },
    ],
  },
  'pune': {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    cinemas: [
      {
        id: 'pvr-phoenix-viman-nagar',
        name: 'PVR: Phoenix Marketcity',
        chain: 'PVR',
        mall: 'Viman Nagar, Pune',
        screenName: 'Audi 02 (4K Laser • Dolby Atmos)',
        features: ['4K Laser', 'Dolby Atmos', 'Recliner Tier', 'Lounge Bar'],
        showtimes: [
          { time: '10:30 AM', format: '4K Laser', totalSeats: 110, availableSeats: 88, basePrice: 340, status: 'AVAILABLE' },
          { time: '02:00 PM', format: 'Dolby Atmos', totalSeats: 110, availableSeats: 58, basePrice: 380, status: 'FILLING_FAST' },
          { time: '05:30 PM', format: 'Dolby Atmos', totalSeats: 110, availableSeats: 21, basePrice: 440, status: 'ALMOST_FULL' },
          { time: '09:00 PM', format: '4K Laser', totalSeats: 110, availableSeats: 72, basePrice: 380, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'cinepolis-westend-aundh',
        name: 'Cinépolis: Westend Mall',
        chain: 'Cinépolis',
        mall: 'Aundh, Pune',
        screenName: 'VIP Screen 01 (Luxe Recliners)',
        features: ['VIP Lounge', 'Gourmet Dining', 'Dolby 7.1', 'Personal Service'],
        showtimes: [
          { time: '11:15 AM', format: 'VIP Recliner', totalSeats: 75, availableSeats: 60, basePrice: 420, status: 'AVAILABLE' },
          { time: '02:45 PM', format: 'VIP Recliner', totalSeats: 75, availableSeats: 35, basePrice: 480, status: 'FILLING_FAST' },
          { time: '06:15 PM', format: 'VIP Recliner', totalSeats: 75, availableSeats: 14, basePrice: 540, status: 'ALMOST_FULL' },
          { time: '09:45 PM', format: 'VIP Recliner', totalSeats: 75, availableSeats: 50, basePrice: 460, status: 'AVAILABLE' },
        ],
      },
      {
        id: 'inox-amanora-hadapsar',
        name: 'INOX: Amanora Mall',
        chain: 'INOX',
        mall: 'Hadapsar, Pune',
        screenName: 'Insignia Audi 03 (Dolby Atmos)',
        features: ['Insignia Luxury', 'Dolby Atmos', 'Laser Projection', 'Plush Seats'],
        showtimes: [
          { time: '10:45 AM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 76, basePrice: 320, status: 'AVAILABLE' },
          { time: '02:15 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 50, basePrice: 360, status: 'AVAILABLE' },
          { time: '05:45 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 18, basePrice: 420, status: 'ALMOST_FULL' },
          { time: '09:15 PM', format: 'Dolby Atmos', totalSeats: 96, availableSeats: 64, basePrice: 360, status: 'AVAILABLE' },
        ],
      },
    ],
  },
};

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class LocationService {
  private static STORAGE_KEY = 'showpass_user_city_id';

  public static getSavedCityId(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public static saveCityId(cityId: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, cityId);
    } catch {}
  }

  public static getDefaultCity(): CityLocation {
    return CITIES_DATABASE['delhi-ncr'];
  }

  public static getCityById(cityId: string): CityLocation {
    return CITIES_DATABASE[cityId] || this.getDefaultCity();
  }

  public static getAllCities(): CityLocation[] {
    return Object.values(CITIES_DATABASE);
  }

  // Find nearest metro city by coordinates
  public static findNearestCity(lat: number, lng: number): CityLocation {
    let closestCity = this.getDefaultCity();
    let minDistance = Infinity;

    for (const city of Object.values(CITIES_DATABASE)) {
      const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }

    return closestCity;
  }

  // Automatically detect user location via browser GPS or fallback
  public static async autoDetectLocation(): Promise<CityLocation> {
    // 1. Try Browser Geolocation
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 600000, // 10 minutes cache
            enableHighAccuracy: false,
          });
        });

        const nearest = this.findNearestCity(
          position.coords.latitude,
          position.coords.longitude
        );
        this.saveCityId(nearest.id);
        return nearest;
      } catch (geoError) {
        // Geolocation denied or timed out; proceed to IP fallback
      }
    }

    // 2. Try IP Geolocation Fallback
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const nearest = this.findNearestCity(Number(data.latitude), Number(data.longitude));
          this.saveCityId(nearest.id);
          return nearest;
        }
      }
    } catch {
      // Fallback to saved or default
    }

    // 3. Fallback to existing saved city or Delhi NCR
    const saved = this.getSavedCityId();
    if (saved && CITIES_DATABASE[saved]) {
      return CITIES_DATABASE[saved];
    }

    return this.getDefaultCity();
  }
}
