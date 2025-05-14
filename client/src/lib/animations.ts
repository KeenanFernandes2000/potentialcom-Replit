// Animation utility functions for the website

// Refresh AOS animations
export const refreshAnimations = () => {
  if (typeof window !== 'undefined' && (window as any).AOS) {
    (window as any).AOS.refresh();
  }
};

// Scroll to section with offset
export const scrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};
