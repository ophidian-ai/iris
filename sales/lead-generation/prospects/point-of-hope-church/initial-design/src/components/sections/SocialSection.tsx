"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Facebook, ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FACEBOOK_URL = "https://www.facebook.com/PointOfHopeApostolicChurch";

interface SocialPost {
  id: number;
  image: string;
  text: string;
  date: string;
  likes: number;
  comments: number;
}

const posts: SocialPost[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop",
    text: "What a beautiful Sunday morning service! Thank you to everyone who joined us in worship today. God is good!",
    date: "March 10, 2026",
    likes: 47,
    comments: 12,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop",
    text: "Our community food drive was a huge success! Together we collected over 500 items for families in need. Thank you for your generosity.",
    date: "March 7, 2026",
    likes: 83,
    comments: 24,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=400&fit=crop",
    text: "Youth group meets every Wednesday at 6:30 PM. Bring a friend and join us for worship, games, and fellowship!",
    date: "March 5, 2026",
    likes: 35,
    comments: 8,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&h=400&fit=crop",
    text: "Volunteers making a difference in our community! Join us this Saturday for our neighborhood cleanup event starting at 9 AM.",
    date: "March 3, 2026",
    likes: 61,
    comments: 15,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=400&fit=crop",
    text: "Praise night was incredible! The presence of God filled the room. If you missed it, join us next month for another powerful evening of worship.",
    date: "February 28, 2026",
    likes: 92,
    comments: 31,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

export default function SocialSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 340;
    const gap = 24;
    const distance = cardWidth + gap;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    // Update after scroll animation
    setTimeout(updateScrollState, 350);
  }

  return (
    <section className="bg-white/35 backdrop-blur-sm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "#1a1a1a" }}
          >
            Stay Connected
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-lg"
            style={{ color: "#535250" }}
          >
            Follow us on Facebook for the latest updates
          </motion.p>
        </div>

        {/* Carousel container */}
        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className={cn(
              "absolute -left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl md:-left-5",
              !canScrollLeft && "pointer-events-none opacity-0"
            )}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: "#3f831c" }} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className={cn(
              "absolute -right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl md:-right-5",
              !canScrollRight && "pointer-events-none opacity-0"
            )}
          >
            <ChevronRight className="h-5 w-5" style={{ color: "#3f831c" }} />
          </button>

          {/* Fade edges */}
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white/35 to-transparent transition-opacity",
              !canScrollLeft && "opacity-0"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white/35 to-transparent transition-opacity",
              !canScrollRight && "opacity-0"
            )}
          />

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="-mx-4 -mt-4 flex gap-6 overflow-x-auto px-4 pt-8 pb-8 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {posts.map((post, i) => (
              <motion.a
                key={post.id}
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group block w-[320px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-xl sm:w-[340px]"
                style={{
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#3f831c";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "transparent";
                }}
              >
                {/* Post image */}
                <div className="relative h-48 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Facebook badge */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
                    <Facebook
                      className="h-3.5 w-3.5"
                      style={{ color: "#1877F2" }}
                    />
                    <span style={{ color: "#535250" }}>Facebook</span>
                  </div>
                </div>

                {/* Post content */}
                <div className="p-5">
                  <p
                    className="line-clamp-3 text-sm leading-relaxed"
                    style={{ color: "#535250" }}
                  >
                    {post.text}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <time
                      className="text-xs"
                      style={{ color: "#535250", opacity: 0.7 }}
                      dateTime={post.date}
                    >
                      {post.date}
                    </time>
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: "#535250", opacity: 0.7 }}
                    >
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Follow button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: "#3f831c" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#2d6114";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#3f831c";
            }}
          >
            <Facebook className="h-5 w-5" />
            Follow Us on Facebook
          </a>
        </motion.div>
      </div>
    </section>
  );
}
