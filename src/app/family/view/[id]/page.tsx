"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
interface Family {
  id: number;
  house_number: string;
  address_en: string;
  address_ml: string;
  phone: string;
  photo_url: string | null;
  is_on_rent?: boolean | null;
  owner_name?: string | null;
}
interface Member {
  id: number;
  name_en: string;
  name_ml: string;
  relationship_en: string;
  relationship_ml: string;
  occupation_en: string;
  occupation_ml: string;
  age: number | null;
  dob: string | null;
  blood_group: string;
  is_head: boolean;
  family_id: number;
}
function getDisplayAge(member: {
  age?: number | null;
  dob?: string | null;
}): string {
  if (member.dob) {
    const birth = new Date(member.dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? `${age}` : "—";
  }
  if (member.age != null) return `${member.age}`;
  return "—";
}
export default function FamilyView() {
  const supabase = createClient();
  const { id } = useParams();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFamilyData = useCallback(
    async (familyId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const { data: familyData, error: familyError } = await supabase
          .from("families")
          .select("*")
          .eq("id", familyId)
          .single();
        if (familyError) {
          console.error("Family fetch error:", familyError.message);
          setError("Family not found");
          return;
        }
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*")
          .eq("family_id", familyId)
          .order("is_head", { ascending: false });
        if (memberError) {
          console.error("Members fetch error:", memberError.message);
          setError("Failed to load family members");
          return;
        }
        setFamily({
          id: familyData.id,
          house_number: familyData.house_number,
          address_en: familyData.address_en,
          address_ml: familyData.address_ml,
          phone: familyData.phone,
          photo_url: familyData.photo_url ?? null,
          is_on_rent:
            typeof familyData.is_on_rent === "boolean"
              ? familyData.is_on_rent
              : false,
          owner_name: familyData.owner_name ?? null,
        });
        setMembers(memberData || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchFamilyData(id);
    }
  }, [id, fetchFamilyData]);
  const formatDisplayText = (primary: string, secondary?: string): string => {
    if (!primary) return "";
    if (!secondary) return primary;
    return `${primary} (${secondary})`;
  };
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading family details...</div>
      </div>
    );
  }
  if (error || !family) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || "Family not found"}</div>
          <Link href="/families" className="text-blue-600 hover:underline">
            ← Back to Family List
          </Link>
        </div>
      </div>
    );
  }
  const headMember = members.find((m) => m.is_head);
  const otherMembers = members.filter((m) => !m.is_head);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/families"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Back to Family List
        </Link>
        <Link
          href={`/family/edit/${family.id}`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Edit Family
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {family.photo_url && (
              <div className="flex-shrink-0">
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  src={family.photo_url}
                  alt={`Family at House ${family.house_number}`}
                  className="w-40 h-40 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                House No: {family.house_number}
              </h1>
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Address
                  </h3>
                  <p className="text-gray-900">{family.address_en}</p>
                  {family.address_ml && (
                    <p className="text-gray-600 text-sm">{family.address_ml}</p>
                  )}
                </div>
                {family.phone && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">
                      Phone
                    </h3>
                    <a
                      href={`tel:${family.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {family.phone}
                    </a>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Members
                  </h3>
                  <p className="text-gray-900">
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Tenancy
                  </h3>
                  {family.is_on_rent ? (
                    <p className="text-sm text-red-700">
                      On rent{" "}
                      {family.owner_name ? (
                        <>
                          — Owner:{" "}
                          <span className="font-medium text-gray-900">
                            {family.owner_name}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-600">
                          (owner not specified)
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">Owner-occupied</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Family Members
          </h2>
        </div>
        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No members found for this family.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job/Education
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {headMember && (
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDisplayText(
                          headMember.name_en,
                          headMember.name_ml,
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDisplayText(
                        headMember.relationship_en,
                        headMember.relationship_ml,
                      ) || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDisplayText(
                        headMember.occupation_en,
                        headMember.occupation_ml,
                      ) || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDisplayAge(headMember)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {headMember.blood_group || "-"}
                    </td>
                  </tr>
                )}
                {otherMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDisplayText(member.name_en, member.name_ml)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDisplayText(
                        member.relationship_en,
                        member.relationship_ml,
                      ) || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDisplayText(
                        member.occupation_en,
                        member.occupation_ml,
                      ) || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDisplayAge(member)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.blood_group || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
