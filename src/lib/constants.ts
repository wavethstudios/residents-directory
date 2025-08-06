import { createClient } from "@/utils/supabase/client";
export interface BloodGroup {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
  sort_order: number;
}
export interface Relationship {
  id: number;
  value_en: string;
  value_ml: string;
  label: string;
  is_active: boolean;
  sort_order: number;
}
export interface Occupation {
  id: number;
  value_en: string;
  value_ml: string;
  label: string;
  is_active: boolean;
  sort_order: number;
}
let bloodGroupsCache: BloodGroup[] | null = null;
let relationshipsCache: Relationship[] | null = null;
let occupationsCache: Occupation[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000;
const lastFetchTime = {
  bloodGroups: 0,
  relationships: 0,
  occupations: 0,
};
const isCacheValid = (lastFetch: number): boolean => {
  return Date.now() - lastFetch < CACHE_DURATION;
};
export const getBloodGroupOptions = async (): Promise<BloodGroup[]> => {
  if (bloodGroupsCache && isCacheValid(lastFetchTime.bloodGroups)) {
    return bloodGroupsCache;
  }
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("blood_groups")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.error("Error fetching blood groups:", error);
      return getFallbackBloodGroups();
    }
    bloodGroupsCache = data;
    lastFetchTime.bloodGroups = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching blood groups:", error);
    return getFallbackBloodGroups();
  }
};
export const getRelationshipOptions = async (): Promise<Relationship[]> => {
  if (relationshipsCache && isCacheValid(lastFetchTime.relationships)) {
    return relationshipsCache;
  }
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("relationships")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.error("Error fetching relationships:", error);
      return getFallbackRelationships();
    }
    relationshipsCache = data;
    lastFetchTime.relationships = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return getFallbackRelationships();
  }
};
export const getOccupationOptions = async (): Promise<Occupation[]> => {
  if (occupationsCache && isCacheValid(lastFetchTime.occupations)) {
    return occupationsCache;
  }
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("occupations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.error("Error fetching occupations:", error);
      return getFallbackOccupations();
    }
    occupationsCache = data;
    lastFetchTime.occupations = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching occupations:", error);
    return getFallbackOccupations();
  }
};
export const findRelationshipByEnglish = async (
  value_en: string
): Promise<Relationship | undefined> => {
  const relationships = await getRelationshipOptions();
  return relationships.find((rel) => rel.value_en === value_en);
};
export const findOccupationByEnglish = async (
  value_en: string
): Promise<Occupation | undefined> => {
  const occupations = await getOccupationOptions();
  return occupations.find((occ) => occ.value_en === value_en);
};
export const findBloodGroup = async (
  value: string
): Promise<BloodGroup | undefined> => {
  const bloodGroups = await getBloodGroupOptions();
  return bloodGroups.find((bg) => bg.value === value);
};
export const refreshBloodGroupsCache = async (): Promise<BloodGroup[]> => {
  bloodGroupsCache = null;
  lastFetchTime.bloodGroups = 0;
  return await getBloodGroupOptions();
};
export const refreshRelationshipsCache = async (): Promise<Relationship[]> => {
  relationshipsCache = null;
  lastFetchTime.relationships = 0;
  return await getRelationshipOptions();
};
export const refreshOccupationsCache = async (): Promise<Occupation[]> => {
  occupationsCache = null;
  lastFetchTime.occupations = 0;
  return await getOccupationOptions();
};
const getFallbackBloodGroups = (): BloodGroup[] => [
  { id: 1, value: "A+", label: "A+", is_active: true, sort_order: 1 },
  { id: 2, value: "A-", label: "A-", is_active: true, sort_order: 2 },
  { id: 3, value: "B+", label: "B+", is_active: true, sort_order: 3 },
  { id: 4, value: "B-", label: "B-", is_active: true, sort_order: 4 },
  { id: 5, value: "AB+", label: "AB+", is_active: true, sort_order: 5 },
  { id: 6, value: "AB-", label: "AB-", is_active: true, sort_order: 6 },
  { id: 7, value: "O+", label: "O+", is_active: true, sort_order: 7 },
  { id: 8, value: "O-", label: "O-", is_active: true, sort_order: 8 },
];
const getFallbackRelationships = (): Relationship[] => [
  {
    id: 1,
    value_en: "Head of Family (Male)",
    value_ml: "ഗ്രഹനാഥൻ",
    label: "Head of Family (Male) (ഗ്രഹനാഥൻ)",
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    value_en: "Head of Family (Female)",
    value_ml: "ഗ്രഹനാഥ",
    label: "Head of Family (Female) (ഗ്രഹനാഥ)",
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    value_en: "Father",
    value_ml: "പിതാവ്",
    label: "Father (പിതാവ്)",
    is_active: true,
    sort_order: 3,
  },
  {
    id: 4,
    value_en: "Mother",
    value_ml: "മാതാവ്",
    label: "Mother (മാതാവ്)",
    is_active: true,
    sort_order: 4,
  },
  {
    id: 5,
    value_en: "Son",
    value_ml: "മകൻ",
    label: "Son (മകൻ)",
    is_active: true,
    sort_order: 5,
  },
  {
    id: 6,
    value_en: "Daughter",
    value_ml: "മകൾ",
    label: "Daughter (മകൾ)",
    is_active: true,
    sort_order: 6,
  },
];
const getFallbackOccupations = (): Occupation[] => [
  {
    id: 1,
    value_en: "Student",
    value_ml: "വിദ്യാർത്ഥി",
    label: "Student (വിദ്യാർത്ഥി)",
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    value_en: "Teacher",
    value_ml: "അധ്യാപകൻ",
    label: "Teacher (അധ്യാപകൻ)",
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    value_en: "Doctor",
    value_ml: "ഡോക്ടർ",
    label: "Doctor (ഡോക്ടർ)",
    is_active: true,
    sort_order: 3,
  },
];
export const syncConstants = async () => {
  try {
    await Promise.all([
      getBloodGroupOptions(),
      getRelationshipOptions(),
      getOccupationOptions(),
    ]);
    console.log("Constants synced successfully");
  } catch (error) {
    console.error("Error syncing constants:", error);
  }
};
