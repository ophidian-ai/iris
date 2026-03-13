import { Facebook, MapPin, Phone, Mail } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Events", href: "#events" },
  { label: "Meet the Team", href: "#team" },
  { label: "What to Expect", href: "#expect" },
  { label: "Stay Connected", href: "#social" },
  { label: "Find Us", href: "#findus" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* About Column */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pointofhopechurch.com/wp-content/themes/point-of-hope/images/logo.png"
                alt="Point of Hope Apostolic Church"
                className="h-10 w-auto brightness-200"
              />
            </div>
            <p
              className="mb-2 text-lg font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Point of Hope Apostolic Church
            </p>
            <p
              className="text-sm leading-relaxed text-gray-400"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A welcoming community of faith in Indianapolis, Indiana. Join us
              for worship and discover your place of hope.
            </p>
            <a
              href="https://www.facebook.com/PointOfHopeApostolicChurch"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#3f831c]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <Facebook className="h-5 w-5" />
              Follow us on Facebook
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="mb-4 text-lg font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-[#3f831c]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="mb-4 text-lg font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3f831c]" />
                <span
                  className="text-sm text-gray-400"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  5150 Shelbyville Road
                  <br />
                  Indianapolis, IN 46237
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3f831c]" />
                <a
                  href="tel:3177821502"
                  className="text-sm text-gray-400 transition-colors hover:text-[#3f831c]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  317-782-1502
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#3f831c]" />
                <a
                  href="mailto:pointofhopeministries@gmail.com"
                  className="text-sm text-gray-400 transition-colors hover:text-[#3f831c]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  pointofhopeministries@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p
            className="text-xs text-gray-500"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            &copy; 2026 Point of Hope Apostolic Church. All rights reserved.
          </p>
          <p
            className="mt-2 text-xs text-gray-600"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Website by{" "}
            <a
              href="https://ophidianai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-[#3f831c]"
            >
              Ophidian<span className="text-[#39ff14]">AI</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
