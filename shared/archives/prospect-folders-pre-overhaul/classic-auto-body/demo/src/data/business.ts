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
  stats: { label: string; value: string }[];
  reviews: { text: string; author: string; rating: number }[];
}

export const business: BusinessInfo = {
  name: "Classic Auto Body",
  tagline: "Trusted Collision Repair in Columbus",
  phone: "(812) 372-9360",
  address: {
    street: "472 Center St",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Fri", time: "8:00 AM - 5:00 PM" },
    { day: "Saturday", time: "By Appointment" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Collision Repair",
      description:
        "Complete collision repair services to restore your vehicle to pre-accident condition. We work with all insurance companies.",
    },
    {
      name: "Auto Painting",
      description:
        "Professional auto painting and refinishing. Factory-match color blending for a seamless finish every time.",
    },
    {
      name: "Frame Straightening",
      description:
        "Precision frame and unibody straightening using computerized measuring systems for accurate repairs.",
    },
    {
      name: "Dent Removal",
      description:
        "Expert dent repair for minor dings to major damage. Paintless dent removal available for qualifying vehicles.",
    },
  ],
  stats: [
    { label: "Years in Business", value: "10+" },
    { label: "Customer Reviews", value: "75+" },
    { label: "Recommendation Rate", value: "100%" },
    { label: "Family Owned", value: "Yes" },
  ],
  reviews: [
    {
      text: "Classic Auto Body did an amazing job on my car. You can't even tell it was in an accident. Highly recommend!",
      author: "Satisfied Customer",
      rating: 5,
    },
    {
      text: "Jim and his team are honest, skilled, and they stand behind their work. Best body shop in Columbus.",
      author: "Loyal Customer",
      rating: 5,
    },
    {
      text: "Fast turnaround and excellent communication throughout the repair process. They worked directly with my insurance.",
      author: "Happy Customer",
      rating: 5,
    },
  ],
};
