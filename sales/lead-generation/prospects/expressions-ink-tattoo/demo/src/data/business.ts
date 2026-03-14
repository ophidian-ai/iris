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

export const business: BusinessInfo = {
  name: "Expressions Ink Tattoo",
  tagline: "Your Story. Your Skin.",
  phone: "(812) 372-3160",
  email: "expressionsink@yahoo.com",
  address: {
    street: "",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Walk-Ins", time: "Welcome" },
    { day: "Payment", time: "Cash Only (ATM Nearby)" },
  ],
  services: [
    {
      name: "Custom Tattoos",
      description: "One-of-a-kind designs created specifically for you. Every piece is original artwork tailored to your vision.",
      icon: "pencil",
    },
    {
      name: "Cover-Ups",
      description: "Transform old or unwanted tattoos into stunning new artwork. Expert cover-up solutions that exceed expectations.",
      icon: "layers",
    },
    {
      name: "Fine Line Work",
      description: "Delicate, precise linework for elegant and detailed designs. Perfect for minimalist and intricate styles.",
      icon: "pen",
    },
    {
      name: "Black & Gray",
      description: "Classic black and gray shading with depth and dimension. Timeless pieces that age beautifully.",
      icon: "contrast",
    },
    {
      name: "Color Tattoos",
      description: "Vibrant, bold color work that brings your design to life. Rich saturation and smooth blending.",
      icon: "palette",
    },
    {
      name: "Walk-Ins",
      description: "No appointment? No problem. Walk in anytime during business hours for consultations or flash designs.",
      icon: "door",
    },
  ],
  stats: [
    { label: "Reviews", value: "102+" },
    { label: "Recommended", value: "96%" },
    { label: "Custom Art", value: "100%" },
  ],
  reviews: [
    {
      text: "Incredible custom work. They took my rough idea and turned it into something I'm proud to wear every day. The detail is unreal.",
      author: "Marcus T.",
      rating: 5,
    },
    {
      text: "Best cover-up artist in Columbus. My old tattoo was completely transformed into a piece of art. Could not be happier.",
      author: "Sarah K.",
      rating: 5,
    },
    {
      text: "Clean shop, professional artists, and they really listen to what you want. This is the only place I'll go for ink.",
      author: "Jake R.",
      rating: 5,
    },
  ],
};
