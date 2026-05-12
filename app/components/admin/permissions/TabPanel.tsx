import { useRef } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function TabPanel({ children, value, index }: TabPanelProps) {
  const hasBeenActive = useRef(false);
  if (value === index) hasBeenActive.current = true;

  if (!hasBeenActive.current) return null;

  return (
    <div
      role="tabpanel"
      id={`permissions-tabpanel-${index}`}
      aria-labelledby={`permissions-tab-${index}`}
      style={{ display: value !== index ? "none" : undefined, paddingTop: 24 }}
    >
      {children}
    </div>
  );
}
