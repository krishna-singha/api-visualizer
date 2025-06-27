// const TUNNEL_URL = import.meta.env.VITE_TUNNEL_SOCKET_URL;

// export const sendTunnelRequest = async (request: unknown) => {
//   return new Promise((resolve, reject) => {
//     const socket = new WebSocket(TUNNEL_URL);

//     socket.onopen = () => {
//       console.log('📡 WebSocket connected');
//       console.log('📦 Sending request to tunnel:', request);
//       socket.send(JSON.stringify(request));
//     };

//     socket.onmessage = (event) => {
//       const res = JSON.parse(event.data);
//       console.log('📩 Got response:', res);
//       resolve(res);
//       socket.close();
//     };

//     socket.onerror = (err) => {
//       console.error('❌ WebSocket error:', err);
//       reject(err);
//     };
//   });
// };


// Connect to WebSocket
const ws = new WebSocket('wss://your-tunnel-server.com/frontend');

// Send request
function sendRequestToLocalServer() {
  const req = {
    method: 'GET',
    path: '/api/data',
    headers: {},
    body: null,
  };
  ws.send(JSON.stringify(req));
}

// Receive response
ws.onmessage = (e) => {
  const res = JSON.parse(e.data);
  console.log('Local server response:', res);
};
