export default function Sidebar({ win, turnCount, lastJudge, instructions }) {
  return (
    <div className="w-64 ml-6 border p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-100">
      <h2 className="font-bold mb-2">Instructions</h2>
      <p className="text-sm mb-4">{instructions}</p>

      <h2 className="font-bold mb-2">Game Status</h2>
      <p>Turns: {turnCount}</p>
      <p>Win: {win ? "✅ Yes" : "❌ No"}</p>

    {lastJudge && (
    <div className="mt-4">
        <h4 className="text-xs font-semibold">Judge Verdict</h4>
        <strong className="text-xs font-semibold">{lastJudge.verdict}</strong> — <p className="text-xs">{lastJudge.explanation}</p>
    </div>
    )}
    </div>
  );
}
