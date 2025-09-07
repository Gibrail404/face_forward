"use client";

import { useState, useEffect } from "react";

interface Message {
  sender: "bot" | "user";
  text: string;
  time: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [helpData, setHelpData] = useState<Record<string, string>>({});
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);

  // Load help.json
  useEffect(() => {
    fetch("/static/help.json")
      .then((res) => res.json())
      .then((data) => {
        setHelpData(data);
        setAvailableQuestions(Object.keys(data));
        setMessages([
          {
            sender: "bot",
            text: "Hi, welcome to AGL ChatBot! 😄",
            time: getTime(),
          },
        ]);
      })
      .catch((err) => console.error("Error loading help.json:", err));
  }, []);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input.trim();
    const userMsg: Message = {
      sender: "user",
      text: query,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Case 1: User selected a valid question
    if (availableQuestions.includes(query)) {
      const answer = helpData[query];
      const remaining = availableQuestions.filter((q) => q !== query);
      setAvailableQuestions(remaining);

      setTimeout(() => {
        const botMsg: Message = {
          sender: "bot",
          text: answer,
          time: getTime(),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (remaining.length === 0) {
          const endMsg: Message = {
            sender: "bot",
            text: "✅ That’s all! No more questions left.",
            time: getTime(),
          };
          setMessages((prev) => [...prev, endMsg]);
        }
      }, 400);

      setStarted(true);
      return;
    }

    // Case 2: First query but invalid → show hint
    if (!started) {
      setStarted(true);
      setTimeout(() => {
        const botMsg: Message = {
          sender: "bot",
          text: "Please choose a valid question from the suggestions below ⬇️",
          time: getTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 400);
      return;
    }

    // Case 3: Invalid query after start
    setTimeout(() => {
      const botMsg: Message = {
        sender: "bot",
        text: "❌ Not a valid option. Please pick from the list.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-white shadow-blue-600 p-3 rounded-full shadow-lg hover:bg-slate-300 transition"
      >
           <img
                        src="/static/logo.png"
                        alt="logo"
                        className="w-10 h-1o object-contain"
                    />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden mt-3">
          {/* Header */}
          <div className="bg-blue-950 text-white px-4 py-2 flex justify-between items-center">
            <span className="font-semibold">AGL ChatBot</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-950 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div>{msg.text}</div>
                  <div className="text-[10px] text-gray-500 mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 border-t flex items-center space-x-2">
            <input
              type="text"
              list="chat-options"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or pick a question..."
              className="flex-1 px-3 py-2 text-sm border rounded-lg text-black focus:outline-none focus:ring focus:ring-indigo-300 placeholder:text-black"
            />
            <datalist id="chat-options">
              {availableQuestions.map((q, idx) => (
                <option key={idx} value={q} />
              ))}
            </datalist>
            <button
              type="submit"
              className="bg-blue-950 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
