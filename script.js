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
        rsrp: document.getElementById("att_rsrp").value,
        rsrq: document.getElementById("att_rsrq").value,
        rssi: document.getElementById("att_rssi").value,
        sinr: document.getElementById("att_sinr").value,
    },
    {
        name: "Verizon",
        rsrp: document.getElementById("verizon_rsrp").value,
        rsrq: document.getElementById("verizon_rsrq").value,
        rssi: document.getElementById("verizon_rssi").value,
        sinr: document.getElementById("verizon_sinr").value,
    },
    {
        name: "T-Mobile",
        rsrp: document.getElementById("tmobile_rsrp").value,
        rsrq: document.getElementById("tmobile_rsrq").value,
        rssi: document.getElementById("tmobile_rssi").value,
        sinr: document.getElementById("tmobile_sinr").value,
    }
];

   // --- Validation ---
for (let c of carriers) {
    if (!c.rsrp || c.rsrp.trim() === "") {
    alert("Please enter RSRP for all carriers.");
    document.getElementById("result").innerHTML = "";
    return;
        }
}

    // Convert to numbers AFTER validation
carriers.forEach(c => {
    c.rsrp = parseFloat(c.rsrp);
    c.rsrq = c.rsrq === "" ? -15 : parseFloat(c.rsrq);
    c.rssi = c.rssi === "" ? -100 : parseFloat(c.rssi);
    c.sinr = c.sinr === "" ? 0 : parseFloat(c.sinr);
});
    

    // Calculate scores
carriers.forEach(c => {
    c.score = calculateScore(c.rsrp, c.rsrq, c.sinr, c.rssi);
    c.quality = getQuality(c.score);
});

// Sort highest first
carriers.sort((a, b) => b.score - a.score);

const resultDiv = document.getElementById("result");

// Winner logic
let winner = carriers[0];

    // Remove previous highlights
document.querySelectorAll(".att-col, .verizon-col, .tmobile-col").forEach(el => {
    el.classList.remove("highlight-column");
});

// Apply highlight
if (winner.name === "AT&T") {
    document.querySelectorAll(".att-col").forEach(el => el.classList.add("highlight-column"));
}

if (winner.name === "Verizon") {
    document.querySelectorAll(".verizon-col").forEach(el => el.classList.add("highlight-column"));
}

if (winner.name === "T-Mobile") {
    document.querySelectorAll(".tmobile-col").forEach(el => el.classList.add("highlight-column"));
}

// assign color
let color = "";
if (winner.name === "AT&T") color = "#00A8E0";
if (winner.name === "Verizon") color = "#CD040B";
if (winner.name === "T-Mobile") color = "#E20074";

// Start HTML
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

// Ranking rows
carriers.forEach(c => {

    let cColor = "";
    if (c.name === "AT&T") cColor = "#0077C8";
    if (c.name === "Verizon") cColor = "#C8102E";
    if (c.name === "T-Mobile") cColor = "#E20074";

    html += `
        <div class="ranking-row ${c.name === winner.name ? 'winner-row' : ''}">
            <span style="color:${cColor}">${c.name}</span>
            <span>${Math.round(c.score)}</span>
            <span class="quality-${c.quality.toLowerCase()}">${c.quality}</span>
        </div>
    `;
});

// Close ranking
html += `</div>`;

// Render
resultDiv.innerHTML = html;

});

// Arrow key navigation
document.querySelectorAll("input").forEach((input, index, inputs) => {

    input.addEventListener("keydown", function (e) {

        let cols = 3;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            let next = inputs[index + cols];
            if (next) next.focus();
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            let prev = inputs[index - cols];
            if (prev) prev.focus();
        }

        if (e.key === "Enter") {
            e.preventDefault();
            let next = inputs[index + cols];
            if (next) next.focus();
        }

    });

});

document.getElementById("clearBtn").addEventListener("click", function () {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "";
});
