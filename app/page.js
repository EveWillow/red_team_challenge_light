"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ChallengeSelector() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        setTiers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-6">Select a Challenge</h1>
        <p>Loading challenges…</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-10">Select a Challenge</h1>

      {tiers.map((section) => (
        <div key={section.tier} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{section.tier}</h2>

          {section.challenges.length === 0 ? (
            <p className="text-gray-500">Coming soon…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.challenges.map((c) => (
                <Link
                  key={c.id}
                  href={`/play/${c.id}`}
                  className="block p-4 rounded-xl border border-gray-300 dark:border-gray-700 
                             bg-gray-50 dark:bg-gray-800 hover:shadow-lg hover:border-blue-500
                             transition duration-150 ease-in-out"
                >
                  <h3 className="text-lg font-bold mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {c.instructions}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
