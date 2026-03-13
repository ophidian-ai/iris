"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Events", href: "#events" },
  { label: "Meet the Team", href: "#team" },
  { label: "What to Expect", href: "#expect" },
  { label: "Find Us", href: "#findus" },
] as const;

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [activeLink, setActiveLink] = useState("#hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // Track scroll position to show/hide nav
  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past 80% of viewport height (hero section)
      const heroThreshold = window.innerHeight * 0.8;
      setVisible(window.scrollY > heroThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track which section is currently in view
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Pick the one closest to the top of the viewport
          const sorted = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveLink(`#${sorted[0].target.id}`);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setActiveLink(href);
    setMobileOpen(false);

    const targetId = href.replace("#", "");
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          ref={navRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div
              className={cn(
                "rounded-2xl border px-4 py-2",
                "shadow-lg shadow-black/5"
              )}
              style={{
                backgroundColor: "rgba(250, 250, 248, 0.8)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderColor: "rgba(63, 131, 28, 0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                {/* Logo / Brand */}
                <a
                  href="#hero"
                  onClick={(e) => handleClick(e, "#hero")}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <img
                    src="https://pointofhopechurch.com/wp-content/themes/point-of-hope/images/logo.png"
                    alt="Point of Hope"
                    className="h-8 w-auto"
                  />
                  <span
                    className="hidden text-sm font-semibold sm:inline-block"
                    style={{
                      color: "#1a1a1a",
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Point of Hope
                  </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden items-center gap-1 lg:flex">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleClick(e, link.href)}
                      className="relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                      style={{
                        color:
                          activeLink === link.href ? "#fafaf8" : "#535250",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {/* Active pill indicator */}
                      {activeLink === link.href && (
                        <motion.div
                          ref={pillRef}
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: "#3f831c" }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </a>
                  ))}
                </div>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden"
                  style={{ color: "#3f831c" }}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                  <AnimatePresence mode="wait">
                    {mobileOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Menu className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="mt-2 overflow-hidden rounded-2xl border shadow-lg lg:hidden"
                  style={{
                    backgroundColor: "rgba(250, 250, 248, 0.95)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderColor: "rgba(63, 131, 28, 0.15)",
                  }}
                >
                  <div className="flex flex-col p-3">
                    {navLinks.map((link, index) => (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleClick(e, link.href)}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                        )}
                        style={{
                          fontFamily: "var(--font-inter)",
                          color:
                            activeLink === link.href ? "#fafaf8" : "#535250",
                          backgroundColor:
                            activeLink === link.href
                              ? "#3f831c"
                              : "transparent",
                        }}
                      >
                        {link.label}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
