import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check for touch capability
    const isTouchDevice = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 ||
                          (navigator as any).msMaxTouchPoints > 0;
                          
    // Check for screen size
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
      // Classify as mobile if either small screen OR touch device
      setIsMobile(isSmallScreen || isTouchDevice);
    }
    
    mql.addEventListener("change", onChange)
    onChange(); // Initial check
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
