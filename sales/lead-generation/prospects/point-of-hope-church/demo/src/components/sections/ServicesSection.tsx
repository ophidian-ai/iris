"use client";

import { motion } from "framer-motion";
import { Sun, Heart, BookOpen, MapPin } from "lucide-react";

const services = [
  {
    icon: Sun,
    name: "Sunday Worship Service",
    time: "10:00 AM - 12:00 PM",
    description:
      "Join us for a powerful time of praise, worship, and the Word. All are welcome to experience the hope and joy of Pentecost.",
  },
  {
    icon: Heart,
    name: "Tuesday Prayer Meeting",
    time: "6:00 PM - 7:00 PM",
    description:
      "Come together in prayer as we lift up our community and seek God's guidance and direction for our lives.",
  },
  {
    icon: BookOpen,
    name: "Wednesday Bible Study",
    time: "7:00 PM - 8:30 PM",
    description:
      "Dive deeper into God's Word with interactive study and group discussion. Grow in understanding and faith.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="bg-[#f5f3ee]/20 backdrop-blur-sm py-20 md:py-28">
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
            Worship Services
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
            className="mt-4 text-lg text-[#2d2b28]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Join us throughout the week for worship, prayer, and fellowship
          </motion.p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group rounded-xl border border-[#3f831c]/10 bg-[#fafaf8] p-8 text-center shadow-sm transition-all hover:shadow-lg hover:border-[#3f831c]/25"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5e3] transition-colors group-hover:bg-[#3f831c]">
                <service.icon className="h-8 w-8 text-[#3f831c] transition-colors group-hover:text-white" />
              </div>
              <h3
                className="mb-2 text-xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {service.name}
              </h3>
              <p
                className="mb-4 text-lg font-semibold text-[#3f831c]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {service.time}
              </p>
              <p
                className="text-sm leading-relaxed text-[#2d2b28]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-[#2d2b28]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <MapPin className="h-4 w-4 text-[#3f831c]" />
          <span>5150 Shelbyville Road, Indianapolis, IN 46237</span>
        </motion.div>
      </div>
    </section>
  );
}
