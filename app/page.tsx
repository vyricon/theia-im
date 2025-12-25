export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl font-bold">Theia Smart Relay Mode</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🚀 Status</h2>
          <p>Bot Status: Run <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run bot</code> to start</p>
          <p>iMessage SDK Server: Ensure it's accessible at <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:1234</code></p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">✨ Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>✅ Message Relay (You → Theia → Contacts)</li>
            <li>✅ AI Auto-Respond (Contacts → Theia → AI Response)</li>
            <li>✅ Urgency Detection (keywords, CAPS, !!!)</li>
            <li>✅ Status Management (available/busy/away/sleep/dnd)</li>
            <li>✅ Conversation Threading</li>
            <li>✅ Message Digest</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">⌨️ Commands</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>@contact Send: message</code> - Send to contact</li>
            <li><code>Reply: message</code> - Reply to last sender</li>
            <li><code>/status [mode]</code> - Set status (available/busy/away/sleep/dnd)</li>
            <li><code>/status check</code> - View current status</li>
            <li><code>/digest</code> - Get message summary</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🔧 Setup</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Verify iMessage is configured on your Mac</li>
            <li>Configure environment variables in <code>.env</code></li>
            <li>Run database migrations on Supabase</li>
            <li>Start the bot: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run bot</code></li>
          </ol>
        </section>
      </div>
    </main>
  );
}
