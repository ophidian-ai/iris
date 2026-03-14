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
  name: "Tailwagger's Grooming Salon",
  tagline: "Where Every Pup Leaves Looking Their Best",
  phone: "(812) 372-1546",
  address: {
    street: "2370 N National Rd",
    city: "Columbus",
    state: "IN",
    zip: "47201",
  },
  hours: [
    { day: "Mon-Fri", time: "7:30 AM - 4:00 PM" },
    { day: "Saturday", time: "By Appointment" },
    { day: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Full Grooming",
      description: "Complete bath, haircut, nail trim, ear cleaning, and finishing touches for a head-to-tail transformation.",
    },
    {
      name: "Bath & Brush",
      description: "Refreshing bath with premium shampoo, thorough brushing, and blow-dry to keep your pup clean and fluffy.",
    },
    {
      name: "Nail Trimming",
      description: "Quick and gentle nail trimming to keep paws healthy and prevent discomfort from overgrown nails.",
    },
    {
      name: "Ear Cleaning",
      description: "Gentle ear cleaning to remove buildup and help prevent infections, keeping your dog comfortable.",
    },
    {
      name: "De-Shedding Treatment",
      description: "Specialized treatment to reduce loose fur and undercoat, keeping your home cleaner and coat healthier.",
    },
    {
      name: "Puppy's First Groom",
      description: "A gentle, patient introduction to grooming for puppies. We make their first experience positive and stress-free.",
    },
  ],
  stats: [
    { value: "18+", label: "Years" },
    { value: "272+", label: "Reviews" },
    { value: "#1", label: "Voted" },
    { value: "5 Star", label: "Rating" },
  ],
  reviews: [
    {
      text: "Jacqueline is amazing with our anxious rescue. He comes out looking great and actually seems to enjoy going now. Best groomer in Columbus!",
      author: "Sarah M.",
      rating: 5,
    },
    {
      text: "We've been bringing our dogs here for over 10 years. The care and attention to detail is unmatched. They truly love animals.",
      author: "David R.",
      rating: 5,
    },
    {
      text: "My poodle always comes back looking like a show dog. The staff is gentle, professional, and always on time. Highly recommend!",
      author: "Jennifer L.",
      rating: 5,
    },
  ],
};
