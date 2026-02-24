import { cloneElement, isValidElement } from "react";
import { cn } from "../lib/cn.js";
import ActionCard from "./ActionCard";

export default function ActionCardGrid({
  items,
  className,
  gridClassName = "grid grid-cols-1 sm:grid-cols-3 gap-8",
}) {
  return (
    <div className={cn(gridClassName, className)}>
      {(items ?? []).map((item, idx) => {
        if (isValidElement(item)) {
          return item.key == null ? cloneElement(item, { key: idx }) : item;
        }

        if (!item) return null;

        return (
          <ActionCard
            key={item.key ?? item.title ?? idx}
            to={item.to ?? item.link}
            title={item.title}
            icon={item.icon}
            variant={item.variant}
            className={item.className}
          />
        );
      })}
    </div>
  );
}
