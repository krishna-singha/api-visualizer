import { NavLink } from "react-router-dom";
import dashb from "../assets/photos/dashboard.png";
import realt from "../assets/videos/real-time.mov";
import npm from "../assets/photos/npm.png";
import { Radio, Bug, TabletSmartphone } from "lucide-react";
import CodeBlock from "../components/CodeBlock"

const LandingPage = () => {
  return (
    <main className="w-full flex-1 text-white">
      {/* Hero Section */}
      <section className="text-center mb-8 min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center pb-16">
        <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl font-bold mb-6">
          Inspect API Requests Live
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Monitor, capture, and debug HTTP traffic from your local development server — in real time, from anywhere.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
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
      <section className="mb-20 sm:mb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
          Why Use API Visualizer?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left text-gray-300">
          <Feature
            title="Live Monitoring"
            icon={<Radio />}
            description="View live API traffic with headers, bodies, and status codes streamed instantly."
          />
          <Feature
            title="Debug Faster"
            icon={<Bug />}
            description="Structured payloads, readable headers, and clear response tracking."
          />
          <Feature
            title="Remote Access"
            icon={<TabletSmartphone />}
            description="Access your API logs from mobile, tablet, or another laptop—without running your backend there."
          />
        </div>
      </section>

      {/* Dashboard Preview */}
      <SectionBlock
        title="Powerful Visual Dashboard"
        img={dashb}
        imgAlt="Dashboard Preview"
        imgCaption="* Live traffic rendered in real time"
      >
        <p className="mb-4">
          Instantly view and filter every API call made to your backend. All
          requests are shown in a clean, structured view.
        </p>
        <p>See duration, headers, body, and status—all live and searchable.</p>
      </SectionBlock>

      {/* Real-Time Streaming */}
      <SectionBlock
        title="Real-Time Streaming"
        video={realt}
        videoCaption="* WebSocket-based traffic capture"
        reverse
      >
        <p className="mb-4">
          WebSocket tunnels ensure requests show up instantly — no polling, no
          delay.
        </p>
        <p>Seamless, live API tracking in your browser.</p>
      </SectionBlock>

      {/* NPM Package */}
      <SectionBlock
        title="Install via NPM"
        img={npm}
        imgAlt="npm package preview"
        reverse
      >
        <p className="mb-4">
          The{" "}
          <code className="bg-gray-700 px-1 rounded">api-visualizer</code>{" "}
          package hooks into your Express server and starts mirroring traffic
          instantly.
        </p>
        <p>It's built for simplicity — install, add middleware, and you're done.</p>
      </SectionBlock>

      {/* Middleware Integration */}
      <CodeBlock />



      {/* How It Works */}
      <section className="mb-20 sm:mb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-gray-300 text-center">
          <Step
            number={1}
            title="Install Middleware"
            text="Install from npm and import in your server code."
          />
          <Step
            number={2}
            title="Connect with Key"
            text="Use your API key to start sending data securely."
          />
          <Step
            number={3}
            title="See Logs Live"
            text="Every request to your server shows up on the dashboard in real time."
          />
        </div>
      </section>

      {/* CLI Example */}
      <section className="mb-20 sm:mb-24 flex flex-col">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
          Quick Install
        </h2>
        <div className="bg-gray-900 border border-gray-700 rounded-lg py-4 sm:py-6 px-6 sm:px-10 mx-auto text-green-400 font-mono text-sm sm:text-base text-center w-full sm:w-auto">
          <code>$ npm install api-visualizer</code>
        </div>
        <p className="text-center text-gray-500 mt-4">
          For Node.js servers built with Express.
        </p>
      </section>

      {/* Compatibility */}
      <section className="mb-20 sm:mb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
          Works With
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 text-gray-300">
          <InfoList
            title="Supported"
            items={[
              "Node.js 18 or newer",
              "Express 4 and Express 5",
              "JavaScript and TypeScript (types included)",
              "ES modules (import) and CommonJS (require)",
              "Any host: localhost, Docker, a VPS or the cloud",
            ]}
          />
          <InfoList
            title="Good to know"
            items={[
              "Other frameworks (Fastify, Koa, Hono, Next.js API routes) aren't supported yet",
              "File uploads need a parser like multer; fields and file names are logged, not file contents",
              "Passwords, tokens, cookies and Authorization headers are redacted by default (v2.1.0+)",
              "Bodies over 100 KB are truncated; binary and compressed bodies show only their size",
              "No port forwarding or public URL needed: your server connects out to the dashboard",
            ]}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20 sm:mb-24 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
          FAQs
        </h2>
        <FAQ q="Which servers does it work with?" a="Node.js servers using Express 4 or 5. Other frameworks aren't supported yet." />
        <FAQ q="Do I need TypeScript?" a="No. It works in plain JavaScript; TypeScript types are included if you use them." />
        <FAQ q="Does it store my data?" a="No, unless you enable History. Then your last 50 requests are saved to your account." />
        <FAQ q="Where do I put my API key?" a="In an environment variable such as API_VISUALIZER_KEY, never in your code." />
        <FAQ q="Is it production-safe?" a="This tool is intended for development only." />
      </section>

      {/* CTA */}
      <section className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
          Start Monitoring Your APIs
        </h2>
        <p className="text-gray-400 mb-6">
          Launch the dashboard or install the middleware to begin.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <NavLink
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition text-center"
          >
            Open Dashboard
          </NavLink>
          <NavLink
            to="https://www.npmjs.com/package/api-visualizer"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition text-center"
          >
            View NPM Package
          </NavLink>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

// Shared SectionBlock for reusability
const SectionBlock = ({
  title,
  children,
  img,
  imgAlt,
  imgCaption,
  video,
  videoCaption,
  reverse = false,
}: {
  title: string;
  children: React.ReactNode;
  img?: string;
  imgAlt?: string;
  imgCaption?: string;
  video?: string;
  videoCaption?: string;
  reverse?: boolean;
}) => (
  <section className="mb-20 sm:mb-24">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{title}</h2>
    <div
      className={`flex flex-col ${reverse ? "md:flex-row" : "md:flex-row-reverse"
        } items-center gap-8 sm:gap-10`}
    >
      <div className="md:w-1/2 text-gray-300">{children}</div>
      <div className="md:w-1/2 w-full">
        {img && (
          <>
            <img
              src={img}
              alt={imgAlt}
              className="rounded-lg shadow-lg w-full"
            />
            {imgCaption && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {imgCaption}
              </p>
            )}
          </>
        )}
        {video && (
          <>
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="rounded-lg shadow-md w-full"
            ></video>
            {videoCaption && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {videoCaption}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  </section>
);

// Subcomponents
const Feature = ({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <div className="rounded-xl border border-gray-700/50 p-6">
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-lg sm:text-xl font-semibold ml-2 text-white">
        {title}
      </h3>
    </div>
    <p className="text-gray-400 text-sm sm:text-base">{description}</p>
  </div>
);

const Step = ({
  number,
  title,
  text,
}: {
  number: number;
  title: string;
  text: string;
}) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
    <div className="text-xl sm:text-2xl font-bold text-blue-500 mb-2">
      Step {number}
    </div>
    <h4 className="text-lg sm:text-xl text-white mb-1">{title}</h4>
    <p className="text-sm sm:text-base text-gray-400">{text}</p>
  </div>
);

const InfoList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
    <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
    <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-400">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const FAQ = ({ q, a }: { q: string; a: string }) => (
  <div className="mb-6 text-center">
    <h3 className="text-base sm:text-lg font-medium text-white">{q}</h3>
    <p className="text-gray-400 mt-1 text-sm sm:text-base">{a}</p>
  </div>
);
