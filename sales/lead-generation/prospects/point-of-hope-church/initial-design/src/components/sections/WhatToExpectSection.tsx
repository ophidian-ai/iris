"use client";

import { motion } from "framer-motion";
import { Smile, Music, BookOpen, Users } from "lucide-react";
import { useState } from "react";

const expectations = [
  {
    icon: Smile,
    title: "Welcoming Atmosphere",
    description:
      "From the moment you walk in, you'll be greeted with warm smiles and open arms. Everyone belongs here.",
  },
  {
    icon: Music,
    title: "Powerful Worship",
    description:
      "Experience heartfelt praise and worship that lifts your spirit and draws you closer to God.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    description:
      "Our services are rooted in God's Word with practical, life-changing messages for everyday living.",
  },
  {
    icon: Users,
    title: "Community Connection",
    description:
      "Find your place in a caring community that supports and encourages one another through every season.",
  },
];

function TiltCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const [transform, setTransform] = useState(
    "perspective(800px) rotateX(0deg) rotateY(0deg)"
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.15s ease-out",
      }}
      className="cursor-default"
    >
      {children}
    </motion.div>
  );
}

export default function WhatToExpectSection() {
  return (
    <section id="expect" className="bg-white/35 backdrop-blur-sm py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-14 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] sm:text-4xl lg:text-5xl"
          >
            What to Expect
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-lg text-[#535250]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Your first visit should feel like coming home
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {expectations.map((item, i) => (
            <TiltCard key={item.title} index={i}>
              <div className="rounded-xl border border-[#3f831c]/10 bg-[#fafaf8] shadow-sm transition-shadow hover:shadow-lg overflow-hidden">
                <div className="h-1 bg-[#3f831c]" />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f5e3]">
                    <item.icon className="h-6 w-6 text-[#3f831c]" />
                  </div>
                  <h3
                    className="mb-2 text-lg font-semibold text-[#1a1a1a]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-[#535250]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
