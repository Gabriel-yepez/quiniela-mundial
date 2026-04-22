import { type ChangeEvent, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps
  extends Omit<ComponentProps<"input">, "type" | "onChange"> {
  max?: number;
  maxLength?: number;
  onChange: (value: string) => void;
}

function NumberInput({ max, maxLength = 2, onChange, ...props }: NumberInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLength);
    if (raw === "") {
      onChange("");
      return;
    }
    const num = parseInt(raw, 10);
    if (max !== undefined && num > max) return;
    onChange(String(num));
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={maxLength}
      onChange={handleChange}
      {...props}
    />
  );
}

export { NumberInput };
