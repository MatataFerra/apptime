"use client";

export default function ErrorTracker() {
  return (
    <div className="h-[50dvh] w-full">
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-lg">An error occurred while trying to load the tracker.</p>
      </div>
    </div>
  );
}
