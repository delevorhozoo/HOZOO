const express = require('express');
const request = require('request-promise');
const SocksProxyAgent = require('socks-proxy-agent');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.post('/report', async (req, res) => {
    const { reportUrl, username, reason, imageUrl, proxy, userAgent, captchaSolution } = req.body;

    console.log(`Menerima permintaan untuk melaporkan: ${reportUrl} dengan proxy: ${proxy}`);

    // Konfigurasi proxy agent
    const proxyAgent = new SocksProxyAgent(proxy);

    const tiktokReportEndpoint = 'https://www.tiktok.com/legal/report/feedback?lang=id-ID'; // Ganti dengan endpoint yang benar

    const formData = {
        feedback_category: 'account',
        feedback_sub_category: 'violates_community_guidelines',
        username: username,
        url: reportUrl,
        comment: `Pelanggaran: Konten tidak pantas. Bukti: ${imageUrl}. Alasan: ${reason}`,
        email: generateRandomEmail(),
        image_url: imageUrl,
        reason: reason,
        captcha_solution: captchaSolution
    };

    const options = {
        method: 'POST',
        uri: tiktokReportEndpoint,
        form: formData,
        headers: {
            'User-Agent': userAgent
        },
        agent: proxyAgent,
        rejectUnauthorized: false // Penting untuk beberapa proxy
    };

    try {
        const response = await request(options);
        console.log('Laporan berhasil dikirim melalui proxy:', response.statusCode);
        res.status(200).send({ message: 'Laporan berhasil dikirim' });
    } catch (error) {
        console.error('Gagal mengirim laporan melalui proxy:', error.message);
        res.status(500).send({ message: 'Gagal mengirim laporan', error: error.message });
    }
});

function generateRandomEmail() {
    const username = Math.random().toString(36).substring(2, 10);
    const domain = 'hozootiktokreport.com'; // Replace with a domain you control
    return `${username}@${domain}`;
}

app.listen(port, () => {
    console.log(`Server perantara berjalan di http://localhost:${port}`);
});
