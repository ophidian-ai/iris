export interface BusinessInfo {
  name: string;
  tagline: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: { day: string; time: string }[];
  services: { name: string; description: string; icon?: string }[];
  socialLinks?: { platform: string; url: string }[];
  stats?: { label: string; value: string }[];
  reviews?: { text: string; author: string; rating: number }[];
}

// Override this per demo
export const business: BusinessInfo = {
  name: "Business Name",
  tagline: "Your tagline here",
  phone: "(555) 000-0000",
  address: {
    street: "123 Main St",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Fri", time: "8:00 AM - 5:00 PM" },
    { day: "Saturday", time: "By Appointment" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [],
  stats: [],
  reviews: [],
};
