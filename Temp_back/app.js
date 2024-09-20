const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
let tsharkProcess = null; // Variable to store the TShark process
const app = express();

app.use(cors()); // Enable CORS

// Serve the HTML file (optional, if needed)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start TShark and save to a PCAP file
app.get('/start-tshark', (req, res) => {
    console.log('Received request to start TShark');

    if (tsharkProcess) {
        console.log('TShark is already running');
        return res.json({ message: 'TShark is already running!' });
    }

    const interface = 'eth0'; // Adjust this to your network interface (e.g., eth0, wlan0)
    const outputFilePath = path.join(__dirname, 'capture.pcap'); // Path to save the PCAP file

    tsharkProcess = spawn('tshark', ['-i', interface, '-w', outputFilePath]);

    console.log('TShark process started');

    tsharkProcess.stdout.on('data', (data) => {
        console.log(`TShark Output: ${data}`);
    });

    tsharkProcess.stderr.on('data', (data) => {
        console.error(`TShark Error: ${data}`);
    });

    tsharkProcess.on('exit', (code) => {
        console.log(`TShark process exited with code ${code}`);
        tsharkProcess = null; // Reset the process variable after exit
    });

    res.json({ message: `TShark started and saving to ${outputFilePath}` });
});

// Stop TShark process
app.get('/stop-tshark', (req, res) => {
    console.log('Received request to stop TShark');
    
    if (tsharkProcess) {
        tsharkProcess.kill(); // Kill the TShark process
        tsharkProcess = null;
        console.log('TShark process stopped');
        return res.json({ message: 'TShark process stopped' });
    } else {
        console.log('TShark is not running');
        return res.json({ message: 'TShark is not running' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

