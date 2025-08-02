"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
interface Family {
  id: number;
  house_number: string;
  address_en: string;
  address_ml: string;
  phone: string;
  photo_url: string | null;
}
export default function FamiliesTablePage() {
  const supabase = createClient();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("house_number");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const fetchFamilies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let query = supabase.from("families").select("*", { count: "exact" });
      if (activeSearch && activeSearch.trim()) {
        const searchTerm = `%${activeSearch.trim()}%`;
        query = query.or(
          `house_number.ilike.${searchTerm},` +
            `address_en.ilike.${searchTerm},` +
            `address_ml.ilike.${searchTerm},` +
            `phone.ilike.${searchTerm}`
        );
      }
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      const { data, error: fetchError, count } = await query;
      if (fetchError) {
        console.error("Error fetching families:", fetchError.message);
        setError("Failed to load families");
        return;
      }
      setFamilies(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, sortBy, sortOrder, currentPage, pageSize, supabase]);
  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);
  const deletePhoto = async (photoUrl: string): Promise<void> => {
    if (!photoUrl) return;
    try {
      const url = new URL(photoUrl);
      const filePath = url.pathname.replace(
        "/storage/v1/object/public/family-photos/",
        ""
      );
      const { error: storageError } = await supabase.storage
        .from("family-photos")
        .remove([filePath]);
      if (storageError) {
        console.warn("Photo delete failed:", storageError.message);
      }
    } catch (error) {
      console.warn("Invalid photo URL or deletion failed:", photoUrl, error);
    }
  };
  const handleDelete = async (family: Family) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the family at House No: ${family.house_number}?\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;
    try {
      if (family.photo_url) {
        await deletePhoto(family.photo_url);
      }
      const { error: deleteError } = await supabase
        .from("families")
        .delete()
        .eq("id", family.id);
      if (deleteError) {
        console.error("Delete error:", deleteError.message);
        alert("Failed to delete family: " + deleteError.message);
        return;
      }
      await fetchFamilies();
      alert("Family deleted successfully");
    } catch (error) {
      console.error("Unexpected error during delete:", error);
      alert("An unexpected error occurred while deleting the family");
    }
  };
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };
  const handleSearchClear = () => {
    setSearchInput("");
    setActiveSearch("");
    setCurrentPage(1);
  };
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  if (isLoading && families.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading families...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-red-600 text-center">
          {error}
          <button
            onClick={() => fetchFamilies()}
            className="ml-4 text-blue-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Family List</h1>
        <Link
          href="/family/add"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Family
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by house number, address, or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                title="Search"
              >
                <SearchIcon />
              </button>
            </form>
            {activeSearch && (
              <div className="mt-2 text-xs text-gray-500">
                Searching for: &quot;{activeSearch}&quot;
                <button
                  onClick={handleSearchClear}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {totalCount === 0 ? (
            "No families found"
          ) : (
            <>
              Showing {startIndex} to {endIndex} of {totalCount}{" "}
              {totalCount === 1 ? "family" : "families"}
              {activeSearch && (
                <span className="ml-2">
                  matching &quot;{activeSearch}&quot;
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {families.length === 0 && !activeSearch ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No families found.</div>
          <Link
            href="/family/add"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Add First Family
          </Link>
        </div>
      ) : families.length === 0 && activeSearch ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            No families match your search.
          </div>
          <button
            onClick={handleSearchClear}
            className="text-blue-600 hover:underline"
          >
            Clear search to see all families
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("house_number")}
                    >
                      <div className="flex items-center gap-1">House No</div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("address_en")}
                    >
                      <div className="flex items-center gap-1">Address</div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("phone")}
                    >
                      <div className="flex items-center gap-1">Phone</div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {families.map((family) => (
                    <tr key={family.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {family.house_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{family.address_en}</div>
                        {family.address_ml && (
                          <div className="text-gray-500 text-xs mt-1">
                            {family.address_ml}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {family.phone ? (
                          <a
                            href={`tel:${family.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {family.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">No phone</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center gap-4">
                          <Link
                            href={`/family/view/${family.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/family/edit/${family.id}`}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(family)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {isLoading && families.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg text-gray-700 ">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}
