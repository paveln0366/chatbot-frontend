"use client";

import {FormEvent, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setError(null);
        setMessages((prev) => [...prev, {role: "user", content: trimmed}]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: trimmed}),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || `Ошибка сервера (${res.status})`);
            }

            setMessages((prev) => [
                ...prev,
                {role: "assistant", content: data.reply},
            ]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-4">
            <h1 className="mb-4 text-xl font-semibold">AI Chatbot</h1>

            <div className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
                {messages.length === 0 && (
                    <p className="text-sm text-neutral-500">
                        Напиши первое сообщение, чтобы начать диалог.
                    </p>
                )}

                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                            m.role === "user"
                                ? "ml-auto max-w-[80%] bg-neutral-900 text-white"
                                : "mr-auto max-w-[80%] bg-neutral-100 text-neutral-900"
                        }`}
                    >
                        {m.content}
                    </div>
                ))}

                {loading && (
                    <p className="text-sm text-neutral-500">Бот печатает...</p>
                )}

                {error && (
                    <p className="text-sm text-red-600">Ошибка: {error}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Введите сообщение..."
                    disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                    Отправить
                </Button>
            </form>
        </main>
    );
}