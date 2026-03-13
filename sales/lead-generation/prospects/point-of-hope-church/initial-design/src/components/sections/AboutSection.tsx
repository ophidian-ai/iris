"use client";

import { motion } from "framer-motion";
import { BookOpen, Heart, Users, HandHelping } from "lucide-react";

const beliefs = [
  {
    icon: BookOpen,
    title: "Apostolic Doctrine",
    description:
      "Grounded in the teachings of the Apostles, we hold to the message of salvation through repentance, baptism in Jesus' name, and the infilling of the Holy Spirit.",
  },
  {
    icon: Users,
    title: "Community & Fellowship",
    description:
      "We believe the church is a family. Together we grow, serve, and support one another through every season of life.",
  },
  {
    icon: Heart,
    title: "Worship & Prayer",
    description:
      "Passionate worship and fervent prayer are at the heart of everything we do. We seek God's presence in all things.",
  },
  {
    icon: HandHelping,
    title: "Outreach & Service",
    description:
      "We are called to be the hands and feet of Jesus, serving our neighbors and sharing hope with our community.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white/35 backdrop-blur-sm py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] sm:text-4xl lg:text-5xl"
          >
            Who We Are
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
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#535250]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Point of Hope Apostolic Church is a welcoming community of faith
            located in Indianapolis, Indiana. Under the leadership of Pastor
            Stephen Gossage, we are dedicated to sharing the transformative power
            of God&apos;s Word and the message of hope found in Jesus Christ.
          </motion.p>
        </div>

        {/* What We Believe */}
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] sm:text-3xl"
        >
          What We Believe
        </motion.h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beliefs.map((belief, i) => (
            <motion.div
              key={belief.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-[#3f831c]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f5e3]">
                <belief.icon className="h-6 w-6 text-[#3f831c]" />
              </div>
              <h4
                className="mb-2 text-lg font-semibold text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {belief.title}
              </h4>
              <p
                className="text-sm leading-relaxed text-[#535250]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {belief.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
