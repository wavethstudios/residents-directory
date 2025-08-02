export const BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
] as const;
export const RELATIONSHIPS = [
  { value_en: "Head", value_ml: "ഗ്രഹനാഥൻ", label: "Head (ഗ്രഹനാഥൻ)" },
  { value_en: "Father", value_ml: "പിതാവ്", label: "Father (പിതാവ്)" },
  { value_en: "Mother", value_ml: "മാതാവ്", label: "Mother (മാതാവ്)" },
  { value_en: "Son", value_ml: "മകൻ", label: "Son (മകൻ)" },
  { value_en: "Daughter", value_ml: "മകൾ", label: "Daughter (മകൾ)" },
  { value_en: "Husband", value_ml: "ഭർത്താവ്", label: "Husband (ഭർത്താവ്)" },
  { value_en: "Wife", value_ml: "ഭാര്യ", label: "Wife (ഭാര്യ)" },
  { value_en: "Brother", value_ml: "സഹോദരൻ", label: "Brother (സഹോദരൻ)" },
  { value_en: "Sister", value_ml: "സഹോദരി", label: "Sister (സഹോദരി)" },
  {
    value_en: "Grandfather",
    value_ml: "മുത്തച്ഛൻ",
    label: "Grandfather (മുത്തച്ഛൻ)",
  },
  {
    value_en: "Grandmother",
    value_ml: "മുത്തശ്ശി",
    label: "Grandmother (മുത്തശ്ശി)",
  },
  { value_en: "Uncle", value_ml: "അമ്മാവൻ", label: "Uncle (അമ്മാവൻ)" },
  { value_en: "Aunt", value_ml: "അമ്മായി", label: "Aunt (അമ്മായി)" },
  { value_en: "Nephew", value_ml: "അനന്തരവൻ", label: "Nephew (അനന്തരവൻ)" },
  { value_en: "Niece", value_ml: "അനന്തരവൾ", label: "Niece (അനന്തരവൾ)" },
  { value_en: "Son-in-law", value_ml: "മരുമകൻ", label: "Son-in-law (മരുമകൻ)" },
  {
    value_en: "Daughter-in-law",
    value_ml: "മരുമകൾ",
    label: "Daughter-in-law (മരുമകൾ)",
  },
  {
    value_en: "Father-in-law",
    value_ml: "അമ്മായിയപ്പൻ",
    label: "Father-in-law (അമ്മായിയപ്പൻ)",
  },
  {
    value_en: "Mother-in-law",
    value_ml: "അമ്മായിയമ്മ",
    label: "Mother-in-law (അമ്മായിയമ്മ)",
  },
] as const;
export const OCCUPATIONS = [
  {
    value_en: "Student",
    value_ml: "വിദ്യാർത്ഥി",
    label: "Student (വിദ്യാർത്ഥി)",
  },
  { value_en: "Teacher", value_ml: "അധ്യാപകൻ", label: "Teacher (അധ്യാപകൻ)" },
  { value_en: "Doctor", value_ml: "ഡോക്ടർ", label: "Doctor (ഡോക്ടർ)" },
  { value_en: "Nurse", value_ml: "നഴ്സ്", label: "Nurse (നഴ്സ്)" },
  {
    value_en: "Engineer",
    value_ml: "എഞ്ചിനീയർ",
    label: "Engineer (എഞ്ചിനീയർ)",
  },
  { value_en: "Farmer", value_ml: "കർഷകൻ", label: "Farmer (കർഷകൻ)" },
  { value_en: "Business", value_ml: "ബിസിനസ്", label: "Business (ബിസിനസ്)" },
  {
    value_en: "Government Employee",
    value_ml: "സർക്കാർ ജീവനക്കാരൻ",
    label: "Government Employee (സർക്കാർ ജീവനക്കാരൻ)",
  },
  {
    value_en: "Private Employee",
    value_ml: "സ്വകാര്യ ജീവനക്കാരൻ",
    label: "Private Employee (സ്വകാര്യ ജീവനക്കാരൻ)",
  },
  {
    value_en: "Retired",
    value_ml: "വിരമിച്ചവർ",
    label: "Retired (വിരമിച്ചവർ)",
  },
  { value_en: "Homemaker", value_ml: "ഗൃഹിണി", label: "Homemaker (ഗൃഹിണി)" },
  {
    value_en: "Unemployed",
    value_ml: "തൊഴിലില്ലാത്തവർ",
    label: "Unemployed (തൊഴിലില്ലാത്തവർ)",
  },
  { value_en: "Lawyer", value_ml: "വക്കീൽ", label: "Lawyer (വക്കീൽ)" },
  { value_en: "Police", value_ml: "പോലീസ്", label: "Police (പോലീസ്)" },
  { value_en: "Driver", value_ml: "ഡ്രൈവർ", label: "Driver (ഡ്രൈവർ)" },
  {
    value_en: "Mechanic",
    value_ml: "മെക്കാനിക്",
    label: "Mechanic (മെക്കാനിക്)",
  },
  {
    value_en: "Electrician",
    value_ml: "ഇലക്ട്രീഷ്യൻ",
    label: "Electrician (ഇലക്ട്രീഷ്യൻ)",
  },
  {
    value_en: "Carpenter",
    value_ml: "മിസ്ത്രി",
    label: "Carpenter (മിസ്ത്രി)",
  },
  { value_en: "Shop Owner", value_ml: "കട ഉടമ", label: "Shop Owner (കട ഉടമ)" },
  {
    value_en: "Accountant",
    value_ml: "അക്കൗണ്ടന്റ്",
    label: "Accountant (അക്കൗണ്ടന്റ്)",
  },
  {
    value_en: "Bank Employee",
    value_ml: "ബാങ്ക് ജീവനക്കാരൻ",
    label: "Bank Employee (ബാങ്ക് ജീവനക്കാരൻ)",
  },
  {
    value_en: "IT Professional",
    value_ml: "ഐടി പ്രൊഫഷണൽ",
    label: "IT Professional (ഐടി പ്രൊഫഷണൽ)",
  },
  { value_en: "Other", value_ml: "മറ്റുള്ളവ", label: "Other (മറ്റുള്ളവ)" },
] as const;
export const getBloodGroupOptions = () => BLOOD_GROUPS;
export const getRelationshipOptions = () => RELATIONSHIPS;
export const getOccupationOptions = () => OCCUPATIONS;
export const findRelationshipByEnglish = (value_en: string) =>
  RELATIONSHIPS.find((rel) => rel.value_en === value_en);
export const findOccupationByEnglish = (value_en: string) =>
  OCCUPATIONS.find((occ) => occ.value_en === value_en);
export const findBloodGroup = (value: string) =>
  BLOOD_GROUPS.find((bg) => bg.value === value);
