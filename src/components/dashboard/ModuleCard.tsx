import { cn } from "@/lib/utils";
import { Icon as PhosphorIcon, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: PhosphorIcon;
  href: string;
  accentWord?: string;
  className?: string;
}

export function ModuleCard({ title, description, icon: Icon, href, accentWord, className }: ModuleCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group block bg-card border border-border/50 rounded-xl p-6 card-hover",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon weight="duotone" className="w-6 h-6 text-primary" />
          </div>
          <ArrowRight weight="bold" className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {accentWord ? (
            <>
              {description.split(accentWord)[0]}
              <span className="accent-text">{accentWord}</span>
              {description.split(accentWord)[1]}
            </>
          ) : (
            description
          )}
        </p>
      </div>
    </Link>
  );
}
