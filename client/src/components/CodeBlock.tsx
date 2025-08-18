// import { useState } from "react";

// const CodeBlock = ({ filename = "app.js/app.ts" }) => {
//   const [copied, setCopied] = useState(false);

//   const codeString = `
//   import express from "express";

//   //-------- IMPORT API COMPONENTS --------
//   import { connectToTunnel, tunnelMiddleware } from "api-visualizer";

//   // ------- CONNECT TO THE TUNNEL WITH YOUR API KEY ---------
//   (async () => {
//     try {
//       connectToTunnel("YOUR_API_KEY"); // 🔑 REPLACE WITH YOU API KEY -------
//     } catch (err) {
//       console.error("[Tunnel] Failed to connect:", err);
//     }
//   })();

//   const app = express();

//   // -------- ATTACH THE MIDDLEWARE -------
//   app.use(tunnelMiddleware);

//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));

//   app.post("/api", (req, res) => {
//     res.json({ message: "Received", body: req.body });
//   });

//   app.listen(3000, () => {
//     console.log("Server running at http://localhost:3000");
//   });
//   `;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(codeString);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 3000);
//   };

//   return (
// <section className="mb-20 sm:mb-24 max-w-4xl mx-auto">
//   <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
//     Connect Middleware to Your Server
//   </h2>

//       {/* Filename Header */}
// <div className="max-w-4xl mx-auto mb-2 text-sm text-gray-400 font-mono">
//   {filename}
// </div>

// <div className="relative bg-gray-900 border border-gray-700 rounded-lg overflow-x-auto p-6 sm:p-10">
//   {/* Copy Button */}
//   <button
//     onClick={handleCopy}
//     className="cursor-pointer absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1 rounded text-sm transition-colors"
//   >
//     {copied ? "Copied!" : "Copy"}
//   </button>

//         <pre className="font-mono text-sm sm:text-base leading-relaxed">
//           <code>
//             {codeString.split("\n").map((line, idx) => {
//               // Highlight comments in gray
//               if (line.trim().startsWith("//")) {
//                 return (
//                   <div key={idx} className="text-gray-500">
//                     {line}
//                   </div>
//                 );
//               }
//               // Highlight specific import line in light blue
//               if (line.includes("import { apiVisualizer } from 'api-visualizer'")) {
//                 return (
//                   <div key={idx} className="text-blue-400">
//                     {line}
//                   </div>
//                 );
//               }
//               return <div key={idx} className="text-green-400">{line}</div>;
//             })}
//           </code>
//         </pre>

//       </div>

//       <p className="text-center text-gray-400 mt-4">
//         Simply import the middleware and add your API key — requests start streaming live instantly.
//       </p>
//     </section>
//   );
// };

// export default CodeBlock;

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const codeString = `import express from "express";

// IMPORT API COMPONENTS
import { connectToTunnel, tunnelMiddleware } from "api-visualizer";

// CONNECT TO THE TUNNEL WITH YOUR API KEY
(async () => {
  try {
    connectToTunnel("YOUR_API_KEY");          // REPLACE WITH YOUR API KEY
  } catch (err) {
    console.error("[Tunnel] Failed to connect:", err);
  }
})();

const app = express();

// ATTACH THE MIDDLEWARE
app.use(tunnelMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api", (req, res) => {
  res.json({ message: "Received", body: req.body });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});`;

const CodeBlock = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="mb-20 sm:mb-24 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
        Connect Middleware to Your Server
      </h2>

      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-x-auto p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400 font-mono">
            app.js/app.ts
          </div>
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1 rounded text-sm transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber) => {
            if (lineNumber === 4 || lineNumber === 18 || lineNumber >= 7 && lineNumber <= 13) {
              return { style: { backgroundColor: "rgba(255,255,0,0.1)" } };
            }
            return {};
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </section>
  );
}

export default CodeBlock;