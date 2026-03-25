// --- CLASSIFY RSRP ---
function classifyRSRP(value) {
    if (value >= -90) return "Excellent";
    if (value >= -105) return "Good";
    if (value >= -120) return "Fair";
    return "Poor";
}

// --- CLASSIFY RSRQ ---
function classifyRSRQ(value) {
    if (value >= -9) return "Excellent";
    if (value >= -12) return "Good";
    return "Poor";
}

// --- MAIN ANALYZE ---
document.getElementById("analyzeBtn").addEventListener("click", function () {

    let carriers = [
        {
            name: "AT&T",
            rsrp: document.getElementById("att_rsrp").value,
            rsrq: document.getElementById("att_rsrq").value
        },
        {
            name: "Verizon",
            rsrp: document.getElementById("verizon_rsrp").value,
            rsrq: document.getElementById("verizon_rsrq").value
        },
        {
            name: "T-Mobile",
            rsrp: document.getElementById("tmobile_rsrp").value,
            rsrq: document.getElementById("tmobile_rsrq").value
        }
    ];

// Remove empty carriers
carriers = carriers.filter(c => c.rsrp !== "" && c.rsrp !== null);

    // --- VALIDATION ---
    if (carriers.length === 0) {
    alert("Please enter at least one carrier.");
    return;
}

if (carriers.length === 1) {
    let confirmSingle = confirm("Only one carrier entered. Proceed?");
    if (!confirmSingle) return;
}

    // --- PARSE ---
    carriers.forEach(c => {
        c.rsrp = parseFloat(c.rsrp);
        c.rsrq = c.rsrq === "" ? null : parseFloat(c.rsrq);

        c.rsrpQuality = classifyRSRP(c.rsrp);
        c.rsrqQuality = c.rsrq !== null ? classifyRSRQ(c.rsrq) : "Unknown";
    });

    // --- REMOVE BAD SIGNALS ---
    let viable = carriers.filter(c => c.rsrp >= -105);

    if (viable.length === 0) {
        document.getElementById("result").innerHTML =
            "<div class='result-card'>⚠️ No viable carriers (signal too weak)</div>";
        return;
    }

    // --- SORT BY RSRP ---
    viable.sort((a, b) => b.rsrp - a.rsrp);

    let winner = viable[0];

    // --- CHECK CLOSE RANGE (tie zone) ---
    let close = viable.filter(c => Math.abs(c.rsrp - winner.rsrp) <= 5);

    if (close.length > 1) {
        close.sort((a, b) => (b.rsrq || -99) - (a.rsrq || -99));
        winner = close[0];
    }

    // --- COLORS ---
    let colorMap = {
        "AT&T": "#0077C8",
        "Verizon": "#C8102E",
        "T-Mobile": "#E20074"
    };

    // --- HIGHLIGHT ---
    document.querySelectorAll(".att-col, .verizon-col, .tmobile-col").forEach(el => {
        el.classList.remove("highlight-column");
    });

    document.querySelectorAll(".att-header, .verizon-header, .tmobile-header").forEach(el => {
        el.classList.remove("highlight-header");
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

   // --- BUILD WHY EXPLANATION ---
let whyText = "";

// Strongest signal
whyText += `• Strongest signal (RSRP: ${winner.rsrp} dBm)\n`;

// Compare to others
carriers.forEach(c => {
    if (c.name !== winner.name) {
        let diff = c.rsrp - winner.rsrp;

        if (diff <= -5) {
            whyText += `• ${c.name} is significantly weaker (${c.rsrp})\n`;
        } else if (diff < 0) {
            whyText += `• ${c.name} is slightly weaker (${c.rsrp})\n`;
        } else if (diff === 0) {
            whyText += `• ${c.name} is equal in signal\n`;
        }
    }
});

// Quality note
if (winner.rsrq !== null) {
    whyText += `• Signal quality: ${winner.rsrq} (${winner.rsrqQuality})\n`;
}

// --- BUILD RESULT UI ---
let html = `
    <div class="result-card">
        <div class="best-header">📡 Best Carrier</div>

        <div class="best-carrier" style="color:${colorMap[winner.name]}">
            ${winner.name}
        </div>

        <div class="best-score">
            RSRP: ${winner.rsrp} (${winner.rsrpQuality})
        </div>

        <div class="why-box">
            ${whyText.replace(/\n/g, "<br>")}
        </div>

        <div style="margin-top:10px; font-size:13px; opacity:0.8;">
            ${winner.rsrpQuality === "Excellent" ? "Strong and reliable signal" : ""}
            ${winner.rsrpQuality === "Good" ? "Usable signal, acceptable performance" : ""}
            ${winner.rsrpQuality === "Fair" ? "May experience instability" : ""}
        </div>
    </div>

    <div class="ranking">
`;


    carriers.sort((a, b) => b.rsrp - a.rsrp);

    carriers.forEach(c => {
        html += `
            <div class="ranking-row">
                <span style="color:${colorMap[c.name]}">${c.name}</span>
                <span>${c.rsrp}</span>
                <span>${c.rsrpQuality}</span>
            </div>
        `;
    });

    html += `</div>`;

    document.getElementById("result").innerHTML = html;
});


// --- CLEAR ---
document.getElementById("clearBtn").addEventListener("click", function () {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "";

    document.querySelectorAll(".att-col, .verizon-col, .tmobile-col").forEach(el => {
        el.classList.remove("highlight-column");
    });

    document.querySelectorAll(".att-header, .verizon-header, .tmobile-header").forEach(el => {
        el.classList.remove("highlight-header");
    });
});
