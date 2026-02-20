import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownAZ, ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";

interface SortingOptionsProps {
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (value: string) => void;
  onOrderChange: (value: "asc" | "desc") => void;
}

export const SortingOptions = ({
  sortBy,
  order,
  onSortChange,
  onOrderChange,
}: SortingOptionsProps) => {
  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "price", label: "Price" },
  ];

  const selectedSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort";

  const toggleOrder = () => {
    onOrderChange(order === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {selectedSortLabel}
            {sortBy === "price" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrder();
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                {order === "asc" ? (
                  <ArrowDownNarrowWide className="h-4 w-4" />
                ) : (
                  <ArrowUpNarrowWide className="h-4 w-4" />
                )}
              </button>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={onSortChange}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
