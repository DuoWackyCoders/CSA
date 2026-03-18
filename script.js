// --- Convert RSRP to score ---
function scoreRSRP(value) {
    if (value >= -90) return 100;
    if (value >= -105) return 75;
    if (value >= -120) return 50;
    return 25;
}

// --- Convert RSRQ to score ---
function scoreRSRQ(value) {
    if (value >= -9) return 100;
    if (value >= -12) return 70;
    return 40;
}

// --- Convert SINR to score ---
function scoreSINR(value) {
    if (value >= 20) return 100;
    if (value >= 13) return 80;
    if (value >= 0) return 50;
    return 20;
}

// --- Convert RSSI to score ---
function scoreRSSI(value) {
    if (value >= -65) return 100;
    if (value >= -75) return 75;
    if (value >= -85) return 50;
    return 25;
}

// --- Final weighted score ---
function calculateScore(rsrp, rsrq, sinr, rssi) {
    return (
        scoreRSRP(rsrp) * 0.45 +
        scoreSINR(sinr) * 0.30 +
        scoreRSRQ(rsrq) * 0.15 +
        scoreRSSI(rssi) * 0.10
    );
}

// --- Quality label ---
function getQuality(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
}

// --- Main analyze function ---
document.getElementById("analyzeBtn").addEventListener("click", function () {

    const carriers = [
        {
            name: "AT&T",
            rsrp: parseFloat(document.getElementById("att_rsrp").value),
            rsrq: parseFloat(document.getElementById("att_rsrq").value),
            rssi: parseFloat(document.getElementById("att_rssi").value),
            sinr: parseFloat(document.getElementById("att_sinr").value),
        },
        {
            name: "Verizon",
            rsrp: parseFloat(document.getElementById("verizon_rsrp").value),
            rsrq: parseFloat(document.getElementById("verizon_rsrq").value),
            rssi: parseFloat(document.getElementById("verizon_rssi").value),
            sinr: parseFloat(document.getElementById("verizon_sinr").value),
        },
        {
            name: "T-Mobile",
            rsrp: parseFloat(document.getElementById("tmobile_rsrp").value),
            rsrq: parseFloat(document.getElementById("tmobile_rsrq").value),
            rssi: parseFloat(document.getElementById("tmobile_rssi").value),
            sinr: parseFloat(document.getElementById("tmobile_sinr").value),
        }
    ];

    // Calculate scores
    carriers.forEach(c => {
        c.score = calculateScore(c.rsrp, c.rsrq, c.sinr, c.rssi);
        c.quality = getQuality(c.score);
    });

    // Sort highest first
    carriers.sort((a, b) => b.score - a.score);

    const resultDiv = document.getElementById("result");

    // Build result UI
    let html = `
       let winner = carriers[0];

// assign color
let color = "";
if (winner.name === "AT&T") color = "#00A8E0";
if (winner.name === "Verizon") color = "#CD040B";
if (winner.name === "T-Mobile") color = "#E20074";

let html = `
    <div class="result-card">
        <div class="best-header">
            📡 Best Carrier
        </div>

        <div class="best-carrier" style="color:${color}">
            ${winner.name}
        </div>

        <div class="best-score">
            Score: ${Math.round(winner.score)} (${winner.quality})
        </div>
    </div>

    <div class="ranking">
`;
    `;

    carriers.forEach(c => {
        html += `
            <div class="result-row">
                <span>${c.name}</span>
                <span>${Math.round(c.score)}</span>
                <span>${c.quality}</span>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;
});
