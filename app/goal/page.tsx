"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { continueGoalConversation } from "@/app/actions/goal";
import { ToneSelector } from "@/app/components/ToneSelector";
import { Tone, Goal, Message } from "@/types/goal";

const INITIAL_MESSAGE: Message = {
  role: "agent",
  content:
    "Hi! I'm here to help you set a running goal. What distance would you like to be able to run, and when do you want to achieve it by?",
};

export default function GoalPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("encouraging");
  const [goal, setGoal] = useState<Goal>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await continueGoalConversation(
        updatedMessages,
        tone,
        goal
      );

      setGoal(response.goal);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: response.reply },
      ]);

      if (response.readyForConfirmation && response.goal.completionWeeks && response.goal.abilityLevel) {
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Error in goal conversation:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessage();
    }
  }

  function handleConfirm() {
    if (!goal.completionWeeks || !goal.abilityLevel) return;

    const params = new URLSearchParams({
      ability: goal.abilityLevel,
      weeks: String(goal.completionWeeks),
      frequency: String(goal.frequency ?? 3),
      distance: goal.targetDistance ?? "5K",
    });

    if (goal.unavailableDays?.length) {
      params.set('unavailableDays', goal.unavailableDays.join(','));
    }
    if (goal.injuries) {
      params.set('injuries', encodeURIComponent(goal.injuries));
    }

    router.push(`/plan?${params.toString()}`);
  }

  function handleEdit() {
    setShowConfirmation(false);
    setMessages((prev) => [
      ...prev,
      { role: "agent", content: "No problem! What would you like to change?" },
    ]);
  }

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Define Your Running Goal</h1>
        <ToneSelector
          selectedTone={tone}
          onToneChange={setTone}
          disabled={loading}
        />
      </div>

      <div className="border rounded-lg p-4 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                message.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Confirmation card */}
      {showConfirmation && (
        <div className="mb-4 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Your Goal Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{goal.targetDistance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timeline:</span>
              <span className="font-medium">{goal.completionWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium capitalize">{goal.abilityLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Training days:</span>
              <span className="font-medium">{goal.frequency ?? 3} days/week</span>
            </div>
            {goal.unavailableDays && goal.unavailableDays.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Rest days:</span>
                <span className="font-medium capitalize">{goal.unavailableDays.join(', ')}</span>
              </div>
            )}
            {goal.injuries && (
              <div className="flex justify-between">
                <span className="text-gray-600">Considerations:</span>
                <span className="font-medium">{goal.injuries}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Confirm & Generate Plan
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Goal progress indicator */}
      {(goal.targetDistance || goal.completionWeeks || goal.abilityLevel || goal.frequency || goal.unavailableDays?.length || goal.injuries) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <span className="font-medium">Extracted so far: </span>
          {goal.targetDistance && (
            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
              {goal.targetDistance}
            </span>
          )}
          {goal.completionWeeks && (
            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
              {goal.completionWeeks} weeks
            </span>
          )}
          {goal.abilityLevel && (
            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
              {goal.abilityLevel}
            </span>
          )}
          {goal.frequency && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
              {goal.frequency} days/week
            </span>
          )}
          {goal.unavailableDays && goal.unavailableDays.length > 0 && (
            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">
              No {goal.unavailableDays.join(', ')}
            </span>
          )}
          {goal.injuries && (
            <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded">
              {goal.injuries}
            </span>
          )}
        </div>
      )}

      {!showConfirmation && (
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded-lg p-3 resize-none"
            placeholder="Type your response... (Press Enter to send)"
            rows={2}
            disabled={loading}
          />
          <button
            className="rounded-lg bg-black px-6 py-2 text-white disabled:opacity-50 self-end"
            disabled={loading || !input.trim()}
            onClick={handleMessage}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      )}
    </main>
  );
}
