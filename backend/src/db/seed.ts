import bcrypt from "bcrypt";
import { DatabaseClient, getDatabase, initDatabase } from "../config/database";
import { logger } from "../utils/logger";

export async function seedData(db?: DatabaseClient) {
  const client = db || getDatabase();
  logger.info("Starting seed process with District-inspired movie catalogue...");

  // 1. Seed demo users
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const userResult = await client.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES 
      ('organizer@showpass.com', $1, 'Starlight Theatres & Studio', 'ORGANIZER'),
      ('john@example.com', $1, 'John Doe', 'CUSTOMER'),
      ('sarah@example.com', $1, 'Sarah Jenkins', 'CUSTOMER')
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id, email, role;
  `, [passwordHash]);

  const organizer = userResult.rows.find((u: any) => u.role === "ORGANIZER") || userResult.rows[0];
  const organizerId = organizer?.id;

  // 2. Demo events (District by Zomato real movies + concerts & comedy)
  const events = [
    {
      title: "Hanuman Ansh",
      description: "After a devastating loss, a young boy embarks on a transformative spiritual journey inspired by Neem Karoli Baba. Along the way, faith, compassion and selfless service reshape his understanding of life. Accessibility through Audio Description (AD) & Closed Captions (CC) is available for this movie on the XL Cinema app.",
      category: "Movies",
      venue: "CINTEL CineStar Grand IMAX, Screen 01, Sector 29",
      event_date: "2026-10-10",
      event_time: "19:30",
      price: 380.00,
      rows: 8,
      cols: 12,
      cover_image_url: "/posters/hanuman_ansh.png",
      backdrop_url: "/posters/hanuman_ansh.png",
      certification: "U",
      language: "Hindi",
      duration: "2h 30m",
      genres: JSON.stringify(["Biography", "Devotional", "Drama"]),
      release_date: "Released 7 August 2026",
      cast_members: JSON.stringify([
        { name: "Shobhinaw Satyaa", role: "Actor", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        { name: "Anil Rastogi", role: "Actor", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
        { name: "Gulshan Pandey", role: "Actor", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        { name: "Chandan K Anand", role: "Actor", avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" },
        { name: "Vishal Chaturvedi", role: "Director", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "News18", rating: "3.5/5", comment: "A soulful spiritual journey that resonates deeply with faith and selfless devotion." },
        { source: "Times of India", rating: "4.0/5", comment: "Visually evocative and spiritually uplifting with remarkable depth of character." }
      ])
    },
    {
      title: "Mirzapur: The Movie",
      description: "The fierce war for Purvanchal throne moves from the small screen to the 70mm cinematic arena. Akhandanand Tripathi and Guddu Pandit collide in an unapologetic, explosive confrontation.",
      category: "Movies",
      venue: "PVR Directors Cut, Ambience Mall, Gurugram",
      event_date: "2026-10-12",
      event_time: "20:45",
      price: 480.00,
      rows: 9,
      cols: 14,
      cover_image_url: "/posters/mirzapur.png",
      backdrop_url: "/posters/mirzapur.png",
      certification: "A",
      language: "Hindi",
      duration: "2h 45m",
      genres: JSON.stringify(["Action", "Crime", "Thriller"]),
      release_date: "Released 14 August 2026",
      cast_members: JSON.stringify([
        { name: "Pankaj Tripathi", role: "Kaleen Bhaiya", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
        { name: "Ali Fazal", role: "Guddu Pandit", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
        { name: "Shweta Tripathi", role: "Golu Gupta", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
        { name: "Gurmmeet Singh", role: "Director", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Film Companion", rating: "4.2/5", comment: "Pankaj Tripathi commands the screen with chilling magnetic authority." }
      ])
    },
    {
      title: "Resident Evil",
      description: "A catastrophic breach at the subterranean Hive laboratories releases a genetically engineered bio-weapon. Special tactical operative teams must infiltrate and survive the mutated hordes before the surface is breached.",
      category: "Movies",
      venue: "CineStar 4DX, Mall of India",
      event_date: "2026-10-15",
      event_time: "21:30",
      price: 420.00,
      rows: 8,
      cols: 12,
      cover_image_url: "/posters/resident_evil.png",
      backdrop_url: "/posters/resident_evil.png",
      certification: "A",
      language: "English and 1 more",
      duration: "1h 58m",
      genres: JSON.stringify(["Action", "Horror", "Sci-Fi"]),
      release_date: "Released 21 August 2026",
      cast_members: JSON.stringify([
        { name: "Milla Jovovich", role: "Alice", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
        { name: "Michelle Rodriguez", role: "Rain Ocampo", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        { name: "Paul W.S. Anderson", role: "Director", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "IGN", rating: "3.8/5", comment: "Relentless pulse-pounding tension with signature horror choreography." }
      ])
    },
    {
      title: "Haiwaan",
      description: "High in an unforgiving snowbound valley, an ancient legend awakens. What begins as a routine geological expedition turns into an intense psychological struggle against a creature of myth.",
      category: "Movies",
      venue: "Wave Cinemas, Sector 18",
      event_date: "2026-10-16",
      event_time: "18:00",
      price: 360.00,
      rows: 7,
      cols: 12,
      cover_image_url: "/posters/haiwaan.png",
      backdrop_url: "/posters/haiwaan.png",
      certification: "UA16+",
      language: "Hindi",
      duration: "2h 15m",
      genres: JSON.stringify(["Horror", "Mystery", "Thriller"]),
      release_date: "Released 28 August 2026",
      cast_members: JSON.stringify([
        { name: "Vijay Varma", role: "Dr. Dev", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        { name: "Radhika Apte", role: "Inspector Maya", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "NDTV Movies", rating: "4.0/5", comment: "Atmospheric and bone-chilling, with stellar sound design." }
      ])
    },
    {
      title: "Avengers Endgame: Encore",
      description: "Experience the climactic final stand of Earth Heroes remastered in laser IMAX 70mm with restored extended footage and Dolby Atmos three-dimensional spatial audio.",
      category: "Movies",
      venue: "IMAX Laser Luxe, Horizon Plaza",
      event_date: "2026-10-18",
      event_time: "19:00",
      price: 650.00,
      rows: 10,
      cols: 14,
      cover_image_url: "/posters/avengers_endgame.jpg",
      backdrop_url: "/posters/avengers_endgame.jpg",
      certification: "UA16+",
      language: "English",
      duration: "3h 02m",
      genres: JSON.stringify(["Action", "Sci-Fi", "Adventure"]),
      release_date: "Released 4 September 2026",
      cast_members: JSON.stringify([
        { name: "Robert Downey Jr.", role: "Tony Stark / Iron Man", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
        { name: "Chris Evans", role: "Steve Rogers", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        { name: "Anthony & Joe Russo", role: "Directors", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Rotten Tomatoes", rating: "94%", comment: "A masterclass in cinematic culmination that demands to be seen on the biggest screen." }
      ])
    },
    {
      title: "Vibe",
      description: "A colorful, vibrant comedy tracking two rival destination wedding coordinators forced to join forces for the most chaotic and high-profile royal Punjabi wedding of the decade.",
      category: "Movies",
      venue: "DT Star Cinema, DLF Phase 5",
      event_date: "2026-10-19",
      event_time: "17:30",
      price: 340.00,
      rows: 7,
      cols: 10,
      cover_image_url: "/posters/vibe.jpg",
      backdrop_url: "/posters/vibe.jpg",
      certification: "A",
      language: "Hindi",
      duration: "2h 10m",
      genres: JSON.stringify(["Comedy", "Romance"]),
      release_date: "Released 11 September 2026",
      cast_members: JSON.stringify([
        { name: "Diljit Dosanjh", role: "Happy Singh", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
        { name: "Shehnaaz Gill", role: "Simran Kaur", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Bollywood Hungama", rating: "3.5/5", comment: "Pure entertainer filled with infectious laughs and catchy music." }
      ])
    },
    {
      title: "Daayra",
      description: "A fast-paced legal and crime thriller following an incorruptible female police officer as she untangles a complex conspiracy surrounding an elite academy.",
      category: "Movies",
      venue: "Carnival Odeon, Connaught Place",
      event_date: "2026-10-20",
      event_time: "19:15",
      price: 320.00,
      rows: 8,
      cols: 12,
      cover_image_url: "/posters/daayra.png",
      backdrop_url: "/posters/daayra.png",
      certification: "U",
      language: "Hindi",
      duration: "2h 20m",
      genres: JSON.stringify(["Drama", "Mystery"]),
      release_date: "Released 18 September 2026",
      cast_members: JSON.stringify([
        { name: "Prithviraj Sukumaran", role: "ACP Vikram", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        { name: "Kareena Kapoor Khan", role: "Inspector Maya", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "The Hindu", rating: "4.0/5", comment: "Intelligent storytelling with authentic investigative grit." }
      ])
    },
    {
      title: "Fall 2: Deadpoint",
      description: "Suspended 2,500 feet above the ground on a sheer granite monolith, an unexpected rockslide demolishes all climbing anchors, forcing two survivors into a desperate battle for survival.",
      category: "Movies",
      venue: "PVR Gold Class, Cyber Hub",
      event_date: "2026-10-22",
      event_time: "21:00",
      price: 520.00,
      rows: 8,
      cols: 12,
      cover_image_url: "/posters/fall_2.png",
      backdrop_url: "/posters/fall_2.png",
      certification: "A",
      language: "English",
      duration: "1h 48m",
      genres: JSON.stringify(["Survival", "Thriller"]),
      release_date: "Released 25 September 2026",
      cast_members: JSON.stringify([
        { name: "Grace Caroline Currey", role: "Becky", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
        { name: "Scott Mann", role: "Director", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Empire", rating: "4.0/5", comment: "Nail-biting vertigo that will keep your heart in your throat from start to finish." }
      ])
    },
    {
      title: "The Odyssey",
      description: "Homer epic brought to the screen with grand visual splendor, capturing the perilous ten-year journey home across monster-infested seas.",
      category: "Movies",
      venue: "CineStar IMAX, Ambience Mall",
      event_date: "2026-10-25",
      event_time: "19:45",
      price: 580.00,
      rows: 9,
      cols: 14,
      cover_image_url: "/posters/the_odyssey.png",
      backdrop_url: "/posters/the_odyssey.png",
      certification: "UA16+",
      language: "English",
      duration: "2h 50m",
      genres: JSON.stringify(["Historical", "Epic", "Adventure"]),
      release_date: "Released 2 October 2026",
      cast_members: JSON.stringify([
        { name: "Ralph Fiennes", role: "Odysseus", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
        { name: "Juliette Binoche", role: "Penelope", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Total Film", rating: "4.5/5", comment: "A monumental cinematic achievement with awe-inspiring visual scope." }
      ])
    },
    {
      title: "Spider-Man: Brand New Day",
      description: "Peter Parker starts fresh in a gritty, grounded New York, taking on street-level syndicates while striving to balance college life and the heavy mantle of Spider-Man.",
      category: "Movies",
      venue: "PVR Luxe, Vegas Mall, Dwarka",
      event_date: "2026-10-28",
      event_time: "20:15",
      price: 490.00,
      rows: 8,
      cols: 12,
      cover_image_url: "/posters/spiderman.png",
      backdrop_url: "/posters/spiderman.png",
      certification: "UA16+",
      language: "English",
      duration: "2h 25m",
      genres: JSON.stringify(["Action", "Adventure", "Fantasy"]),
      release_date: "Released 9 October 2026",
      cast_members: JSON.stringify([
        { name: "Tom Holland", role: "Peter Parker / Spider-Man", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
        { name: "Zendaya", role: "MJ", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        { name: "Jon Watts", role: "Director", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" }
      ]),
      reviews: JSON.stringify([
        { source: "Collider", rating: "4.3/5", comment: "Fresh, grounded, and exhilarating web-slinging spectacle." }
      ])
    },
    {
      title: "Neon Odyssey: Electronic Music Tour 2026",
      description: "Experience a transcendent audio-visual spectacle with world-renowned electronic synth artists, state-of-the-art spatial audio, and mind-bending laser projection mapping.",
      category: "Concerts",
      venue: "Skyline Arena, Hall 1",
      event_date: "2026-10-15",
      event_time: "20:00",
      price: 1200.00,
      rows: 8,
      cols: 12,
      cover_image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
      certification: "18+",
      language: "Live Music",
      duration: "3h 30m",
      genres: JSON.stringify(["Electronic", "EDM", "Live Show"]),
      release_date: "15 October 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "Coldplay: Music of the Spheres Tour 2026",
      description: "Experience the record-breaking cosmic stadium tour with chromatic laser kinetics, kinetic dance floors, immersive wristband LED arrays, and anthemic choruses.",
      category: "Concerts",
      venue: "DY Patil Stadium, Navi Mumbai",
      event_date: "2026-10-24",
      event_time: "19:00",
      price: 2500.00,
      rows: 10,
      cols: 14,
      cover_image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80",
      certification: "U",
      language: "English",
      duration: "2h 45m",
      genres: JSON.stringify(["Rock", "Pop", "Stadium Live"]),
      release_date: "24 October 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "Arijit Singh: Symphony of Soul Live",
      description: "India's most celebrated voice in an intimate grand orchestral performance featuring a 60-piece acoustic ensemble, string quartets, and unforgettable soulful melodies.",
      category: "Concerts",
      venue: "Jio World Garden, BKC, Mumbai",
      event_date: "2026-10-26",
      event_time: "18:30",
      price: 1800.00,
      rows: 9,
      cols: 12,
      cover_image_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
      certification: "U",
      language: "Hindi",
      duration: "3h 00m",
      genres: JSON.stringify(["Sufi", "Bollywood", "Acoustic"]),
      release_date: "26 October 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "Sunburn Arena: Electro Carnival 2026",
      description: "Asia's premier outdoor dance music festival featuring global headliner DJs, earth-shaking bass soundstages, pyrotechnic displays, and laser mapping under the open night sky.",
      category: "Concerts",
      venue: "Mahalaxmi Racecourse, Mumbai",
      event_date: "2026-10-30",
      event_time: "16:00",
      price: 1500.00,
      rows: 8,
      cols: 14,
      cover_image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
      certification: "18+",
      language: "Electronic",
      duration: "6h 00m",
      genres: JSON.stringify(["EDM", "Festival", "Dance"]),
      release_date: "30 October 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "Dil-Luminati Arena Tour: Diljit Dosanjh",
      description: "High-voltage Bhangra beats meet international arena pop production as Diljit Dosanjh sets the stage on fire with historic energy and chart-topping bangers.",
      category: "Concerts",
      venue: "Indira Gandhi Indoor Stadium, New Delhi",
      event_date: "2026-11-02",
      event_time: "19:30",
      price: 2200.00,
      rows: 10,
      cols: 14,
      cover_image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80",
      certification: "U",
      language: "Punjabi, Hindi",
      duration: "2h 30m",
      genres: JSON.stringify(["Punjabi Pop", "Bhangra", "Arena Live"]),
      release_date: "2 November 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "Anoushka Shankar: Global Sitar Symphony",
      description: "Nine-time Grammy nominee Anoushka Shankar leads a transcendent fusion of traditional Indian classical ragas with contemporary orchestral compositions.",
      category: "Concerts",
      venue: "NCPA Tata Theatre, Nariman Point, Mumbai",
      event_date: "2026-11-08",
      event_time: "19:00",
      price: 1400.00,
      rows: 8,
      cols: 12,
      cover_image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80",
      certification: "U",
      language: "Classical Fusion",
      duration: "2h 15m",
      genres: JSON.stringify(["Classical", "World Fusion", "Instrumental"]),
      release_date: "8 November 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    },
    {
      title: "The Laugh Riot Tour: Stand-up Comedy Special",
      description: "An evening of non-stop laughter featuring premier stand-up comedians delivering unfiltered humor on modern life, work, and relationships.",
      category: "Comedy",
      venue: "The Comedy Club Underground",
      event_date: "2026-10-22",
      event_time: "21:00",
      price: 600.00,
      rows: 6,
      cols: 10,
      cover_image_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=80",
      certification: "16+",
      language: "Hindi, English",
      duration: "1h 45m",
      genres: JSON.stringify(["Stand-up", "Comedy"]),
      release_date: "22 October 2026",
      cast_members: JSON.stringify([]),
      reviews: JSON.stringify([])
    }
  ];

  // Clear old seed events and seats so fresh metadata and poster paths are applied cleanly
  await client.query('DELETE FROM bookings');
  await client.query('DELETE FROM seats');
  await client.query('DELETE FROM events');

  for (const ev of events) {
    const evRes = await client.query(`
      INSERT INTO events (
        title, description, category, venue, event_date, event_time, price, rows, cols, 
        cover_image_url, backdrop_url, certification, language, duration, genres, release_date, 
        cast_members, reviews, organizer_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id;
    `, [
      ev.title, ev.description, ev.category, ev.venue, ev.event_date, ev.event_time, ev.price, ev.rows, ev.cols,
      ev.cover_image_url, ev.backdrop_url, ev.certification, ev.language, ev.duration, ev.genres, ev.release_date,
      ev.cast_members, ev.reviews, organizerId
    ]);

    const eventId = evRes.rows[0].id;

    // Generate seats for the event
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < ev.rows; r++) {
      const rowLabel = rowLetters[r];
      let tier = "STANDARD";
      let multiplier = 1.0;
      if (r < 2) {
        tier = "VIP";
        multiplier = 1.5;
      } else if (r < Math.ceil(ev.rows / 2) + 1) {
        tier = "PREMIUM";
        multiplier = 1.25;
      }

      for (let c = 1; c <= ev.cols; c++) {
        const seatNumber = `${rowLabel}${c}`;
        await client.query(`
          INSERT INTO seats (event_id, row_label, col_number, seat_number, seat_tier, price_multiplier, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE')
          ON CONFLICT (event_id, row_label, col_number) DO NOTHING;
        `, [eventId, rowLabel, c, seatNumber, tier, multiplier]);
      }
    }
  }

  logger.info("Database seeded successfully with all 10 District movies and live shows.");
}

if (require.main === module) {
  (async () => {
    try {
      const db = await initDatabase();
      await seedData(db);
      process.exit(0);
    } catch (err) {
      logger.error("Seeding failed:", err);
      process.exit(1);
    }
  })();
}
