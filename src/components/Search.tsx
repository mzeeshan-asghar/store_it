"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { getFiles } from "@/lib/actions/file.actions";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { Models } from "node-appwrite";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.Document[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const fetchFiles = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return router.push(path.replace(searchParams.toString(), ""));
    }

    const files = await getFiles({ types: [], searchText: query });
    setResults(files.documents || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchFiles(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchFiles]);

  const handleClickItem = (file: Models.Document) => {
    setIsFocused(false);
    const filePath = `/${file.type === "video" || file.type === "audio" ? "media" : `${file.type}s`}`;
    router.push(`${filePath}?q=${file.name}`);
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          type="text"
          value={query}
          placeholder="Search files"
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Results dropdown */}
        {isFocused && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.slice(0, 6).map((file: Models.Document) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between"
                  onMouseDown={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Search;
