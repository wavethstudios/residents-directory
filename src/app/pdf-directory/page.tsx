"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
type Member = {
  name_en: string;
  name_ml: string;
  relationship_en: string;
  relationship_ml: string;
  occupation_en: string;
  occupation_ml: string;
  age: number;
};
type Family = {
  id: string;
  house_number: string;
  address_en: string;
  address_ml: string;
  phone: string;
  members: Member[];
  photo_url?: string;
};
const formatTextForPDF = (text: string): string => {
  if (!text) return "";
  return text.trim() || "";
};
const containsMalayalam = (text: string): boolean => {
  if (!text) return false;
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  return malayalamRegex.test(text);
};
const wrapMalayalamText = (text: string): string => {
  if (!text || text === "") return text;
  return `<span class="malayalam-text">${formatTextForPDF(text)}</span>`;
};
const smartFormatText = (text: string): string => {
  if (!text || text === "") return formatTextForPDF(text);
  const formattedText = formatTextForPDF(text);
  if (containsMalayalam(formattedText)) {
    return `<span class="malayalam-text">${formattedText}</span>`;
  }
  return formattedText;
};
const smartFormatMixedText = (text: string): string => {
  if (!text || text === "") return formatTextForPDF(text);
  const formattedText = formatTextForPDF(text);
  const hasMalayalam = containsMalayalam(formattedText);
  const hasEnglish = /[a-zA-Z0-9]/.test(formattedText);
  if (hasMalayalam && hasEnglish) {
    return formattedText.replace(
      /([\u0D00-\u0D7F\s]+)/g,
      '<span class="malayalam-text">$1</span>'
    );
  } else if (hasMalayalam) {
    return `<span class="malayalam-text">${formattedText}</span>`;
  }
  return formattedText;
};
const generatePDFHTML = (
  families: Family[],
  language: "english" | "malayalam" | "both"
): string => {
  const getTitle = () => {
    switch (language) {
      case "malayalam":
        return wrapMalayalamText("കുടുംബ ഡയറക്ടറി");
      case "english":
        return "Family Directory";
      default:
        return `Family Directory | ${wrapMalayalamText("കുടുംബ ഡയറക്ടറി")}`;
    }
  };
  const pages = [];
  for (let i = 0; i < families.length; i += 2) {
    const familyPair = families.slice(i, i + 2);
    pages.push(familyPair);
  }
  const generateFamilyCard = (family: Family) => {
    const membersRows =
      family.members?.length > 0
        ? family.members
            .map((member, index) => {
              const nameCell = (() => {
                if (language === "english")
                  return smartFormatText(member.name_en);
                if (language === "malayalam")
                  return wrapMalayalamText(member.name_ml || member.name_en);
                let content = smartFormatText(member.name_en);
                if (member.name_ml && member.name_ml !== member.name_en) {
                  content += `<br>${wrapMalayalamText(member.name_ml)}`;
                }
                return content;
              })();
              const relationshipCell = (() => {
                if (language === "english")
                  return smartFormatText(member.relationship_en);
                if (language === "malayalam")
                  return wrapMalayalamText(
                    member.relationship_ml || member.relationship_en
                  );
                let content = smartFormatText(member.relationship_en);
                if (
                  member.relationship_ml &&
                  member.relationship_ml !== member.relationship_en
                ) {
                  content += `<br>${wrapMalayalamText(member.relationship_ml)}`;
                }
                return content;
              })();
              const occupationCell = (() => {
                if (language === "english")
                  return smartFormatText(member.occupation_en);
                if (language === "malayalam")
                  return wrapMalayalamText(
                    member.occupation_ml || member.occupation_en
                  );
                let content = smartFormatText(member.occupation_en);
                if (
                  member.occupation_ml &&
                  member.occupation_ml !== member.occupation_en
                ) {
                  content += `<br>${wrapMalayalamText(member.occupation_ml)}`;
                }
                return content;
              })();
              return `
            <tr class="${index % 2 === 0 ? "table-row" : "table-row-alt"}">
              <td class="table-cell name-cell">${nameCell}</td>
              <td class="table-cell relationship-cell">${relationshipCell}</td>
              <td class="table-cell occupation-cell">${occupationCell}</td>
              <td class="table-cell age-cell">${member.age || ""}</td>
            </tr>
          `;
            })
            .join("")
        : `
        <tr class="table-row">
          <td class="table-cell empty-message" colspan="4">
            ${
              language === "malayalam"
                ? wrapMalayalamText("കുടുംബാംഗങ്ങളുടെ രേഖകളില്ല")
                : "No family members recorded"
            }
          </td>
        </tr>
      `;
    const addressContent = (() => {
      if (language === "english")
        return `<div class="address">${smartFormatText(
          family.address_en
        )}</div>`;
      if (language === "malayalam")
        return `<div class="address-malayalam">${wrapMalayalamText(
          family.address_ml || family.address_en
        )}</div>`;
      let content = `<div class="address">${smartFormatText(
        family.address_en
      )}</div>`;
      if (family.address_ml) {
        content += `<div class="address-malayalam">${wrapMalayalamText(
          family.address_ml
        )}</div>`;
      }
      return content;
    })();
    const houseNumberContent = smartFormatMixedText(family.house_number);
    const tableHeaders = (() => {
      if (language === "malayalam") {
        return `
          <th class="table-header-cell name-header">${wrapMalayalamText(
            "പേര്"
          )}</th>
          <th class="table-header-cell relationship-header">${wrapMalayalamText(
            "ബന്ധം"
          )}</th>
          <th class="table-header-cell occupation-header">${wrapMalayalamText(
            "ജോലി/വിദ്യാഭ്യാസം"
          )}</th>
          <th class="table-header-cell age-header">${wrapMalayalamText(
            "പ്രായം"
          )}</th>
        `;
      }
      return `
        <th class="table-header-cell name-header">Name</th>
        <th class="table-header-cell relationship-header">Relationship</th>
        <th class="table-header-cell occupation-header">Occupation/Education</th>
        <th class="table-header-cell age-header">Age</th>
      `;
    })();
    return `
      <div class="family-section">
        <div class="family-header">
          <div class="family-info">
            <div class="house-number">${houseNumberContent}</div>
            ${addressContent}
            <div class="phone">${family.phone}</div>
          </div>
          <div class="photo-container">
            ${
              family.photo_url
                ? `<img class="photo" src="${family.photo_url}" alt="Family Photo" />`
                : '<div class="placeholder-text">Family Photo</div>'
            }
          </div>
        </div>
        <div class="members-table">
          <table>
            <thead>
              <tr class="table-header">
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${membersRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };
  const pagesHTML = pages
    .map(
      (familyPair, pageIndex) => `
    <div class="page">
      <div class="header">${getTitle()}</div>
      <div class="page-container">
        ${generateFamilyCard(familyPair[0])}
        ${familyPair[1] ? generateFamilyCard(familyPair[1]) : ""}
      </div>
      <div class="page-number">Page ${pageIndex + 1} of ${pages.length}</div>
    </div>
    ${pageIndex < pages.length - 1 ? '<div class="page-break"></div>' : ""}
  `
    )
    .join("");
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getTitle()}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', 'Helvetica', sans-serif;
          font-size: 10px;
          line-height: 1.4;
          color: #334155;
          background: white;
        }
        .malayalam-text {
          font-family: 'Noto Sans Malayalam', 'Arial Unicode MS', sans-serif !important;
          font-size: 11px;
          line-height: 1.7;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 30px;
          margin: 0 auto;
          position: relative;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .page-break {
          page-break-after: always;
        }
        .header {
          font-size: 14px;
          text-align: center;
          margin-bottom: 25px;
          color: #2563eb;
          font-weight: 700;
          padding-bottom: 8px;
          font-family: 'Inter', 'Helvetica', sans-serif;
        }
        .page-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .family-section {
          height: 48%;
          margin-bottom: 15px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
        }
        .family-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          align-items: flex-start;
        }
        .family-info {
          flex: 1;
          margin-right: 15px;
        }
        .house-number {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        /* Enhanced house number styling for Malayalam */
        .house-number .malayalam-text {
          font-size: 19px !important;
          font-weight: 700;
          line-height: 1.6;
        }
        .address {
          font-size: 11px;
          color: #475569;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .address-malayalam {
          font-size: 12px;
          color: #475569;
          margin-bottom: 6px;
          line-height: 1.8;
        }
        .phone {
          font-size: 11px;
          color: #475569;
          font-weight: 600;
        }
        .photo-container {
          width: 80px;
          height: 80px;
          background: #e2e8f0;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        .photo {
          width: 80px;
          height: 80px;
          border-radius: 5px;
          object-fit: cover;
        }
        .placeholder-text {
          font-size: 8px;
          color: #64748b;
          text-align: center;
          padding: 5px;
        }
        .members-table {
          border-radius: 4px;
          overflow: hidden;
        }
        .members-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .table-header {
          background: #3b82f6;
        }
        .table-header-cell {
          padding: 8px;
          font-size: 9px;
          font-weight: 600;
          color: white;
          text-align: left;
          font-family: 'Inter', 'Helvetica', sans-serif;
        }
        .name-header {
          width: 35%;
        }
        .relationship-header {
          width: 20%;
        }
        .occupation-header {
          width: 35%;
        }
        .age-header {
          width: 10%;
        }
        .table-row {
          background: white;
        }
        .table-row-alt {
          background: #f1f5f9;
        }
        .table-cell {
          padding: 8px;
          font-size: 9px;
          color: #334155;
          line-height: 1.4;
          vertical-align: top;
          border-bottom: 1px solid #e2e8f0;
        }
        .name-cell {
          width: 35%;
        }
        .relationship-cell {
          width: 20%;
        }
        .occupation-cell {
          width: 35%;
        }
        .age-cell {
          width: 10%;
          text-align: center;
        }
        .empty-message {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 15px;
        }
        .page-number {
          position: absolute;
          bottom: 15px;
          right: 30px;
          font-size: 9px;
          color: #64748b;
        }
        @media print {
          .page {
            margin: 0;
            box-shadow: none;
          }
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      ${pagesHTML}
    </body>
    </html>
  `;
};
const generatePDF = async (
  families: Family[],
  language: "english" | "malayalam" | "both"
): Promise<void> => {
  try {
    const htmlContent = generatePDFHTML(families, language);
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        filename: `family-directory-${language}-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `family-directory-${language}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
export default function PDFDirectoryPage() {
  const supabase = createClient();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        setError(null);
        let finalData: Family[] | null = null;
        const { data: nestedData, error: nestedError } = await supabase
          .from("families")
          .select("*, members(*)")
          .order("house_number", { ascending: true });
        if (nestedError) {
          console.warn(
            "Nested select failed, trying fallback:",
            nestedError.message
          );
          const { data: familiesData, error: fallbackError } = await supabase
            .from("families")
            .select("*")
            .order("house_number", { ascending: true });
          if (fallbackError) {
            throw new Error(`Database query failed: ${fallbackError.message}`);
          }
          const familiesWithMembers = await Promise.all(
            (familiesData || []).map(async (family) => {
              const { data: membersData } = await supabase
                .from("members")
                .select(
                  "name_en, name_ml, relationship_en, relationship_ml, occupation_en, occupation_ml, age"
                )
                .eq("family_id", family.id);
              return {
                ...family,
                members: membersData || [],
              };
            })
          );
          finalData = familiesWithMembers as Family[];
        } else {
          finalData = nestedData as Family[];
        }
        if (!finalData) {
          throw new Error("No data was received from the database.");
        }
        setFamilies(finalData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown and unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, [supabase]);
  const handleGeneratePDF = async (
    language: "english" | "malayalam" | "both"
  ) => {
    setGenerating((prev) => ({ ...prev, [language]: true }));
    try {
      await generatePDF(families, language);
    } finally {
      setGenerating((prev) => ({ ...prev, [language]: false }));
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium mb-2">Troubleshooting tips:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>
                  Check if the &apos;families&apos; table exists in your
                  Supabase database
                </li>
                <li>
                  Verify the &apos;members&apos; table exists and has a
                  &apos;family_id&apos; foreign key
                </li>
                <li>Ensure your Supabase client is properly configured</li>
                <li>Check your Row Level Security (RLS) policies</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!families.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-gray-800 font-semibold mb-2">No Data Found</h2>
            <p className="text-gray-600">
              No family records were found in the database.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white-800">
          Generate PDF
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Directory Summary
              </h2>
              <p className="text-gray-600">
                {families.length} families • {Math.ceil(families.length / 2)}{" "}
                pages
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleGeneratePDF("english")}
                disabled={generating.english}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="flex items-center justify-center gap-2">
                  {generating.english ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>English</>
                  )}
                </span>
              </button>
              <button
                onClick={() => handleGeneratePDF("malayalam")}
                disabled={generating.malayalam}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm text-sm disabled:bg-green-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="flex items-center justify-center gap-2">
                  {generating.malayalam ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>മലയാളം</>
                  )}
                </span>
              </button>
              <button
                onClick={() => handleGeneratePDF("both")}
                disabled={generating.both}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm text-sm disabled:bg-purple-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="flex items-center justify-center gap-2">
                  {generating.both ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>Both</>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
