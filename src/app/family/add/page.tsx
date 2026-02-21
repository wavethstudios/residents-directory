"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Upload, User, Home, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getRelationshipOptions,
  getOccupationOptions,
  getBloodGroupOptions,
  type Relationship,
  type Occupation,
  type BloodGroup,
} from "@/lib/constants";
interface FamilyMember {
  name_en: string;
  name_ml: string;
  relationship_en: string;
  relationship_ml: string;
  occupation_en: string;
  occupation_ml: string;
  age: string;
  dob: string;
  ageInputMode: "age" | "dob";
  blood_group: string;
  is_head: boolean;
}
interface Family {
  houseNumber: string;
  address_en: string;
  address_ml: string;
  phone: string;
  isOnRent: boolean;
  ownerName: string;
}
function calculateAge(dob: string): string {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? String(age) : "";
}
interface ComboboxOption {
  en: string;
  ml: string;
}
interface ComboboxProps {
  options: ComboboxOption[];
  valueEn: string;
  valueMl: string;
  placeholder: string;
  onChangeEn: (v: string) => void;
  onChangeMl: (v: string) => void;
}
function BilingualCombobox({
  options,
  valueEn,
  valueMl,
  placeholder,
  onChangeEn,
  onChangeMl,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(valueEn);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setQuery(valueEn);
  }, [valueEn]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const filtered = query
    ? options.filter(
        (o) =>
          o.en.toLowerCase().includes(query.toLowerCase()) ||
          o.ml.includes(query),
      )
    : options;
  function selectOption(en: string, ml: string) {
    setQuery(en);
    onChangeEn(en);
    onChangeMl(ml);
    setOpen(false);
  }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    onChangeEn(v);
    const match = options.find((o) => o.en.toLowerCase() === v.toLowerCase());
    onChangeMl(match ? match.ml : "");
    setOpen(true);
  }
  const isCustomValue =
    query.trim() !== "" &&
    !options.some((o) => o.en.toLowerCase() === query.toLowerCase());
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          <ChevronDown size={16} />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((opt) => (
            <li
              key={opt.en}
              onMouseDown={() => selectOption(opt.en, opt.ml)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center ${
                valueEn === opt.en ? "bg-blue-50 font-medium" : ""
              }`}
            >
              <span className="text-gray-800">{opt.en}</span>
              <span className="text-gray-400 text-xs ml-2">{opt.ml}</span>
            </li>
          ))}
        </ul>
      )}
      {isCustomValue && (
        <div className="mt-1">
          <input
            type="text"
            value={valueMl}
            onChange={(e) => onChangeMl(e.target.value)}
            placeholder="മലയാളം"
            className="w-full border border-blue-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-700 bg-blue-50"
          />
          <p className="text-xs text-blue-500 mt-0.5">
            Custom value — enter Malayalam translation
          </p>
        </div>
      )}
    </div>
  );
}
function BloodGroupSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [options, setOptions] = useState<BloodGroup[]>([]);
  useEffect(() => {
    getBloodGroupOptions().then(setOptions);
  }, []);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
    >
      <option value="">Select blood group</option>
      {options.map((bg) => (
        <option key={bg.id} value={bg.value}>
          {bg.label}
        </option>
      ))}
    </select>
  );
}
const INITIAL_MEMBER: FamilyMember = {
  name_en: "",
  name_ml: "",
  relationship_en: "",
  relationship_ml: "",
  occupation_en: "",
  occupation_ml: "",
  age: "",
  dob: "",
  ageInputMode: "age",
  blood_group: "",
  is_head: false,
};
const INITIAL_FAMILY: Family = {
  houseNumber: "",
  address_en: "",
  address_ml: "",
  phone: "",
  isOnRent: false,
  ownerName: "",
};
export default function AddFamily() {
  const supabase = createClient();
  const [family, setFamily] = useState<Family>(INITIAL_FAMILY);
  const [members, setMembers] = useState<FamilyMember[]>([
    { ...INITIAL_MEMBER, is_head: true },
  ]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [relationshipOptions, setRelationshipOptions] = useState<
    ComboboxOption[]
  >([]);
  const [occupationOptions, setOccupationOptions] = useState<ComboboxOption[]>(
    [],
  );
  useEffect(() => {
    getRelationshipOptions().then((data: Relationship[]) =>
      setRelationshipOptions(
        data.map((r) => ({ en: r.value_en, ml: r.value_ml })),
      ),
    );
    getOccupationOptions().then((data: Occupation[]) =>
      setOccupationOptions(
        data.map((o) => ({ en: o.value_en, ml: o.value_ml })),
      ),
    );
  }, []);
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [photoFile]);
  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue: string | boolean = type === "checkbox" ? checked : value;
    setFamily((prev) => ({ ...prev, [name]: newValue }) as Family);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleMemberChange = <K extends keyof FamilyMember>(
    index: number,
    field: K,
    value: FamilyMember[K],
  ) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "dob") {
        updated[index].age = calculateAge(value as string);
      }
      return updated;
    });
    const errorKey = `member_${index}_${field}`;
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };
  const toggleAgeMode = (index: number, mode: "age" | "dob") => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ageInputMode: mode,
        age: "",
        dob: "",
      };
      return updated;
    });
  };
  const addMember = () =>
    setMembers((prev) => [...prev, { ...INITIAL_MEMBER }]);
  const removeMember = (index: number) => {
    if (members[index].is_head) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`member_${index}_`)) delete newErrors[key];
    });
    setErrors(newErrors);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be under 1MB.");
      return;
    }
    setPhotoFile(file);
    e.target.value = "";
  };
  const removePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
  };
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `family-${family.houseNumber}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("family-photos")
      .upload(filePath, photoFile);
    if (uploadError) throw new Error("Photo upload failed");
    const { data } = supabase.storage
      .from("family-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!family.houseNumber.trim())
      newErrors.houseNumber = "House number is required";
    if (!family.address_en.trim())
      newErrors.address_en = "Address (English) is required";
    if (family.phone && !/^\+?[\d\s\-\(\)]+$/.test(family.phone))
      newErrors.phone = "Please enter a valid phone number";
    if (family.isOnRent && !family.ownerName.trim())
      newErrors.ownerName = "Owner's name is required when rented";
    members.forEach((member, index) => {
      if (member.is_head && !member.name_en.trim()) {
        newErrors[`member_${index}_name_en`] =
          "Main member name (English) is required";
      } else if (!member.is_head) {
        const hasAnyField = Object.entries(member).some(([key, value]) => {
          if (["is_head", "ageInputMode"].includes(key)) return false;
          return typeof value === "string" && value.trim() !== "";
        });
        if (hasAnyField && !member.name_en.trim()) {
          newErrors[`member_${index}_name_en`] =
            "Name (English) is required when adding member details";
        }
      }
      if (
        member.age &&
        (isNaN(Number(member.age)) ||
          Number(member.age) < 0 ||
          Number(member.age) > 150)
      ) {
        newErrors[`member_${index}_age`] = "Please enter a valid age (0–150)";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const resetForm = () => {
    setFamily(INITIAL_FAMILY);
    setMembers([{ ...INITIAL_MEMBER, is_head: true }]);
    setPhotoFile(null);
    setPreviewUrl(null);
    setErrors({});
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const photo_url = await uploadPhoto();
      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .insert([
          {
            house_number: family.houseNumber,
            address_en: family.address_en,
            address_ml: family.address_ml,
            phone: family.phone,
            photo_url,
            is_on_rent: family.isOnRent,
            owner_name: family.ownerName || null,
          },
        ])
        .select()
        .single();
      if (familyError) throw new Error("Failed to create family");
      const validMembers = members.filter(
        (m) => m.is_head || m.name_en.trim() !== "",
      );
      const membersData = validMembers.map(
        ({ ageInputMode, dob, ...member }) => ({
          ...member,
          age: dob ? null : member.age ? parseInt(member.age) : null,
          dob: dob || null,
          family_id: familyData.id,
        }),
      );
      const { error: memberError } = await supabase
        .from("members")
        .insert(membersData);
      if (memberError) throw new Error("Failed to add members");
      alert("Family added successfully!");
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Family</h1>
        <Link
          href="/families"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Families
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-700">
                Family Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  placeholder="Enter house number"
                  value={family.houseNumber}
                  onChange={handleFamilyChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                    errors.houseNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.houseNumber && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.houseNumber}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={family.phone}
                  onChange={handleFamilyChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address_en"
                placeholder="Enter address in English"
                value={family.address_en}
                onChange={handleFamilyChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                  errors.address_en ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address_en && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.address_en}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Malayalam)
              </label>
              <input
                type="text"
                name="address_ml"
                placeholder="വിലാസം മലയാളത്തിൽ"
                value={family.address_ml}
                onChange={handleFamilyChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOnRent"
                  checked={family.isOnRent}
                  onChange={handleFamilyChange}
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  Is the family on rent?
                </span>
              </label>
            </div>
            {family.isOnRent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Enter owner's name"
                  value={family.ownerName}
                  onChange={handleFamilyChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                    errors.ownerName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.ownerName && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.ownerName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-700">
              Family Photo
            </h3>
          </div>
          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Upload family photo (optional)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer inline-block"
              >
                Choose Photo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Max 1MB • JPG, PNG, WEBP
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Image
                src={previewUrl}
                alt="Family photo preview"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-48 object-cover rounded-lg border mb-4"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-700">
              Family Members
            </h2>
          </div>
          <button
            type="button"
            onClick={addMember}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Member
          </button>
        </div>
        <div className="p-6 space-y-6">
          {members.map((member, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                member.is_head
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`font-semibold ${member.is_head ? "text-blue-800" : "text-gray-800"}`}
                >
                  {member.is_head ? (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Main Member
                    </span>
                  ) : (
                    `Member ${members.filter((m, i) => !m.is_head && i <= index).length + 1}`
                  )}
                </h3>
                {!member.is_head && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    aria-label="Remove member"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English){" "}
                    {member.is_head && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name in English"
                    value={member.name_en}
                    onChange={(e) =>
                      handleMemberChange(index, "name_en", e.target.value)
                    }
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                      errors[`member_${index}_name_en`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`member_${index}_name_en`] && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[`member_${index}_name_en`]}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Malayalam)
                  </label>
                  <input
                    type="text"
                    placeholder="പേര് മലയാളത്തിൽ"
                    value={member.name_ml}
                    onChange={(e) =>
                      handleMemberChange(index, "name_ml", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <BilingualCombobox
                    options={relationshipOptions}
                    valueEn={member.relationship_en}
                    valueMl={member.relationship_ml}
                    placeholder="Select or type…"
                    onChangeEn={(v) =>
                      handleMemberChange(index, "relationship_en", v)
                    }
                    onChangeMl={(v) =>
                      handleMemberChange(index, "relationship_ml", v)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <BilingualCombobox
                    options={occupationOptions}
                    valueEn={member.occupation_en}
                    valueMl={member.occupation_ml}
                    placeholder="Select or type…"
                    onChangeEn={(v) =>
                      handleMemberChange(index, "occupation_en", v)
                    }
                    onChangeMl={(v) =>
                      handleMemberChange(index, "occupation_ml", v)
                    }
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium text-gray-700 mr-1">
                      Age
                    </span>
                    <div className="flex rounded-md overflow-hidden border border-gray-300 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleAgeMode(index, "age")}
                        className={`px-2 py-0.5 transition-colors ${
                          member.ageInputMode === "age"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Age
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAgeMode(index, "dob")}
                        className={`px-2 py-0.5 transition-colors ${
                          member.ageInputMode === "dob"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        DOB
                      </button>
                    </div>
                  </div>
                  {member.ageInputMode === "age" ? (
                    <input
                      type="number"
                      placeholder="Enter age"
                      value={member.age}
                      onChange={(e) =>
                        handleMemberChange(index, "age", e.target.value)
                      }
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                        errors[`member_${index}_age`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      min="0"
                      max="150"
                    />
                  ) : (
                    <div>
                      <input
                        type="date"
                        value={member.dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          handleMemberChange(index, "dob", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                      {member.age && (
                        <p className="text-xs text-blue-600 mt-1">
                          Age: <strong>{member.age}</strong> years
                        </p>
                      )}
                    </div>
                  )}
                  {errors[`member_${index}_age`] && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[`member_${index}_age`]}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <BloodGroupSelect
                    value={member.blood_group}
                    onChange={(v) =>
                      handleMemberChange(index, "blood_group", v)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Reset Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding Family..." : "Add Family"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
