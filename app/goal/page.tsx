"use client";
import { useState } from "react";
import { continueGoalConversation } from "@/app/actions/goal";

type Message = {
  role: "user" | "agent";
  content: string;
};

export default function Goal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Let's start by defining your goal. Tell me what you'd like to achieve.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const response = await continueGoalConversation([...messages, userMessage]);

    setMessages((prev) => [
      ...prev,
      { role: "agent", content: response.reply },
    ]);

    setLoading(false);
  }

  return (
    <div>
      <h2>Define your goal...</h2>
      <div>
        {messages.map((message, index) => {
          return <p key={index}>{message.content}</p>;
        })}
      </div>
      <div className="flex flex-col m-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-sm p-2 my-2"
          placeholder="Type your response..."
        />

        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
          onClick={handleMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
