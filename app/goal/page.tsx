"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { continueGoalConversation } from "@/app/actions/goal";
import { ToneSelector } from "@/app/components/ToneSelector";
import { Tone, Goal, Message } from "@/types/goal";
import { PotatoMascot, PotatoFlexing } from "@/app/components/PotatoMascot";

const INITIAL_MESSAGE: Message = {
  role: "agent",
  content:
    "Hi there, future hot chip! I'm Coach Spud, and I'm here to help you set a running goal. What distance would you like to be able to run, and when do you want to achieve it by?",
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
          content: "Oops! Something went wrong. Let's try that again!",
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
        <h1 className="text-2xl font-bold text-stone-dark">Define Your Running Goal</h1>
        <ToneSelector
          selectedTone={tone}
          onToneChange={setTone}
          disabled={loading}
        />
      </div>

      <div className="card mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-end gap-2" style={{ justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
              {message.role === "agent" && (
                <PotatoMascot size={32} className="flex-shrink-0 mb-1" />
              )}
              <div
                className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                  message.role === "user"
                    ? "bg-stone-dark text-white rounded-br-md"
                    : "bg-cream-dark text-stone-dark rounded-bl-md"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="flex items-end gap-2">
              <PotatoMascot size={32} className="flex-shrink-0 mb-1 animate-bounce" />
              <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-cream-dark">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-stone rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-stone rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation card */}
      {showConfirmation && (
        <div className="mb-4 p-4 border-2 border-sage bg-success-light rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <PotatoFlexing size={48} />
            <h3 className="font-semibold text-lg text-stone-dark">Your Goal Summary</h3>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-stone">Distance:</span>
              <span className="font-medium text-stone-dark">{goal.targetDistance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Timeline:</span>
              <span className="font-medium text-stone-dark">{goal.completionWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Experience:</span>
              <span className="font-medium text-stone-dark capitalize">{goal.abilityLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Training days:</span>
              <span className="font-medium text-stone-dark">{goal.frequency ?? 3} days/week</span>
            </div>
            {goal.unavailableDays && goal.unavailableDays.length > 0 && (
              <div className="flex justify-between">
                <span className="text-stone">Rest days:</span>
                <span className="font-medium text-stone-dark capitalize">{goal.unavailableDays.join(', ')}</span>
              </div>
            )}
            {goal.injuries && (
              <div className="flex justify-between">
                <span className="text-stone">Considerations:</span>
                <span className="font-medium text-stone-dark">{goal.injuries}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-sage-dark text-white py-3 px-4 rounded-full hover:bg-sage transition-colors font-medium"
            >
              Let&apos;s Do This!
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 btn-secondary"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Goal progress indicator */}
      {(goal.targetDistance || goal.completionWeeks || goal.abilityLevel || goal.frequency || goal.unavailableDays?.length || goal.injuries) && (
        <div className="mb-4 p-3 bg-cream-dark rounded-xl text-sm">
          <span className="font-medium text-stone-dark">Extracted so far: </span>
          {goal.targetDistance && (
            <span className="inline-block bg-success-light text-sage-dark px-2 py-1 rounded-full mr-2 text-xs">
              {goal.targetDistance}
            </span>
          )}
          {goal.completionWeeks && (
            <span className="inline-block bg-success-light text-sage-dark px-2 py-1 rounded-full mr-2 text-xs">
              {goal.completionWeeks} weeks
            </span>
          )}
          {goal.abilityLevel && (
            <span className="inline-block bg-success-light text-sage-dark px-2 py-1 rounded-full mr-2 text-xs">
              {goal.abilityLevel}
            </span>
          )}
          {goal.frequency && (
            <span className="inline-block bg-potato-body text-stone-dark px-2 py-1 rounded-full mr-2 text-xs">
              {goal.frequency} days/week
            </span>
          )}
          {goal.unavailableDays && goal.unavailableDays.length > 0 && (
            <span className="inline-block bg-warning-light text-stone-dark px-2 py-1 rounded-full mr-2 text-xs">
              No {goal.unavailableDays.join(', ')}
            </span>
          )}
          {goal.injuries && (
            <span className="inline-block bg-error-light text-stone-dark px-2 py-1 rounded-full text-xs">
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
            className="flex-1 border-2 border-stone-light rounded-xl p-3 resize-none bg-white focus:border-potato-body"
            placeholder="Type your response... (Press Enter to send)"
            rows={2}
            disabled={loading}
          />
          <button
            className="btn-primary self-end disabled:opacity-50"
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
