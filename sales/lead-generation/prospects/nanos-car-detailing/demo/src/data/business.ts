export interface BusinessInfo {
  name: string;
  tagline: string;
  phone: string;
  textPhone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: { day: string; time: string }[];
  services: { name: string; description: string; image?: string }[];
  socialLinks?: { platform: string; url: string }[];
  stats?: { label: string; value: string }[];
  reviews?: { text: string; author: string; rating: number }[];
  features?: string[];
}

export const business: BusinessInfo = {
  name: "Nano's Car Detailing & Cleaning",
  tagline: "Premium Car Detailing You Can Trust",
  phone: "(812) 343-1008",
  textPhone: "(812) 603-2335",
  address: {
    street: "2161 State Street",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Sat", time: "8:00 AM - 5:00 PM" },
    { day: "Walk-Ins", time: "8:00 AM - 12:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Full Detail Package",
      description: "Complete interior and exterior detailing for a showroom-quality finish inside and out.",
      image: "/images/detail-lambo.jpg",
    },
    {
      name: "Interior Cleaning",
      description: "Deep cleaning of seats, carpets, dashboard, and all interior surfaces.",
      image: "/images/detail-clean.jpg",
    },
    {
      name: "Exterior Wash & Wax",
      description: "Hand wash, clay bar treatment, and protective wax coating for lasting shine.",
      image: "/images/detail-polish.jpg",
    },
    {
      name: "Ceramic Coating",
      description: "Long-lasting ceramic protection that keeps your paint looking new for years.",
    },
    {
      name: "Paint Correction",
      description: "Remove swirl marks, scratches, and oxidation to restore your paint's original luster.",
    },
    {
      name: "Engine Cleaning",
      description: "Professional engine bay cleaning and dressing for a clean, well-maintained engine compartment.",
    },
  ],
  stats: [
    { label: "Years in Business", value: "12+" },
    { label: "Reviews", value: "118+" },
    { label: "Star Rating", value: "4.7" },
  ],
  reviews: [
    {
      text: "Best detailing in Columbus, hands down. My truck looked brand new when they were done. The attention to detail is unmatched.",
      author: "James R.",
      rating: 5,
    },
    {
      text: "Nano and his team are incredible. They got stains out of my seats that I thought were permanent. Will never go anywhere else.",
      author: "Maria S.",
      rating: 5,
    },
    {
      text: "Had my car ceramic coated here and the results are outstanding. Six months later it still beads water like day one. Highly recommend.",
      author: "David K.",
      rating: 5,
    },
  ],
  features: [
    "5% discount for seniors and military",
    "Bilingual EN/ES",
    "Walk-ins welcome",
    "Free Wi-Fi",
  ],
};
