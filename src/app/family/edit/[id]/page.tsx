"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X, Upload, User, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  BloodGroupSelect,
  OccupationSelect,
  RelationshipSelect,
} from "@/components/ui/SelectFields";
import Image from "next/image";
interface Family {
  id: number;
  house_number: string;
  address_en: string;
  address_ml: string;
  phone: string;
  photo_url: string | null;
}
interface Member {
  id?: number;
  name_en: string;
  name_ml: string;
  relationship_en: string;
  relationship_ml: string;
  occupation_en: string;
  occupation_ml: string;
  age: string;
  blood_group: string;
  is_head: boolean;
  family_id?: number;
}
const INITIAL_MEMBER: Omit<Member, "id" | "family_id"> = {
  name_en: "",
  name_ml: "",
  relationship_en: "",
  relationship_ml: "",
  occupation_en: "",
  occupation_ml: "",
  age: "",
  blood_group: "",
  is_head: false,
};
export default function EditFamilyPage() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photoFile]);
  const fetchFamily = useCallback(
    async (familyId: string) => {
      try {
        const { data, error } = await supabase
          .from("families")
          .select("*, members(*)")
          .eq("id", familyId)
          .single();
        if (error || !data) {
          console.error("Fetch family error:", error?.message);
          alert("Failed to fetch family data.");
          router.push("/families");
          return;
        }
        setFamily(data);
        setMembers(data.members || []);
        if (data.photo_url) {
          setPreviewUrl(data.photo_url);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
        router.push("/families");
      } finally {
        setIsLoading(false);
      }
    },
    [router, supabase]
  );
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchFamily(id);
    }
  }, [id, fetchFamily]);
  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!family) return;
    const { name, value } = e.target;
    setFamily((prev) => (prev ? { ...prev, [name]: value } : null));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleMemberChange = <K extends keyof Member>(
    index: number,
    field: K,
    value: Member[K]
  ) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const errorKey = `member_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };
  const addMember = () => {
    setMembers((prev) => [...prev, { ...INITIAL_MEMBER }]);
  };
  const removeMember = (index: number) => {
    const member = members[index];
    if (member.is_head) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`member_${index}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be under 1MB.");
      return;
    }
    setPhotoFile(file);
    e.target.value = "";
  };
  const removePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
    setShouldRemovePhoto(true);
  };
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !family) return null;
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `family-${family.house_number}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("family-photos")
      .upload(filePath, photoFile);
    if (uploadError) {
      console.error("Photo upload error:", uploadError.message);
      throw new Error("Photo upload failed");
    }
    const { data: publicUrlData } = supabase.storage
      .from("family-photos")
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };
  const deleteOldPhoto = async (photoUrl: string) => {
    try {
      const url = new URL(photoUrl);
      const filePath = url.pathname.replace(
        "/storage/v1/object/public/family-photos/",
        ""
      );
      const { error } = await supabase.storage
        .from("family-photos")
        .remove([filePath]);
      if (error) {
        console.warn("Failed to delete old photo:", error.message);
      }
    } catch (error) {
      console.warn("Failed to parse photo URL for deletion:", error);
    }
  };
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!family?.house_number?.trim()) {
      newErrors.house_number = "House number is required";
    }
    if (!family?.address_en?.trim()) {
      newErrors.address_en = "Address (English) is required";
    }
    if (family?.phone && !/^\+?[\d\s\-\(\)]+$/.test(family.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    members.forEach((member, index) => {
      if (member.is_head) {
        if (!member.name_en.trim()) {
          newErrors[`member_${index}_name_en`] =
            "Main member name (English) is required";
        }
      } else {
        const hasAnyField = Object.entries(member).some(([key, value]) => {
          if (key === "is_head" || key === "id" || key === "family_id")
            return false;
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
        newErrors[`member_${index}_age`] = "Please enter a valid age (0-150)";
      }
      if (
        member.blood_group &&
        !/^(A|B|AB|O)[+-]?$/i.test(member.blood_group.trim())
      ) {
        newErrors[`member_${index}_blood_group`] =
          "Please enter a valid blood group (e.g., A+, O-, AB)";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!family || !validateForm()) return;
    setIsSubmitting(true);
    try {
      let photoUrl = family.photo_url;
      if (photoFile) {
        if (family.photo_url) {
          await deleteOldPhoto(family.photo_url);
        }
        photoUrl = await uploadPhoto();
      } else if (shouldRemovePhoto && family.photo_url) {
        await deleteOldPhoto(family.photo_url);
        photoUrl = null;
      }
      const { error: familyError } = await supabase
        .from("families")
        .update({
          house_number: family.house_number,
          address_en: family.address_en,
          address_ml: family.address_ml,
          phone: family.phone,
          photo_url: photoUrl,
        })
        .eq("id", family.id);
      if (familyError) {
        console.error("Family update error:", familyError.message);
        throw new Error("Failed to update family information");
      }
      const { data: existingMembers } = await supabase
        .from("members")
        .select("id")
        .eq("family_id", family.id);
      const existingIds = (existingMembers || []).map((m) => m.id);
      const validMembers = members.filter((member) => {
        if (member.is_head) return true;
        return member.name_en.trim() !== "";
      });
      const membersToUpdate = validMembers.filter((m) => m.id);
      const membersToInsert = validMembers.filter((m) => !m.id);
      const currentIds = membersToUpdate.map((m) => m.id);
      const memberIdsToDelete = existingIds.filter(
        (id) => !currentIds.includes(id)
      );
      for (const member of membersToUpdate) {
        const { error } = await supabase
          .from("members")
          .update({
            name_en: member.name_en,
            name_ml: member.name_ml,
            relationship_en: member.relationship_en,
            relationship_ml: member.relationship_ml,
            occupation_en: member.occupation_en,
            occupation_ml: member.occupation_ml,
            age: member.age ? parseInt(member.age) : null,
            blood_group: member.blood_group,
            is_head: member.is_head,
          })
          .eq("id", member.id!);
        if (error) {
          console.error("Member update error:", error.message);
          throw new Error("Failed to update member information");
        }
      }
      if (membersToInsert.length > 0) {
        const { error } = await supabase.from("members").insert(
          membersToInsert.map((member) => ({
            ...member,
            age: member.age ? parseInt(member.age) : null,
            family_id: family.id,
          }))
        );
        if (error) {
          console.error("Member insert error:", error.message);
          throw new Error("Failed to add new members");
        }
      }
      if (memberIdsToDelete.length > 0) {
        const { error } = await supabase
          .from("members")
          .delete()
          .in("id", memberIdsToDelete);
        if (error) {
          console.error("Member delete error:", error.message);
          throw new Error("Failed to remove deleted members");
        }
      }
      setShouldRemovePhoto(false);
      alert("Family updated successfully!");
      router.push("/families");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading family data...</div>
      </div>
    );
  }
  if (!family) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-600 space-y-4">
          <div>Family not found</div>
          <Link
            href="/families"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Families
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/families" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Family</h1>
            <p className="text-gray-400">House No: {family.house_number}</p>
          </div>
        </div>
        <Link
          href={`/family/view/${family.id}`}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          View Details
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
                  name="house_number"
                  placeholder="Enter house number"
                  value={family.house_number || ""}
                  onChange={handleFamilyChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 ${
                    errors.house_number ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.house_number && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.house_number}
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
                  value={family.phone || ""}
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
                value={family.address_en || ""}
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
                value={family.address_ml || ""}
                onChange={handleFamilyChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
              />
            </div>
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
              <div className="space-y-2">
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
                  {photoFile ? "Change Photo" : "Replace Photo"}
                </label>
                {photoFile ? (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mx-auto"
                  >
                    Cancel Upload
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mx-auto"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
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
              key={member.id || `new-${index}`}
              className={`border rounded-lg p-4 ${
                member.is_head
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`font-semibold ${
                    member.is_head ? "text-blue-800" : "text-gray-800"
                  }`}
                >
                  {member.is_head ? (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Main Member
                    </span>
                  ) : (
                    `Member ${index}`
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
                    value={member.name_en || ""}
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
                    value={member.name_ml || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "name_ml", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700 "
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <RelationshipSelect
                    value={member.relationship_en}
                    onChange={(value) =>
                      handleMemberChange(index, "relationship_en", value)
                    }
                    onEnglishChange={(valueEn) =>
                      handleMemberChange(index, "relationship_en", valueEn)
                    }
                    onMalayalamChange={(valueMl) =>
                      handleMemberChange(index, "relationship_ml", valueMl)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <OccupationSelect
                    value={member.occupation_en}
                    onChange={(value) =>
                      handleMemberChange(index, "occupation_en", value)
                    }
                    onEnglishChange={(valueEn) =>
                      handleMemberChange(index, "occupation_en", valueEn)
                    }
                    onMalayalamChange={(valueMl) =>
                      handleMemberChange(index, "occupation_ml", valueMl)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={member.age || ""}
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
                  {errors[`member_${index}_age`] && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[`member_${index}_age`]}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <BloodGroupSelect
                    value={member.blood_group}
                    onChange={(value) =>
                      handleMemberChange(index, "blood_group", value)
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
              onClick={() => router.push("/families")}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
