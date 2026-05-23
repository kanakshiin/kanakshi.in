"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------
   1. Reading Progress Meter Component
   ------------------------------------------------------------- */
export function BlogReadingProgress() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollWidth(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="reading-progress-container" aria-hidden="true">
      <div className="reading-progress-bar" style={{ width: `${scrollWidth}%` }} />
    </div>
  );
}

/* -------------------------------------------------------------
   2. Dynamic Table of Contents Component
   ------------------------------------------------------------- */
type TocItem = {
  text: string;
  level: "h2" | "h3";
  id: string;
};

export function BlogTableOfContents() {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const prose = document.querySelector(".prose-heritage");
    if (!prose) return;

    // Query both H2 and H3 elements inside article
    const headings = prose.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headings.forEach((h, index) => {
      // Inject unique ID if absent
      if (!h.id) {
        const cleanText = (h.textContent || "")
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        h.id = cleanText || `article-section-${index}`;
      }

      items.push({
        text: h.textContent || "",
        level: h.tagName.toLowerCase() as "h2" | "h3",
        id: h.id,
      });
    });

    setToc(items);

    // Scroll listener for active link highlight
    const handleScroll = () => {
      let currentActive = "";
      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        // Trigger active class if section header sits near or above middle screen
        if (rect.top <= 140) {
          currentActive = h.id;
        }
      }
      setActiveId(currentActive || (items[0]?.id ?? ""));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (toc.length === 0) return null;

  return (
    <div className="blog-sidebar-widget blog-toc-widget">
      <h3>On This Page</h3>

      <nav className="toc-list" aria-label="Table of Contents">
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`toc-item ${activeId === item.id ? "active" : ""}`}
            style={{
              paddingLeft: item.level === "h3" ? "1.65rem" : "0.75rem",
              fontSize: item.level === "h3" ? "0.85rem" : "0.92rem",
            }}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(item.id);
              if (element) {
                const headerOffset = 110;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }
            }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------
   3. Accordion FAQ Component
   ------------------------------------------------------------- */
type FaqData = {
  question: string;
  answer: string;
};

export function BlogFaqAccordion({ faqs }: { faqs: FaqData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="blog-faq-section" aria-labelledby="faq-section-heading">
      <h2 id="faq-section-heading" className="prose-heritage h2">
        Frequently Asked Questions
      </h2>
      <div className="blog-faq-list" style={{ marginTop: "1.5rem" }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="blog-faq-item">
              <button
                type="button"
                className="blog-faq-question"
                onClick={() => toggleIndex(index)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <span style={{ transition: "transform 250ms ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="blog-faq-answer">
                  <p style={{ margin: 0 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
