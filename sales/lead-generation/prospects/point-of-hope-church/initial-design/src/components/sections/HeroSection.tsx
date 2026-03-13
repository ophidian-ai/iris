"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Phone, MapPin, Facebook } from "lucide-react";

const contactItems = [
  {
    icon: Globe,
    label: "pointofhopechurch.com",
    href: "https://pointofhopechurch.com",
  },
  {
    icon: Phone,
    label: "317-782-1502",
    href: "tel:3177821502",
  },
  {
    icon: MapPin,
    label: "5150 Shelbyville Road, Indianapolis, IN 46237",
    href: "https://maps.google.com/?q=5150+Shelbyville+Road+Indianapolis+IN+46237",
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function HeroSection() {
  return (
    <motion.section
      id="hero"
      className={cn(
        "relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row"
      )}
      style={{ backgroundColor: "#1a3a12" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side: Content */}
      <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16">
        {/* Top Section: Logo & Main Content */}
        <div>
          {/* Logo */}
          <motion.header className="mb-12" variants={itemVariants}>
            <div className="flex items-center">
              <div className="mr-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f3ee] shadow-md">
                <img
                  src="https://pointofhopechurch.com/wp-content/themes/point-of-hope/images/logo.png"
                  alt="Point of Hope Apostolic Church Logo"
                  className="h-14 w-auto"
                />
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <motion.main variants={containerVariants}>
            <motion.h1
              className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#f5f3ee",
              }}
              variants={itemVariants}
            >
              Point of{" "}
              <span style={{ color: "#f0b012" }}>Hope</span>
              <br />
              Apostolic Church
            </motion.h1>

            <motion.div
              className="my-6 h-1 w-20"
              style={{ backgroundColor: "#f0b012" }}
              variants={itemVariants}
            />

            <motion.p
              className="mb-8 max-w-md text-base leading-relaxed md:text-lg"
              style={{
                fontFamily: "var(--font-inter)",
                color: "#c8c5be",
              }}
              variants={itemVariants}
            >
              A welcoming community rooted in faith, love, and the
              transformative power of God&apos;s Word. Come as you are and
              discover your place of hope.
            </motion.p>

            <motion.a
              href="#services"
              className="inline-block rounded-full px-8 py-3 text-lg font-bold tracking-wide text-white transition-all hover:brightness-110"
              style={{
                backgroundColor: "#3f831c",
                fontFamily: "var(--font-inter)",
              }}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Join Us Sunday
            </motion.a>

            {/* Facebook Link */}
            <motion.div className="mt-6" variants={itemVariants}>
              <a
                href="https://www.facebook.com/PointOfHopeApostolicChurch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                style={{ color: "#f0b012" }}
              >
                <Facebook className="h-5 w-5" />
                <span
                  className="font-medium"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  PointOfHopeApostolicChurch
                </span>
              </a>
            </motion.div>
          </motion.main>
        </div>

        {/* Bottom Section: Contact Info */}
        <motion.footer className="mt-12 w-full" variants={itemVariants}>
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3 sm:gap-6">
            {contactItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.icon === Globe ? "_blank" : undefined}
                rel={item.icon === Globe ? "noopener noreferrer" : undefined}
                className="flex items-center transition-colors hover:opacity-80"
                style={{ color: "#a8a5a0" }}
              >
                <div className="mr-2 flex-shrink-0">
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: "#f0b012" }}
                  />
                </div>
                <span style={{ fontFamily: "var(--font-inter)" }}>
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </motion.footer>
      </div>

      {/* Right Side: Image with Clip Path Animation */}
      <motion.div
        className="relative w-full min-h-[350px] md:w-1/2 md:min-h-full lg:w-2/5"
        initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
        animate={{
          clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
        transition={{ duration: 1.2, ease: "circOut" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80')",
          }}
        />
        {/* Subtle green overlay for branding cohesion */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(63, 131, 28, 0.1)" }}
        />
      </motion.div>
    </motion.section>
  );
}
