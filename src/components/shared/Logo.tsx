import React from "react";
import { ChefHat } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const sizeConfig = {
    sm: {
      icon: "w-5 h-5",
      text: "text-lg",
      ai: "text-xs",
    },
    md: {
      icon: "w-6 h-6",
      text: "text-xl",
      ai: "text-sm",
    },
    lg: {
      icon: "w-8 h-8",
      text: "text-2xl",
      ai: "text-base",
    },
    xl: {
      icon: "w-12 h-12",
      text: "text-4xl",
      ai: "text-xl",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <ChefHat
          className={`${config.icon} text-amber-600 dark:text-amber-500`}
        />
      </div>
      {showText && (
        <div className="flex items-baseline gap-1">
          <span
            className={`${config.text} font-bold text-gray-900 dark:text-white`}
          >
            MenuCraft
          </span>
          <span
            className={`${config.ai} font-bold text-amber-600 dark:text-amber-500`}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
