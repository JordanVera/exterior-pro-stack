"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function ProviderQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const fetchQuotes = () => {
    trpc.quote.listForProvider
      .query()
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleRespond = async (quoteId: string) => {
    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      await trpc.quote.respond.mutate({
        quoteId,
        customPrice: Number(price),
        notes: notes || undefined,
      });
      setRespondingId(null);
      setPrice("");
      setNotes("");
      fetchQuotes();
    } catch (err: any) {
      alert(err.message || "Failed to respond to quote");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading quotes...</div>;
  }

  const pendingQuotes = quotes.filter((q) => q.status === "PENDING");
  const otherQuotes = quotes.filter((q) => q.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quotes</h2>
        <p className="text-gray-500 mt-1">Review and respond to quote requests</p>
      </div>

      {/* Pending quotes */}
      {pendingQuotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-orange-600 mb-3">
            Pending Requests ({pendingQuotes.length})
          </h3>
          <div className="space-y-4">
            {pendingQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-xl p-5 border border-orange-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {quote.service.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {quote.property.address}, {quote.property.city},{" "}
                      {quote.property.state} {quote.property.zip}
                    </p>
                    <p className="text-sm text-gray-500">
                      Base price: ${Number(quote.service.basePrice).toFixed(2)}/
                      {quote.service.unit === "SQFT"
                        ? "sq ft"
                        : quote.service.unit === "HOUR"
                        ? "hr"
                        : "flat"}
                    </p>
                    {quote.customerNotes && (
                      <p className="text-sm text-gray-400 mt-2">
                        Customer notes: {quote.customerNotes}
                      </p>
                    )}
                  </div>
                </div>

                {respondingId === quote.id ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Price *
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="block w-40 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="Additional details about your quote..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(quote.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Send Quote
                      </button>
                      <button
                        onClick={() => {
                          setRespondingId(null);
                          setPrice("");
                          setNotes("");
                        }}
                        className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingId(quote.id)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Respond with Quote
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other quotes */}
      {otherQuotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quote History
          </h3>
          <div className="space-y-3">
            {otherQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {quote.service.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {quote.property.address}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {quote.customPrice && (
                    <span className="font-medium text-gray-900">
                      ${Number(quote.customPrice).toFixed(2)}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700"
                        : quote.status === "DECLINED"
                        ? "bg-red-100 text-red-700"
                        : quote.status === "SENT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No quotes yet. They&apos;ll appear here when customers request quotes
          from you.
        </div>
      )}
    </div>
  );
}
