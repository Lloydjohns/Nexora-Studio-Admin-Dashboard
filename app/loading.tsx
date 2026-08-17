export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-primary dark:border-slate-800" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your workspace</p>
      </div>
    </main>
  );
}
