'use client';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function Input({
  value,
  onChange,
  placeholder,
}: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border rounded-lg px-3 py-2"
    />
  );
}