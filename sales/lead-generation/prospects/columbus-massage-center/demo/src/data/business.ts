export interface BusinessInfo {
  name: string;
  tagline: string;
  phone: string;
  email?: string;
  address: { street: string; city: string; state: string; zip: string };
  hours: { day: string; time: string }[];
  services: { name: string; description: string }[];
  stats: { label: string; value: string }[];
  reviews: { text: string; author: string; role: string; rating: number }[];
}

export const business: BusinessInfo = {
  name: "Columbus Massage Center & Salon",
  tagline: "Your Sanctuary for Relaxation & Renewal",
  phone: "(812) 378-2880",
  email: "dana@columbusmassagecenter.com",
  address: { street: "3126 17th Street", city: "Columbus", state: "IN", zip: "47201" },
  hours: [
    { day: "Mon-Sat", time: "9:00 AM - 7:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    { name: "Massage Therapy", description: "Swedish, deep tissue, hot stone, and therapeutic massage to melt away tension and restore balance." },
    { name: "Hair Services", description: "Expert cuts, color, highlights, balayage, and styling for every occasion and every hair type." },
    { name: "Waxing", description: "Gentle, precise waxing services for face and body using premium products for smooth, lasting results." },
    { name: "Facials", description: "Customized facial treatments that cleanse, exfoliate, and rejuvenate for a radiant, healthy glow." },
    { name: "Nail Services", description: "Manicures, pedicures, gel nails, and nail art -- a pampering experience from fingertips to toes." },
  ],
  stats: [
    { label: "Five-Star Reviews", value: "250+" },
    { label: "Years of Excellence", value: "11+" },
    { label: "Locally Owned", value: "Yes" },
  ],
  reviews: [
    { text: "I have been coming here for years and it is always an incredible experience. The deep tissue massage completely relieved the tension I had been carrying for months. The atmosphere is so calming -- it feels like a true escape from the outside world.", author: "Sarah H.", role: "Regular Client", rating: 5 },
    { text: "Best hair salon experience I have had in Columbus. My stylist listened to exactly what I wanted and delivered beautifully. The color was perfect, and they took the time to teach me how to maintain it at home. Will not go anywhere else.", author: "Michelle R.", role: "Hair Client", rating: 5 },
    { text: "From the moment you walk in, you feel welcome. The staff is so friendly and professional. I treated myself to the facial and it was absolutely heavenly. My skin has never looked better. This place is a hidden gem right here in Columbus.", author: "Jennifer T.", role: "Facial & Spa Client", rating: 5 },
  ],
};
