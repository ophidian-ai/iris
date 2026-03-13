"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface TeamMember {
  name: string;
  title: string;
  bio: string;
  src: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Pastor Stephen Gossage",
    title: "Senior Pastor",
    bio: "Pastor Gossage has dedicated his life to ministry, guiding the Point of Hope community with compassion, wisdom, and unwavering faith in God's Word. His heart for people and passion for the Gospel have been the foundation of this church's growth and mission.",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
  },
];

export default function TeamSection() {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % teamMembers.length);
  };

  const handlePrev = () => {
    setActive(
      (prev) => (prev - 1 + teamMembers.length) % teamMembers.length
    );
  };

  return (
    <section id="team" className="bg-[#f5f3ee]/30 backdrop-blur-sm py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-14 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] sm:text-4xl lg:text-5xl"
          >
            Meet Our Pastor
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
          />
        </div>

        {/* Team Member Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20"
        >
          {/* Image */}
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: index === active ? 1 : 0.7,
                    scale: index === active ? 1 : 0.95,
                    zIndex: index === active ? 999 : teamMembers.length - index,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    unoptimized
                    src={member.src}
                    alt={member.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-lg"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <h3
                  className="text-2xl font-bold text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {teamMembers[active].name}
                </h3>
                <p
                  className="text-sm font-medium text-[#3f831c]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {teamMembers[active].title}
                </p>
                <p
                  className="mt-8 text-lg leading-relaxed text-[#535250]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {teamMembers[active].bio}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {teamMembers.length > 1 && (
              <div className="flex gap-4 pt-12 md:pt-0">
                <button
                  onClick={handlePrev}
                  className="group/button flex h-8 w-8 items-center justify-center rounded-full bg-[#f0b012]"
                >
                  <IconArrowLeft className="h-5 w-5 text-[#1a1a1a] transition-transform duration-300 group-hover/button:rotate-12" />
                </button>
                <button
                  onClick={handleNext}
                  className="group/button flex h-8 w-8 items-center justify-center rounded-full bg-[#f0b012]"
                >
                  <IconArrowRight className="h-5 w-5 text-[#1a1a1a] transition-transform duration-300 group-hover/button:-rotate-12" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
