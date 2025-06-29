export default function Documentation() {
    return (
        <main className="text-white">
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Introduction */}
                <section className="mb-16">
                    <h1 className="text-5xl font-extrabold mb-6">API Visualizer</h1>
                    <p className="text-lg text-gray-400 mb-6">
                        API Visualizer is a real-time API request monitoring and inspection tool that bridges the gap between your development environment and production-grade observability.
                        It allows developers to view HTTP traffic from local servers — including headers, body, metadata, and authentication — through a modern WebSocket tunnel.
                    </p>
                    <p className="text-md text-gray-500 mb-6">
                        Built for modern full-stack workflows, API Visualizer helps developers debug requests with precision, analyze traffic across endpoints, and visualize API behavior as it happens — all with zero configuration in production.
                    </p>
                    <img
                        src="/docs/overview.png"
                        alt="App Overview"
                        className="rounded-xl shadow-xl border border-gray-800 w-full"
                    />
                </section>

                {/* Why API Visualizer? */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Why Use API Visualizer?</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-4">
                        <li>
                            Traditional tools like Postman or Chrome DevTools only capture traffic from the browser — not from other apps or backend servers.
                        </li>
                        <li>
                            Monitoring local API behavior often requires adding middleware, printing logs, or using complex proxies. This tool simplifies that with a single agent.
                        </li>
                        <li>
                            Frontend developers can gain instant visibility into backend responses, status codes, latency, and errors during integration.
                        </li>
                        <li>
                            Works across any tech stack or framework — Express, Flask, Django, FastAPI, Laravel, Spring Boot — anything that talks HTTP.
                        </li>
                    </ul>
                </section>

                {/* Architecture Overview */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Architecture</h2>
                    <p className="text-gray-400 mb-6">
                        API Visualizer is composed of three modular components:
                    </p>
                    <ul className="list-disc list-inside space-y-4 text-gray-300">
                        <li><strong>Local Agent (CLI):</strong> Runs on your machine, acting as a lightweight proxy that intercepts HTTP requests and forwards them over a secure WebSocket.</li>
                        <li><strong>Tunnel Server (Node.js):</strong> Manages WebSocket connections between the agent and the frontend, ensuring data is streamed in real-time.</li>
                        <li><strong>Web Frontend (React + Tailwind):</strong> Provides an interactive UI to view requests, inspect headers/bodies, and filter or sort logs.</li>
                    </ul>
                    <p className="text-gray-500 mt-4">
                        No traffic leaves your machine unless the agent is explicitly running. All connections are encrypted and session-scoped.
                    </p>
                </section>

                {/* Features */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Core Features</h2>
                    <ul className="list-disc list-inside space-y-4 text-gray-300">
                        <li><strong>Live Traffic Viewer:</strong> Inspect requests and responses as they occur in real-time.</li>
                        <li><strong>Header Inspector:</strong> View all HTTP headers including content-type, auth tokens, and custom keys.</li>
                        <li><strong>Body Parser:</strong> Auto-decodes JSON, form-data, raw buffers, and base64-encoded bodies.</li>
                        <li><strong>Authentication Awareness:</strong> Detects Basic and Bearer tokens and shows structured output.</li>
                        <li><strong>Status & Metadata:</strong> Shows HTTP status, duration in ms, IP address, port, and body size.</li>
                        <li><strong>Offline Mode:</strong> Works with localhost only — no need to expose services to the web.</li>
                        <li><strong>Multi-platform Support:</strong> Agent works on macOS, Linux, and Windows.</li>
                    </ul>
                </section>

                {/* Installation */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Installation</h2>
                    <ol className="list-decimal list-inside space-y-6 text-gray-300">
                        <li>
                            <strong>Install the CLI Agent:</strong>
                            <pre className="bg-gray-900 text-green-300 p-3 mt-2 rounded-md font-mono text-sm">
                                npm install -g api-visualizer-agent
                            </pre>
                        </li>
                        <li>
                            <strong>Run the Agent on your backend port:</strong>
                            <pre className="bg-gray-900 text-green-300 p-3 mt-2 rounded-md font-mono text-sm">
                                api-visualizer-agent --port 8000
                            </pre>
                        </li>
                        <li>
                            <strong>Go to the frontend UI and connect:</strong> Visit <code className="bg-gray-800 px-2 py-1 rounded text-sm">http://localhost:3000</code> and click "Connect".
                        </li>
                    </ol>
                    <img
                        src="/docs/live-demo.gif"
                        alt="Live demo of request logs"
                        className="rounded-xl mt-6 border border-gray-800 shadow-xl"
                    />
                </section>

                {/* API Endpoints */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">API Endpoints</h2>
                    <div className="overflow-auto rounded-lg border border-gray-800">
                        <table className="min-w-full text-sm text-left text-gray-300">
                            <thead className="bg-gray-800 text-gray-400">
                                <tr>
                                    <th className="px-4 py-2 border border-gray-700">Endpoint</th>
                                    <th className="px-4 py-2 border border-gray-700">Method</th>
                                    <th className="px-4 py-2 border border-gray-700">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border border-gray-800">/api/request-log/add</td>
                                    <td className="px-4 py-2 border border-gray-800">POST</td>
                                    <td className="px-4 py-2 border border-gray-800">Ingests a captured request (stored in MongoDB)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border border-gray-800">/api/request-log/get/:uid</td>
                                    <td className="px-4 py-2 border border-gray-800">GET</td>
                                    <td className="px-4 py-2 border border-gray-800">Returns latest 50 logs for the user session</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Example Output */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Example Log</h2>
                    <p className="text-gray-400 mb-4">Here’s what a typical captured request looks like:</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-800">
{`{
  "method": "POST",
  "url": "/api/user",
  "status": 201,
  "duration": 243,
  "size": { "request": 245, "response": 1320 },
  "headers": {
    "content-type": "application/json",
    "authorization": "Bearer abc123"
  },
  "body": {
    "email": "user@example.com",
    "password": "•••••••"
  }
}`}
                    </pre>
                </section>

                {/* Security */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Security & Privacy</h2>
                    <p className="text-gray-400">
                        API Visualizer is designed to work only in your development environment. The agent never exposes ports to the public internet, and the tunnel is encrypted using secure WebSocket connections (wss://). No data is stored permanently unless explicitly logged.
                    </p>
                </section>

                {/* Future Plans */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-6">Roadmap & Extensibility</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-4">
                        <li>🔧 Filtering by endpoint, method, or response status</li>
                        <li>📁 Export logs to JSON/CSV for audits</li>
                        <li>🔌 Plugin system for custom middleware inspection</li>
                        <li>💬 Webhook integration for alerting</li>
                        <li>📜 Replay captured requests via the UI</li>
                    </ul>
                </section>

                {/* Footer */}
                <section className="pt-12 border-t border-gray-800 text-center text-sm text-gray-600">
                    Made with ❤️ by developers, for developers. &nbsp;|&nbsp; MIT License.
                </section>
            </div>
        </main>
    );
}
