"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "@/lib/siteSettings";

interface WhatsAppDesignLinkProps {
  message: string;
  className: string;
  children: React.ReactNode;
}

export function WhatsAppDesignLink({ message, className, children }: WhatsAppDesignLinkProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_SITE_SETTINGS.whatsappNumber);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load WhatsApp settings.");
        const settings = await response.json();
        setWhatsappNumber(normalizeSiteSettings(settings).whatsappNumber);
      } catch (error) {
        console.error("Could not load WhatsApp settings for design link.", error);
      }
    };

    void loadSettings();
  }, []);

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
