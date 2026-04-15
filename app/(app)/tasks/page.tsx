'use client';

import { useEffect, useState } from 'react';

type Task = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  source: string | null;
  blocker: boolean;
  done: boolean;
  created_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    try {
      const res = await fetch('/api/tasks/list');
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Aufgaben konnten nicht geladen werden');
      setTasks(data.tasks || []);
    } catch (e: any) {
      setError(e.message || 'Fehler');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Aufgaben</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hier landen die Aufgaben aus Dokumenten- und Baustellen-KI.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-sm text-slate-500">Noch keine Aufgaben vorhanden.</div>
          ) : (
       tasks.map((task) => (
  <div
    key={task.id}
    className={`rounded-2xl border p-4 ${
      task.done
        ? 'border-slate-200 bg-slate-50 opacity-60'
        : task.blocker
        ? 'border-red-200 bg-red-50/40'
        : 'border-slate-200 bg-white'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={`font-medium text-slate-900 ${task.done ? 'line-through' : ''}`}>
          {task.blocker ? '🔴 ' : ''}{task.title}
        </div>

        <div className="mt-1 text-sm text-slate-500">
          Priorität: {task.priority} · Status: {task.done ? 'erledigt' : task.status}
        </div>

        {task.due_date ? (
          <div className="mt-1 text-sm text-slate-500">Fällig: {task.due_date}</div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-slate-400">{task.source}</div>

        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/tasks/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: task.id,
                  done: !task.done,
                }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Status konnte nicht geändert werden');

              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, done: !t.done } : t
                )
              );
            } catch (e: any) {
              setError(e.message || 'Fehler beim Aktualisieren');
            }
          }}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white"
        >
          {task.done ? 'Als offen markieren' : 'Erledigen'}
        </button>
      </div>
    </div>
  </div>
))
