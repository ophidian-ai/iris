export interface BusinessInfo {
  name: string;
  tagline: string;
  phone: string;
  email?: string;
  address: { street: string; city: string; state: string; zip: string };
  hours: { day: string; time: string }[];
  services: { name: string; description: string }[];
  stats: { label: string; value: string }[];
  reviews: { text: string; author: string; source: string; rating: number }[];
  trustSignals: string[];
}

export const business: BusinessInfo = {
  name: "SAK Automotive",
  tagline: "Honest Service. Fair Prices.",
  phone: "(812) 372-8000",
  email: "scott.kelsay@sakautomotive.com",
  address: {
    street: "330 Center St",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Fri", time: "8:00 AM - 5:00 PM" },
    { day: "Saturday", time: "8:00 AM - 12:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Auto Repair",
      description:
        "Engine diagnostics, brake repair, transmission work, electrical systems, and complete mechanical repair.",
    },
    {
      name: "Tire Services",
      description:
        "New tire sales, mounting, balancing, rotation, flat repair, and seasonal tire changeovers.",
    },
    {
      name: "Maintenance",
      description:
        "Oil changes, fluid flushes, filter replacement, tune-ups, and factory-scheduled maintenance.",
    },
    {
      name: "Alignment",
      description:
        "Precision wheel alignment, suspension inspection, steering repair, and ride quality diagnostics.",
    },
  ],
  stats: [
    { label: "Years in Business", value: "30+" },
    { label: "Happy Customers", value: "500+" },
    { label: "Satisfaction Rate", value: "99%" },
  ],
  reviews: [
    {
      text: "Most honest mechanic I've ever been to. They actually showed me what was wrong with my car and explained what they'd do to fix it. Didn't try to sell me things I didn't need. I won't take my car anywhere else.",
      author: "Mike Johnson",
      source: "Google Review",
      rating: 5,
    },
    {
      text: "Fair pricing and quality work every time. Had my brakes done here and the price was $200 less than the dealership quoted me. They've been taking care of our family's cars for years now.",
      author: "Sarah Reynolds",
      source: "Google Review",
      rating: 5,
    },
    {
      text: "Brought my truck in with an alignment issue. They fixed it same day and the price was exactly what they quoted. No surprises. These guys are the real deal. Highly recommend to anyone in Bartholomew County.",
      author: "David Whitfield",
      source: "Yelp Review",
      rating: 5,
    },
  ],
  trustSignals: [
    "Chamber of Commerce Member",
    "Locally Owned & Operated",
    "Top-Rated on Google & Yelp",
    "Fair & Transparent Pricing",
  ],
};
