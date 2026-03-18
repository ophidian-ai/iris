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
  owners?: string;
  since?: string;
  certifications?: string[];
}

export const business: BusinessInfo = {
  name: "Voelz Body Shop, Inc.",
  tagline: "Columbus' Trusted Collision Repair Experts",
  phone: "(812) 376-8868",
  email: "gloria@voelzbodyshop.com",
  address: {
    street: "3471 Market St",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  owners: "Jeff and Gloria Voelz",
  since: "1980",
  certifications: ["I-CAR Gold Class", "BBB Accredited"],
  hours: [
    { day: "Mon-Fri", time: "8:00 AM - 5:00 PM" },
    { day: "Saturday", time: "Closed" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Collision Repair",
      description: "Complete collision repair services restoring your vehicle to pre-accident condition with precision craftsmanship.",
    },
    {
      name: "Paintless Dent Removal",
      description: "Remove dents and dings without affecting your factory paint finish. Fast turnaround, flawless results.",
    },
    {
      name: "Frame Straightening",
      description: "Advanced computerized frame straightening to restore your vehicle's structural integrity to factory specs.",
    },
    {
      name: "Auto Painting",
      description: "Expert color matching and refinishing using premium paints for a seamless, factory-quality finish.",
    },
    {
      name: "Insurance Claims",
      description: "We work directly with all major insurance companies to streamline your claims process from start to finish.",
    },
    {
      name: "Free Estimates",
      description: "Get a no-obligation estimate on any repair. Walk in or call to schedule your free assessment today.",
    },
  ],
  stats: [
    { label: "Years in Business", value: "40+" },
    { label: "Certification", value: "I-CAR Gold" },
    { label: "Rating", value: "BBB A+" },
    { label: "Insurance", value: "All Accepted" },
  ],
};
