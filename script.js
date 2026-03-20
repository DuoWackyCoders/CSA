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

    let weights = {
        rsrp: 0.5,
        sinr: 0.3,
        rsrq: 0.1,
        rssi: 0.1
    };

    let total = 0;
    let weightSum = 0;

    // RSRP (always required)
    total += scoreRSRP(rsrp) * weights.rsrp;
    weightSum += weights.rsrp;

    // Optional values only counted if provided
    if (rsrq !== null) {
        total += scoreRSRQ(rsrq) * weights.rsrq;
        weightSum += weights.rsrq;
    }

    if (sinr !== null) {
        total += scoreSINR(sinr) * weights.sinr;
        weightSum += weights.sinr;
    }

    if (rssi !== null) {
        total += scoreRSSI(rssi) * weights.rssi;
        weightSum += weights.rssi;
    }

    return total / weightSum;
}

// --- Quality label ---
function getQuality(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
}

// --- MAIN ANALYZE ---
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

    // --- VALIDATION (ONLY RSRP REQUIRED) ---
    for (let c of carriers) {
        if (!c.rsrp || c.rsrp.trim() === "") {
            alert("Please enter RSRP for all carriers.");
            document.getElementById("result").innerHTML = "";
            return;
        }
    }

    // --- CONVERT VALUES ---
    carriers.forEach(c => {
        c.rsrp = parseFloat(c.rsrp);

        c.rsrq = c.rsrq === "" ? null : parseFloat(c.rsrq);
        c.rssi = c.rssi === "" ? null : parseFloat(c.rssi);
        c.sinr = c.sinr === "" ? null : parseFloat(c.sinr);
    });

    // --- CALCULATE ---
    carriers.forEach(c => {
        c.score = calculateScore(c.rsrp, c.rsrq, c.sinr, c.rssi);
        c.quality = getQuality(c.score);
    });

    // --- SORT ---
    carriers.sort((a, b) => b.score - a.score);

    let winner = carriers[0];

    // --- COLUMN HIGHLIGHT ---
    document.querySelectorAll(".att-col, .verizon-col, .tmobile-col").forEach(el => {
        el.classList.remove("highlight-column");
    });

    if (winner.name === "AT&T") {
        document.querySelectorAll(".att-col").forEach(el => el.classList.add("highlight-column"));
        document.querySelector(".att-header").classList.add("highlight-header");
    }

    if (winner.name === "Verizon") {
        document.querySelectorAll(".verizon-col").forEach(el => el.classList.add("highlight-column"));
        document.querySelector(".verizon-header").classList.add("highlight-header");
    }

    if (winner.name === "T-Mobile") {
        document.querySelectorAll(".tmobile-col").forEach(el => el.classList.add("highlight-column"));
        document.querySelector(".tmobile-header").classList.add("highlight-header");
    }

    // --- COLORS ---
    let colorMap = {
        "AT&T": "#0077C8",
        "Verizon": "#C8102E",
        "T-Mobile": "#E20074"
    };

    // --- BUILD RESULT ---
    let html = `
        <div class="result-card">
            <div class="best-header">📡 Best Carrier</div>
            <div class="best-carrier" style="color:${colorMap[winner.name]}">
                ${winner.name}
            </div>
            <div class="best-score">
                Score: ${Math.round(winner.score)} (${winner.quality})
            </div>
        </div>

        <div class="ranking">
    `;

    carriers.forEach(c => {
        html += `
            <div class="ranking-row">
                <span style="color:${colorMap[c.name]}">${c.name}</span>
                <span>${Math.round(c.score)}</span>
                <span>${c.quality}</span>
            </div>
        `;
    });

    html += `</div>`;

    document.getElementById("result").innerHTML = html;
});


// --- KEYBOARD NAV ---
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


// --- CLEAR BUTTON ---
document.getElementById("clearBtn").addEventListener("click", function () {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "";
    

    // Remove previous highlights
    document.querySelectorAll(".att-col, .verizon-col, .tmobile-col").forEach(el => {
        el.classList.remove("highlight-column");
    });

    document.querySelectorAll(".att-header, .verizon-header, .tmobile-header").forEach(el => {
        el.classList.remove("highlight-header");
    });
});
