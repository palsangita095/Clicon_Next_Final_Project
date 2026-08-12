"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "@animateicons/react/lucide";

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      className="rounded-full p-4 "
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

export default ToggleTheme;
