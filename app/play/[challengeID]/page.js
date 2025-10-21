"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ChatWindow from "../../../components/ChatWindow";
import Sidebar from "../../../components/Sidebar";
import GuidelinesPanel from "../../../components/GuidelinesPanel";

export default function PlayPage() {
  const { challengeID } = useParams();
  const [realName, setRealName] = useState("");
  const [hackerName, setHackerName] = useState("");
  const [nameGateOpen, setNameGateOpen] = useState(true);

  const [instructions, setInstructions] = useState("");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [win, setWin] = useState(false);
  const [lastJudge, setLastJudge] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const realRef = useRef(null);
  const handleRef = useRef(null);

  // --- Setup & persistence ---
  useEffect(() => {
    let id = localStorage.getItem("rtc_playerId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("rtc_playerId", id);
    }
    setPlayerId(id);
  }, []);

  useEffect(() => {
    const rn = localStorage.getItem("rtc_realName") || "";
    const hn = localStorage.getItem("rtc_hackerName") || "";
    if (rn && hn) {
      setRealName(rn);
      setHackerName(hn);
      setNameGateOpen(false);
    } else {
      setTimeout(() => realRef.current?.focus(), 0);
    }
  }, []);

  // --- Load challenge metadata ---
  useEffect(() => {
    if (!challengeID || !playerId) return;
    fetch(`/api/challenges/${challengeID}?playerId=${playerId}`)
      .then((res) => res.json())
      .then((meta) => {
        setInstructions(meta.instructions || "");
        setChat(meta.chatHistory || []);
        setTurnCount(meta.turnCount || 0);
        setWin(meta.win ?? false);
        setLastJudge(meta.lastJudge || null);
        setTimeout(() => inputRef.current?.focus(), 0);
      })
      .catch(console.error);
  }, [challengeID, playerId]);

  // --- UI helpers ---
  useEffect(() => {
    if (!isPending && !win && !nameGateOpen) inputRef.current?.focus();
  }, [isPending, win, nameGateOpen]);

  useEffect(() => {
    if (chat.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function gateKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (realName.trim() && hackerName.trim()) saveNames();
      else if (!realName.trim()) realRef.current?.focus();
      else handleRef.current?.focus();
    }
  }

  function saveNames() {
    const rn = realName.trim();
    const hn = hackerName.trim();
    if (!rn || !hn) return;
    localStorage.setItem("rtc_realName", rn);
    localStorage.setItem("rtc_hackerName", hn);
    setNameGateOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function resetNames() {
    localStorage.removeItem("rtc_realName");
    localStorage.removeItem("rtc_hackerName");
    setRealName("");
    setHackerName("");
    setNameGateOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // --- Game actions ---
  async function handleSend() {
    if (!input || isPending || win || nameGateOpen) return;

    const userText = input;
    setInput("");
    setIsPending(true);

    const chatForServer = chat.filter((m) => !m.pending);
    const userMsg = { role: "user", content: userText };
    const pendingMsg = { role: "assistant", content: "…", pending: true };
    setChat([...chatForServer, userMsg, pendingMsg]);

    try {
      const res = await fetch(`/api/challenges/${challengeID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName,
          hackerName,
          playerId,
          input: userText,
          chatHistory: chatForServer,
        }),
      });

      const state = await res.json();
      setChat(state.chatHistory || []);
      setTurnCount(state.turnCount || 0);
      setWin(state.win ?? false);
      setLastJudge(state.lastJudge || null);
    } catch (err) {
      console.error(err);
      setChat((prev) => {
        const next = [...prev];
        const idx = next.findIndex((m) => m.pending);
        if (idx !== -1) {
          next[idx] = { role: "assistant", content: "Error: request failed." };
        } else {
          next.push({ role: "assistant", content: "Error: request failed." });
        }
        return next;
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleReset() {
    if (!challengeID) return;
    setChat([]);
    setTurnCount(0);
    setWin(false);
    setLastJudge(null);
    setInstructions("");

    try {
      await fetch(`/api/challenges/${challengeID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realName, hackerName, playerId }),
      });
      const res = await fetch(`/api/challenges/${challengeID}?playerId=${playerId}`);
      const meta = await res.json();
      setInstructions(meta.instructions || "");
      setChat(meta.chatHistory || []);
      setTurnCount(meta.turnCount || 0);
      setWin(meta.win ?? false);
      setLastJudge(meta.lastJudge || null);
    } catch (err) {
      console.error("Reset failed:", err);
    }

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

 // --- Render ---
  return (
    <main className="p-6 flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Name Gate Overlay */}
      {nameGateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            onKeyDown={gateKeyDown}
          >
            <h2 className="text-xl font-bold mb-2">welcome to red team challenge</h2>
            <p className="text-sm text-gray-600 mb-4">
              enter your real name + hacker handle (used for the leaderboard).
            </p>
            <label className="block text-sm font-medium mb-1">real name</label>
            <input
              ref={realRef}
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="Willow"
              className="w-full border rounded p-2 mb-3"
            />
            <label className="block text-sm font-medium mb-1">hacker handle</label>
            <input
              ref={handleRef}
              value={hackerName}
              onChange={(e) => setHackerName(e.target.value)}
              placeholder="404WillowNotFound"
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={saveNames}
                disabled={!realName.trim() || !hackerName.trim()}
                className={`px-4 py-2 rounded text-white ${
                  !realName.trim() || !hackerName.trim()
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 🔙 Back to Selector Button */}
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700
                         text-sm font-semibold transition-colors shadow"
            >
              ← Back to Selector
            </Link>

            <h1 className="text-2xl font-bold">Red Team Challenge</h1>
          </div>

          <div className="flex items-center gap-4">
            <GuidelinesPanel />
            {!nameGateOpen && hackerName && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                signed in as <span className="font-semibold">{hackerName}</span>
                <button
                  onClick={resetNames}
                  className="text-xs text-red-600 hover:underline"
                >
                  reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat container */}
        <div className="border rounded p-2 flex-1 flex flex-col">
          <div className="h-[420px] min-h-[200px] max-h-[80vh] overflow-auto resize-y rounded">
            <ChatWindow chat={chat} />
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input + buttons */}
        <div className="mt-4 flex">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={win || isPending || nameGateOpen}
            placeholder="Type your message..."
            rows={2}
            className="border p-2 flex-1 rounded resize-none"
          />
          <button
            onClick={handleSend}
            disabled={win || isPending || nameGateOpen}
            className={`ml-2 px-4 py-2 rounded text-white ${
              win || isPending || nameGateOpen
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isPending ? "…" : "Send"}
          </button>
          <button
            onClick={handleReset}
            disabled={nameGateOpen}
            className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      <Sidebar
        win={win}
        turnCount={turnCount}
        lastJudge={lastJudge}
        instructions={instructions}
      />
    </main>
  );
}