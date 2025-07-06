import { NavLink } from "react-router-dom";
import dashb from "../assets/photos/dashboard.png";
import realt from "../assets/videos/real-time.mov";
import npm from "../assets/photos/npm.png";

const LandingPage = () => {
  return (
    <main className="w-full flex-1 text-white py-16 px-6 sm:px-12">
      {/* Hero Section */}
      <section className="text-center mb-24">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Inspect API Requests Live 🚦
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Monitor, capture, and debug HTTP traffic from your local development server — in real time, from anywhere.
        </p>
        <div className="flex justify-center gap-4">
          <NavLink
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
          >
            Launch Dashboard
          </NavLink>
          <NavLink
            to="https://www.npmjs.com/package/api-visualizer"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition"
          >
            Download Middleware
          </NavLink>
        </div>
      </section>

      {/* Features */}
      <section className="mb-24">
        <h2 className="text-3xl font-semibold mb-6">Why Use API Visualizer?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left text-gray-300">
          <Feature title="🔍 Live Monitoring" description="View live API traffic with headers, bodies, and status codes streamed instantly." />
          <Feature title="🧪 Debug Faster" description="Structured payloads, decoded headers, and clear response tracking." />
          <Feature title="🌐 Remote Access" description="Access your API logs from mobile, tablet, or another laptop—without running your backend there." />
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="mb-24">
        <h2 className="text-3xl font-semibold mb-6">Powerful Visual Dashboard</h2>
        <div className="flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="md:w-1/2 text-gray-300">
            <p className="mb-4">
              Instantly view and filter every API call made to your backend. All requests are shown in a clean, structured view.
            </p>
            <p>See duration, headers, body, and status—all live and searchable.</p>
          </div>
          <div className="md:w-1/2">
            <img src={dashb} alt="Dashboard Preview" className="rounded-lg shadow-lg" />
            <p className="text-sm text-gray-500 mt-2 text-center">* Live traffic rendered in real time</p>
          </div>
        </div>
      </section>

      {/* Real-Time Streaming */}
      <section className="mb-24">
        <h2 className="text-3xl font-semibold mb-6">Real-Time Streaming</h2>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <video
              src={realt}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-lg shadow-md w-full"
            ></video>
            <p className="text-sm text-gray-500 mt-2 text-center">* WebSocket-based traffic capture</p>
          </div>
          <div className="md:w-1/2 text-gray-300">
            <p className="mb-4">
              WebSocket tunnels ensure requests show up instantly — no polling, no delay.
            </p>
            <p>Seamless, live API tracking in your browser.</p>
          </div>
        </div>
      </section>

      {/* NPM Package */}
      <section className="mb-24">
        <h2 className="text-3xl font-semibold mb-6">Install via NPM</h2>
        <div className="flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="md:w-1/2 text-gray-300">
            <p className="mb-4">
              The <code className="bg-gray-700 px-1 rounded">api-visualizer</code> package hooks into your Express server and starts mirroring traffic instantly.
            </p>
            <p>It's built for simplicity — install, add middleware, and you're done.</p>
          </div>
          <div className="md:w-1/2">
            <img src={npm} alt="npm package preview" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-24">
        <h2 className="text-3xl font-semibold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-gray-300 text-center">
          <Step number={1} title="Install Middleware" text="Install from npm and import in your server code." />
          <Step number={2} title="Connect with Key" text="Use your API key to start sending data securely." />
          <Step number={3} title="See Logs Live" text="All requests made to localhost show up in real time." />
        </div>
      </section>

      {/* CLI Example */}
      <section className="mb-24 flex flex-col">
        <h2 className="text-3xl font-semibold mb-6 text-center">Quick Install</h2>
        <div className="bg-gray-900 border border-gray-700 rounded-lg py-6 px-10 mx-auto text-green-400 font-mono text-sm text-center">
          <code>$ npm install api-visualizer</code>
        </div>
        <p className="text-center text-gray-500 mt-4">Currently supports Express.js with Node.js.</p>
      </section>

      {/* FAQ */}
      <section className="mb-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center">FAQs</h2>
        <FAQ q="Does it store my data?" a="No, unless you enable History." />
        <FAQ q="Is it production-safe?" a="This tool is intended for development only." />
      </section>

      {/* CTA */}
      <section className="text-center mb-10">
        <h2 className="text-3xl font-semibold mb-4">Start Monitoring Your APIs</h2>
        <p className="text-gray-400 mb-6">Launch the dashboard or install the middleware to begin.</p>
        <div className="flex justify-center gap-4">
          <NavLink to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
            Open Dashboard
          </NavLink>
          <NavLink to="https://www.npmjs.com/package/api-visualizer" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition">
            View NPM Package
          </NavLink>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

// Subcomponents

const Feature = ({ title, description }: { title: string; description: string }) => (
  <div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p>{description}</p>
  </div>
);

const Step = ({ number, title, text }: { number: number; title: string; text: string }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
    <div className="text-2xl font-bold text-blue-500 mb-2">Step {number}</div>
    <h4 className="text-xl text-white mb-1">{title}</h4>
    <p>{text}</p>
  </div>
);

const FAQ = ({ q, a }: { q: string; a: string }) => (
  <div className="mb-6 text-center">
    <h3 className="text-lg font-medium text-white">{q}</h3>
    <p className="text-gray-400 mt-1">{a}</p>
  </div>
);
