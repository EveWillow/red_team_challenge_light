"use client";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ chat }) {
  return (
    <div className="space-y-2">
      {chat.map((m, idx) => (
        <div
          key={idx}
          className={`p-2 rounded overflow-hidden ${
            m.role === "user"
              ? "bg-blue-100 dark:bg-blue-700 text-right"
              : "bg-gray-100 dark:bg-gray-700 text-left"
          }`}
        >
          {/* Force line wrapping inside */}
          <div className="prose prose-sm max-w-full break-words whitespace-pre-wrap [&_*]:break-words [&_*]:whitespace-pre-wrap [&_*]:break-all">
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
