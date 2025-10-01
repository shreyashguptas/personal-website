"use client";

import { useEffect } from "react";

type AnimateElement = HTMLElement & {
  dataset: DOMStringMap & {
    animateState?: "hidden" | "visible";
  };
};

function isAnimateElement(node: Element | Node): node is AnimateElement {
  return node instanceof HTMLElement && node.hasAttribute("data-animate");
}

function ensureHiddenState(element: AnimateElement) {
  if (!element.dataset.animateState) {
    element.dataset.animateState = "hidden";
  }
}

export function MotionObserver() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const animatedElements = new Set<AnimateElement>();
    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const reveal = (element: AnimateElement) => {
      if (animatedElements.has(element)) return;
      animatedElements.add(element);
      element.dataset.animateState = "visible";

      if (process.env.NODE_ENV !== "production") {
        const label = element.getAttribute("data-animate") || "unnamed";
        const delay = element.style.getPropertyValue("--fade-delay") || "0ms";
        console.info("[motion-observer] reveal", { label, delay });
      }
    };

    const register = (element: AnimateElement) => {
      if (animatedElements.has(element)) return;
      ensureHiddenState(element);
      intersectionObserver?.observe(element);
    };

    const bootstrap = () => {
      const nodes = document.querySelectorAll<AnimateElement>("[data-animate]");
      nodes.forEach((node) => {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
          reveal(node);
        } else {
          register(node);
        }
      });
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      bootstrap();
      return;
    }

    document.documentElement.classList.add("motion-ready");

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as AnimateElement;
          reveal(target);
          intersectionObserver?.unobserve(target);
        }
      },
      {
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.25,
      }
    );

    bootstrap();

    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!isAnimateElement(node)) {
            if (node instanceof HTMLElement) {
              node
                .querySelectorAll<AnimateElement>("[data-animate]")
                .forEach((child) => register(child));
            }
            return;
          }
          register(node);
        });
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}


