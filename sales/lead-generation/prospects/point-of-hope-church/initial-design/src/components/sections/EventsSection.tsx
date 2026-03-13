"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CalendarEvent {
  name: string;
  startTime: string;
  endTime: string;
  description: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHURCH_ADDRESS = "5150 Shelbyville Road, Indianapolis, IN 46237";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Event generators                                                   */
/* ------------------------------------------------------------------ */

function getEventsForDate(date: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const day = date.getDay(); // 0=Sun … 6=Sat
  const dateOfMonth = date.getDate();

  // Sunday Worship Service — every Sunday
  if (day === 0) {
    events.push({
      name: "Sunday Worship Service",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      description:
        "Join us for a powerful time of praise, worship, and the Word. All are welcome.",
      color: "bg-[#3f831c]",
    });
  }

  // Tuesday Prayer Meeting — every Tuesday
  if (day === 2) {
    events.push({
      name: "Prayer Meeting",
      startTime: "6:00 PM",
      endTime: "7:00 PM",
      description:
        "Come together in prayer as we lift up our community and seek God's guidance.",
      color: "bg-[#3f831c]/80",
    });
  }

  // Wednesday Bible Study — every Wednesday
  if (day === 3) {
    events.push({
      name: "Wednesday Bible Study",
      startTime: "7:00 PM",
      endTime: "8:30 PM",
      description:
        "Dive deeper into God's Word with interactive study and group discussion.",
      color: "bg-[#3f831c]/90",
    });
  }

  // Youth Night — first Friday of the month
  if (day === 5 && dateOfMonth <= 7) {
    events.push({
      name: "Youth Night",
      startTime: "6:30 PM",
      endTime: "9:00 PM",
      description:
        "A fun, faith-filled evening for teens with games, worship, and a relevant message.",
      color: "bg-[#f0b012]",
    });
  }

  return events;
}

/** Build a Google Calendar "Add Event" URL */
function googleCalendarUrl(date: Date, event: CalendarEvent): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  const parseTime = (timeStr: string): { h: number; m: number } => {
    const [time, meridiem] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return { h, m };
  };

  const start = parseTime(event.startTime);
  const end = parseTime(event.endTime);

  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  const dtStart = `${y}${mo}${d}T${pad(start.h)}${pad(start.m)}00`;
  const dtEnd = `${y}${mo}${d}T${pad(end.h)}${pad(end.m)}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${dtStart}/${dtEnd}`,
    details: event.description,
    location: CHURCH_ADDRESS,
    ctz: "America/Indiana/Indianapolis",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function EventCard({
  date,
  event,
  onClose,
}: {
  date: Date;
  event: CalendarEvent;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-[#3f831c]/15 bg-white p-5 shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={cn(
            "rounded-lg px-3 py-1 text-xs font-semibold text-white",
            event.color
          )}
        >
          {event.name}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-1 text-[#535250] transition hover:bg-[#e8f5e3] hover:text-[#3f831c]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 text-sm text-[#535250]">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#3f831c]" />
          <span>
            {event.startTime} &ndash; {event.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#3f831c]" />
          <span>{CHURCH_ADDRESS}</span>
        </div>
        <p className="pt-1 leading-relaxed">{event.description}</p>
      </div>

      <a
        href={googleCalendarUrl(date, event)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#3f831c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3f831c]/90"
      >
        <Calendar size={14} />
        Add to Calendar
      </a>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar Grid (desktop)                                            */
/* ------------------------------------------------------------------ */

function CalendarGrid({
  year,
  month,
  selectedDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-xl border border-[#3f831c]/10 bg-white">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-[#3f831c]/10 bg-[#e8f5e3]/60">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#3f831c]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="border-b border-r border-[#3f831c]/5 bg-[#fafaf8]/50 p-3"
              />
            );
          }

          const date = new Date(year, month, day);
          const events = getEventsForDate(date);
          const hasEvents = events.length > 0;
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => hasEvents && onSelectDay(day)}
              className={cn(
                "relative flex min-h-[72px] flex-col items-start border-b border-r border-[#3f831c]/5 p-2 text-left transition-colors",
                hasEvents
                  ? "cursor-pointer hover:bg-[#e8f5e3]/50"
                  : "cursor-default",
                isSelected && "bg-[#f0b012]/10 ring-2 ring-inset ring-[#f0b012]"
              )}
            >
              <span
                className={cn(
                  "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  isToday
                    ? "bg-[#3f831c] text-white"
                    : isSelected
                    ? "text-[#1a1a1a]"
                    : "text-[#535250]"
                )}
              >
                {day}
              </span>

              {hasEvents && (
                <div className="flex flex-wrap gap-1">
                  {events.map((ev, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        ev.color
                      )}
                      title={ev.name}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile list view                                                   */
/* ------------------------------------------------------------------ */

function MobileEventList({ year, month }: { year: number; month: number }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysWithEvents: { date: Date; events: CalendarEvent[] }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const events = getEventsForDate(date);
    if (events.length > 0) {
      daysWithEvents.push({ date, events });
    }
  }

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-3">
      {daysWithEvents.length === 0 && (
        <p className="py-8 text-center text-sm text-[#535250]">
          No events this month.
        </p>
      )}
      {daysWithEvents.map(({ date, events }, dayIdx) => (
        <div
          key={dayIdx}
          className="overflow-hidden rounded-xl border border-[#3f831c]/10 bg-white"
        >
          <button
            onClick={() =>
              setExpandedIdx(expandedIdx === dayIdx ? null : dayIdx)
            }
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#e8f5e3]/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {events.map((ev, i) => (
                  <span
                    key={i}
                    className={cn("h-2.5 w-2.5 rounded-full", ev.color)}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[#1a1a1a]">
                {formatDate(date)}
              </span>
            </div>
            <span className="text-xs text-[#535250]">
              {events.length} event{events.length > 1 ? "s" : ""}
            </span>
          </button>

          <AnimatePresence>
            {expandedIdx === dayIdx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 border-t border-[#3f831c]/10 px-4 py-3">
                  {events.map((event, evIdx) => (
                    <div key={evIdx} className="space-y-2">
                      <div
                        className={cn(
                          "inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold text-white",
                          event.color
                        )}
                      >
                        {event.name}
                      </div>
                      <div className="space-y-1.5 text-sm text-[#535250]">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-[#3f831c]" />
                          <span>
                            {event.startTime} &ndash; {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#3f831c]" />
                          <span>{CHURCH_ADDRESS}</span>
                        </div>
                        <p className="leading-relaxed">{event.description}</p>
                      </div>
                      <a
                        href={googleCalendarUrl(date, event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3f831c] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3f831c]/90"
                      >
                        <Calendar size={12} />
                        Add to Calendar
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export default function EventsSection() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return getEventsForDate(new Date(currentYear, currentMonth, selectedDay));
  }, [selectedDay, currentMonth, currentYear]);

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const navigate = useCallback(
    (direction: -1 | 1) => {
      setSelectedDay(null);
      const newDate = new Date(currentYear, currentMonth + direction, 1);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    },
    [currentMonth, currentYear]
  );

  return (
    <section id="events" className="bg-white/35 backdrop-blur-sm py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] sm:text-4xl lg:text-5xl"
          >
            Upcoming Events
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
          >
            Join us for worship and fellowship
          </motion.p>
        </div>

        {/* Month navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous month"
            className="rounded-full border border-[#3f831c]/20 p-2 text-[#3f831c] transition hover:bg-[#e8f5e3]"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] sm:text-2xl">
            {monthLabel}
          </h3>
          <button
            onClick={() => navigate(1)}
            aria-label="Next month"
            className="rounded-full border border-[#3f831c]/20 p-2 text-[#3f831c] transition hover:bg-[#e8f5e3]"
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>

        {/* Desktop calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block"
        >
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            selectedDay={selectedDay}
            onSelectDay={(day) =>
              setSelectedDay(selectedDay === day ? null : day)
            }
          />
        </motion.div>

        {/* Mobile list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:hidden"
        >
          <MobileEventList year={currentYear} month={currentMonth} />
        </motion.div>

        {/* Desktop event detail popout */}
        <AnimatePresence>
          {selectedDay !== null && selectedEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 hidden overflow-hidden md:block"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {selectedEvents.map((event, idx) => (
                  <EventCard
                    key={`${selectedDay}-${idx}`}
                    date={
                      new Date(currentYear, currentMonth, selectedDay)
                    }
                    event={event}
                    onClose={() => setSelectedDay(null)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#535250]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3f831c]" />
            Worship &amp; Bible Study
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3f831c]/80" />
            Prayer Meeting
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f0b012]" />
            Youth Night
          </div>
        </div>
      </div>
    </section>
  );
}
