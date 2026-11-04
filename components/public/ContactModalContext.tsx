"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface ContactModalContextType {
  isOpen: boolean;
  openContactModal: (triggerRef?: HTMLElement | null) => void;
  closeContactModal: () => void;
  triggerElement: HTMLElement | null;
}

const ContactModalContext = createContext<ContactModalContextType>({
  isOpen: false,
  openContactModal: () => {},
  closeContactModal: () => {},
  triggerElement: null,
});

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const openContactModal = useCallback((triggerRef?: HTMLElement | null) => {
    if (triggerRef) {
      setTriggerElement(triggerRef);
    } else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      setTriggerElement(document.activeElement);
    }
    setIsOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ContactModalContext.Provider
      value={{
        isOpen,
        openContactModal,
        closeContactModal,
        triggerElement,
      }}
    >
      {children}
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  return useContext(ContactModalContext);
}
