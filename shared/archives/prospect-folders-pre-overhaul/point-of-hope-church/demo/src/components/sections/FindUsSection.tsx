"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";

function AnimatedBorderCard({ children }: { children: React.ReactNode }) {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;

    const animateBorder = () => {
      const now = Date.now() / 1000;
      const speed = 0.5;

      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;

      if (topRef.current)
        topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current)
        rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current)
        bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current)
        leftRef.current.style.transform = `translateY(${leftY}%)`;

      animationId = requestAnimationFrame(animateBorder);
    };

    animationId = requestAnimationFrame(animateBorder);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full rounded-2xl border border-[#3f831c]/10 bg-[#fafaf8] p-8 shadow-lg overflow-hidden md:p-12">
      {/* Animated border elements */}
      <div className="absolute top-0 left-0 w-full h-0.5 overflow-hidden">
        <div
          ref={topRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(63, 131, 28, 0.5), transparent)",
          }}
        />
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-full overflow-hidden">
        <div
          ref={rightRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(240, 176, 18, 0.5), transparent)",
          }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
        <div
          ref={bottomRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(63, 131, 28, 0.5), transparent)",
          }}
        />
      </div>
      <div className="absolute top-0 left-0 w-0.5 h-full overflow-hidden">
        <div
          ref={leftRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(240, 176, 18, 0.5), transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function FindUsSection() {
  return (
    <section id="findus" className="bg-white/25 backdrop-blur-sm py-20 md:py-28">
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
            Find Us
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedBorderCard>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              {/* Left: Info */}
              <div className="flex flex-col justify-center">
                <h3
                  className="mb-6 text-2xl font-bold text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Visit Us This Sunday
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f831c]" />
                    <div style={{ fontFamily: "var(--font-inter)" }}>
                      <p className="font-medium text-[#1a1a1a]">Address</p>
                      <p className="text-sm text-[#2d2b28]">
                        5150 Shelbyville Road
                        <br />
                        Indianapolis, IN 46237
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f831c]" />
                    <div style={{ fontFamily: "var(--font-inter)" }}>
                      <p className="font-medium text-[#1a1a1a]">Phone</p>
                      <a
                        href="tel:3177821502"
                        className="text-sm text-[#2d2b28] hover:text-[#3f831c] transition-colors"
                      >
                        317-782-1502
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#3f831c]" />
                    <div style={{ fontFamily: "var(--font-inter)" }}>
                      <p className="font-medium text-[#1a1a1a]">
                        Service Times
                      </p>
                      <div className="text-sm text-[#2d2b28]">
                        <p>Sunday Worship: 10:00 AM</p>
                        <p>Tuesday Prayer: 6:00 PM</p>
                        <p>Wednesday Bible Study: 7:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://maps.google.com/?q=5150+Shelbyville+Road+Indianapolis+IN+46237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#3f831c] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2d6114] hover:shadow-lg"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Directions
                </a>
              </div>

              {/* Right: Map */}
              <div className="overflow-hidden rounded-xl shadow-md">
                <iframe
                  src="https://maps.google.com/maps?q=Point+of+Hope+Apostolic+Church+5150+Shelbyville+Road+Indianapolis+IN+46237&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Point of Hope Apostolic Church Location"
                  className="w-full"
                />
              </div>
            </div>
          </AnimatedBorderCard>
        </motion.div>
      </div>
    </section>
  );
}
