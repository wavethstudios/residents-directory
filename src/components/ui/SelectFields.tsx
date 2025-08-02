import React from "react";
import {
  getBloodGroupOptions,
  getRelationshipOptions,
  getOccupationOptions,
} from "@/lib/constants";
interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}
export const BloodGroupSelect: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  placeholder = "Select blood group",
  required = false,
  className = "",
  disabled = false,
}) => {
  const options = getBloodGroupOptions();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
export const RelationshipSelect: React.FC<
  SelectFieldProps & {
    onEnglishChange?: (valueEn: string) => void;
    onMalayalamChange?: (valueMl: string) => void;
  }
> = ({
  value,
  onChange,
  onEnglishChange,
  onMalayalamChange,
  placeholder = "Select relationship",
  required = false,
  className = "",
  disabled = false,
}) => {
  const options = getRelationshipOptions();
  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
    const selectedRelationship = options.find(
      (rel) => rel.value_en === selectedValue
    );
    if (selectedRelationship) {
      onEnglishChange?.(selectedRelationship.value_en);
      onMalayalamChange?.(selectedRelationship.value_ml);
    }
  };
  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value_en} value={option.value_en}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
export const OccupationSelect: React.FC<
  SelectFieldProps & {
    onEnglishChange?: (valueEn: string) => void;
    onMalayalamChange?: (valueMl: string) => void;
  }
> = ({
  value,
  onChange,
  onEnglishChange,
  onMalayalamChange,
  placeholder = "Select occupation",
  required = false,
  className = "",
  disabled = false,
}) => {
  const options = getOccupationOptions();
  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
    const selectedOccupation = options.find(
      (occ) => occ.value_en === selectedValue
    );
    if (selectedOccupation) {
      onEnglishChange?.(selectedOccupation.value_en);
      onMalayalamChange?.(selectedOccupation.value_ml);
    }
  };
  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value_en} value={option.value_en}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
interface GenericSelectProps<T> {
  options: T[];
  value: string;
  onChange: (value: string) => void;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}
export function GenericSelect<T>({
  options,
  value,
  onChange,
  getOptionValue,
  getOptionLabel,
  placeholder = "Select option",
  required = false,
  className = "",
  disabled = false,
}: GenericSelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
}
