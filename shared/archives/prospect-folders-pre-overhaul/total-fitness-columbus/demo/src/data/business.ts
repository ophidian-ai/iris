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
  features?: string[];
}

export const business: BusinessInfo = {
  name: "Total Fitness of Columbus",
  tagline: "Your Fitness Starts Here",
  phone: "(812) 373-9992",
  email: "info@totalfitnessofcolumbus.net",
  address: {
    street: "",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Fri", time: "5:00 AM - 9:00 PM" },
    { day: "Saturday", time: "7:00 AM - 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Gym Memberships",
      description:
        "Flexible membership plans with no long-term contracts. Month-to-month options for every budget and fitness level.",
    },
    {
      name: "Personal Training",
      description:
        "One-on-one sessions with certified trainers who build custom programs tailored to your goals and abilities.",
    },
    {
      name: "Group Fitness Classes",
      description:
        "High-energy group classes from HIIT to yoga. Build community while you build strength.",
    },
    {
      name: "Cardio Equipment",
      description:
        "State-of-the-art treadmills, ellipticals, bikes, and rowers to keep your heart pumping and calories burning.",
    },
    {
      name: "Free Weights",
      description:
        "Full dumbbell racks, barbells, benches, and squat racks for serious strength training.",
    },
    {
      name: "Nutrition Guidance",
      description:
        "Expert advice on fueling your body right. Meal planning support to complement your training program.",
    },
  ],
  stats: [
    { label: "Years Strong", value: "26+" },
    { label: "Members Served", value: "1000s" },
    { label: "Commitment", value: "24/7" },
  ],
  features: [
    "No long-term contracts",
    "Certified trainers",
    "Clean facility",
    "All fitness levels welcome",
    "Locally owned since 1998",
    "Convenient Columbus location",
  ],
};
