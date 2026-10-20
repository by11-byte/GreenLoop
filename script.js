// ==========================================================================
// GreenLoop Prototype — Core Script Engine (Vanilla JS)
// ==========================================================================

// 1. Initial State Data
const DEFAULT_STATE = {
  activeResidentId: "GL-101",
  residents: [
    {
      id: "GL-101",
      name: "Ahmad Fauzi",
      unit: "No. 12, Jalan Hijau 2",
      area: "Petaling Jaya, Selangor",
      lat: 3.1530,
      lon: 101.6150,
      points: 85,
      votedProjectId: null
    },
    {
      id: "GL-102",
      name: "Tan Wei Ling",
      unit: "No. 45, Lorong Bukit 3",
      area: "City of Elmina, Shah Alam",
      lat: 3.1785,
      lon: 101.5032,
      points: 140,
      votedProjectId: null
    },
    {
      id: "GL-103",
      name: "Priya Murugan",
      unit: "Block B-04-10, Desasiswa Tekun",
      area: "Gelugor / USM, Penang",
      lat: 5.3560,
      lon: 100.2980,
      points: 30,
      votedProjectId: null
    }
  ],
  materialRates: {
    plastic: 10,    // 10 pts/kg
    paper: 5,       // 5 pts/kg
    aluminium: 20,  // 20 pts/kg
    organics: 4     // 4 pts/kg
  },
  centres: [
    {
      id: "HUB_IPC",
      name: "IPC Recycling & Buy-Back Centre (RBBC)",
      address: "Level P1 (Near Pillar 2D), IPC Shopping Centre, Mutiara Damansara, 47800 Petaling Jaya, Selangor",
      area: "Petaling Jaya / Mutiara Damansara, Selangor",
      lat: 3.1579,
      lon: 101.6114,
      materials: ["Paper", "Plastic", "Aluminium", "E-Waste"],
      schedule: "Daily: 10:00 AM - 10:00 PM",
      isGreenLoop: false, // Independent real-world centre
      rewardNote: "Offers official IPC Tack Points via IPC App. Independent centre; NOT a confirmed GreenLoop partner (GreenPoints ineligible)."
    },
    {
      id: "HUB_ELMINA",
      name: "Taman Elmina Community Recycling Hub",
      address: "Elmina Central Park Activity Pavilion, 40160 Shah Alam, Selangor",
      area: "City of Elmina, Shah Alam, Selangor",
      lat: 3.1800,
      lon: 101.5050,
      materials: ["Plastic", "Paper", "Aluminium", "Organics"],
      schedule: "Tuesdays & Saturdays: 8:30 AM - 12:30 PM",
      isGreenLoop: true,
      rewardNote: "Verified GreenLoop Hub — Awards instant GreenPoints."
    },
    {
      id: "HUB_BUKIT_RAJA",
      name: "Bandar Bukit Raja Town Hall Hub",
      address: "Jalan Singgahsana, Bandar Bukit Raja, 41050 Klang, Selangor",
      area: "Klang / Bukit Raja, Selangor",
      lat: 3.0680,
      lon: 101.4420,
      materials: ["Plastic", "Aluminium", "Paper"],
      schedule: "Thursdays & Sundays: 9:00 AM - 1:00 PM",
      isGreenLoop: true,
      rewardNote: "Verified GreenLoop Hub — Awards instant GreenPoints."
    },
    {
      id: "HUB_PENANG_USM",
      name: "USM Tekun Sustainable Drop-Off Hub",
      address: "Desasiswa Tekun Ground Courtyard, Universiti Sains Malaysia, 11800 Gelugor, Penang",
      area: "Gelugor / USM, Penang",
      lat: 5.3575,
      lon: 100.2995,
      materials: ["Plastic", "Paper", "Aluminium", "Organics"],
      schedule: "Mon - Fri: 9:00 AM - 5:00 PM",
      isGreenLoop: true,
      rewardNote: "Verified GreenLoop Hub — Awards instant GreenPoints."
    }
  ],
  rewards: [
    { id: "REW_1", title: "RM5 Local Cafe Voucher", cost: 50, partner: "Kopi Kita (Township Square)" },
    { id: "REW_2", title: "Herbal Seedling Starter Kit", cost: 30, partner: "Township Community Nursery" },
    { id: "REW_3", title: "1-Day Community Pool Pass", cost: 80, partner: "Clubhouse Administration" }
  ],
  projects: [
    { id: "PRJ_1", name: "Community Herb & Sensory Garden", description: "Convert an underutilized lawn into an organic native herb garden.", votes: 14 },
    { id: "PRJ_2", name: "Shade Tree Planting (25 Rain Trees)", description: "Plant native shade trees along the main pedestrian jogging path.", votes: 21 },
    { id: "PRJ_3", name: "Green Shaded Gathering Pavilion", description: "Construct a community pergola with a rainwater harvesting barrel.", votes: 9 }
  ],
  transactions: [
    {
      timestamp: "2026-10-19 10:15",
      residentId: "GL-101",
      action: "Recycled Plastic",
      weight: "2.5 kg",
      pointsChange: "+25 pts"
    },
    {
      timestamp: "2026-10-20 16:40",
      residentId: "GL-102",
      action: "Recycled Aluminium",
      weight: "1.5 kg",
      pointsChange: "+30 pts"
    }
  ],
  totalWeightCollected: 4.0
};

// 2. Storage Utilities
const STORAGE_KEY = "greenloop_prototype_v2";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved state. Loading default values.", e);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

let appState = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  renderAll();
}

function resetDemo() {
  if (confirm("Reset all demonstration data back to default values?")) {
    localStorage.removeItem(STORAGE_KEY);
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }
}

// 3. Helper Functions
function getActiveResident() {
  return appState.residents.find(r => r.id === appState.activeResidentId) || appState.residents[0];
}

// Straight-line distance calculation (Haversine formula in kilometers)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 4. Render Modules

// Render Resident Switcher, QR Pass and Profile Balance
function renderResidentContext() {
  const activeRes = getActiveResident();
  const selector = document.getElementById("residentSelector");

  selector.innerHTML = appState.residents.map(r => `
    <option value="${r.id}" ${r.id === activeRes.id ? "selected" : ""}>
      ${r.name} (${r.area.split(",")[0]})
    </option>
  `).join("");

  // QR Pass
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${activeRes.id}`;
  document.getElementById("qrImage").src = qrDataUrl;
  document.getElementById("qrResidentName").textContent = activeRes.name;
  document.getElementById("qrResidentUnit").textContent = "Unit: " + activeRes.unit;
  document.getElementById("qrResidentId").textContent = activeRes.id;

  // Rewards Profile Bar
  document.getElementById("portalResidentName").textContent = activeRes.name;
  document.getElementById("portalResidentArea").textContent = `${activeRes.unit} • ${activeRes.area}`;
  document.getElementById("portalPoints").textContent = `${activeRes.points} pts`;
}

// Render Recycling Directory with Distance Sorting and IPC Rules
function renderCentres() {
  const activeRes = getActiveResident();
  const search = document.getElementById("areaSearchInput").value.trim().toLowerCase();
  const material = document.getElementById("materialFilter").value;
  const container = document.getElementById("centresList");

  // Compute straight-line distance from the active resident's known position
  const centresWithDist = appState.centres.map(c => {
    const dist = calculateDistanceKm(activeRes.lat, activeRes.lon, c.lat, c.lon);
    return { ...c, distanceKm: dist };
  });

  // Filter centres
  const filtered = centresWithDist.filter(c => {
    // Search filter across area, name, or address
    const matchesSearch = search === "" ||
                          c.area.toLowerCase().includes(search) ||
                          c.name.toLowerCase().includes(search) ||
                          c.address.toLowerCase().includes(search);

    // Material filter
    const matchesMaterial = material === "ALL" || c.materials.includes(material);

    // Strict Rule: If user specifically searches for "Penang", do not display Selangor IPC
    if (search.includes("penang") && c.id === "HUB_IPC") {
      return false;
    }

    return matchesSearch && matchesMaterial;
  });

  // Sort by straight-line proximity (closest first)
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">No recycling centres found matching your query.</p>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="card hub-card ${c.isGreenLoop ? 'is-greenloop' : 'is-independent'}">
      <div>
        <div class="card-top">
          <span class="badge ${c.isGreenLoop ? 'badge-greenloop' : 'badge-independent'}">
            ${c.isGreenLoop ? '⭐ GreenLoop Partner Hub' : 'Independent Centre'}
          </span>
          <span class="distance-badge">📍 ~${c.distanceKm} km away</span>
        </div>
        <h4 class="card-title">${c.name}</h4>
        <p class="card-text"><strong>Address:</strong> ${c.address}</p>
        <p class="card-text"><strong>Accepted:</strong> ${c.materials.join(", ")}</p>
        <p class="card-text"><strong>Hours:</strong> ${c.schedule}</p>
        <div class="notice-box">
          <strong>Reward Policy:</strong> ${c.rewardNote}
        </div>
      </div>
    </div>
  `).join("");

  // Populate Staff Hub Dropdown (GreenLoop hubs are eligible; Independent hubs are disabled)
  const staffHubSelect = document.getElementById("staffHubSelect");
  staffHubSelect.innerHTML = appState.centres.map(c => `
    <option value="${c.id}" ${!c.isGreenLoop ? 'disabled' : ''}>
      ${c.name} ${c.isGreenLoop ? '(Eligible for GreenPoints)' : '[Ineligible — Independent Centre]'}
    </option>
  `).join("");
}

// Render Rewards Section
function renderRewards() {
  const activeRes = getActiveResident();
  const container = document.getElementById("rewardsList");

  container.innerHTML = appState.rewards.map(r => {
    const canAfford = activeRes.points >= r.cost;
    return `
      <div class="card">
        <div>
          <h4 class="card-title">${r.title}</h4>
          <p class="card-text"><strong>Partner:</strong> ${r.partner}</p>
          <p class="card-text"><strong>Cost:</strong> <span style="color: var(--primary-green); font-weight:700;">${r.cost} GreenPoints</span></p>
        </div>
        <button 
          class="btn ${canAfford ? 'btn-secondary' : 'btn-disabled'}" 
          style="margin-top: 10px;"
          onclick="redeemReward('${r.id}')"
          ${!canAfford ? 'disabled' : ''}
        >
          ${canAfford ? 'Redeem Voucher' : 'Insufficient Points'}
        </button>
      </div>
    `;
  }).join("");
}

// Render Project Voting
function renderVoting() {
  const activeRes = getActiveResident();
  const container = document.getElementById("votingProjectsList");
  const totalVotes = appState.projects.reduce((sum, p) => sum + p.votes, 0) || 1;

  container.innerHTML = appState.projects.map(p => {
    const pct = Math.round((p.votes / totalVotes) * 100);
    const hasVotedThis = activeRes.votedProjectId === p.id;
    const hasVotedAny = activeRes.votedProjectId !== null;

    return `
      <div class="card">
        <div>
          <h4 class="card-title">${p.name}</h4>
          <p class="card-text">${p.description}</p>
          <div class="vote-bar-container">
            <div class="vote-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <p class="card-text" style="font-size:0.85rem;"><strong>${p.votes} votes</strong> (${pct}% of total)</p>
        </div>
        <button 
          class="btn ${hasVotedThis ? 'btn-primary' : (hasVotedAny ? 'btn-disabled' : 'btn-secondary')}" 
          style="margin-top: 10px;"
          onclick="castVote('${p.id}')"
          ${hasVotedAny ? 'disabled' : ''}
        >
          ${hasVotedThis ? '✓ Your Household Vote' : (hasVotedAny ? 'Vote Recorded' : 'Vote for this Project')}
        </button>
      </div>
    `;
  }).join("");
}

// Render Transaction History
function renderHistory() {
  const tbody = document.getElementById("transactionTableBody");
  if (appState.transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No activity logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.transactions.slice(-8).reverse().map(t => `
    <tr>
      <td>${t.timestamp}</td>
      <td><strong>${t.residentId}</strong></td>
      <td>${t.action}</td>
      <td>${t.weight || '-'}</td>
      <td style="color: ${t.pointsChange.startsWith('+') ? 'green' : 'red'}; font-weight:700;">
        ${t.pointsChange}
      </td>
    </tr>
  `).join("");
}

// Render Impact Dashboard
function renderDashboard() {
  document.getElementById("dashTotalWeight").textContent = appState.totalWeightCollected.toFixed(1) + " kg";

  const totalPoints = appState.residents.reduce((sum, r) => sum + r.points, 0);
  document.getElementById("dashTotalPoints").textContent = totalPoints;

  const totalVotes = appState.projects.reduce((sum, p) => sum + p.votes, 0);
  document.getElementById("dashTotalVotes").textContent = totalVotes;

  document.getElementById("dashActiveResidents").textContent = appState.residents.length + " households";
}

// Master Render
function renderAll() {
  renderResidentContext();
  renderCentres();
  renderRewards();
  renderVoting();
  renderHistory();
  renderDashboard();
}

// ==========================================================================
// 5. Event Listeners & Interactive Handlers
// ==========================================================================

// Switch active demo resident
document.getElementById("residentSelector").addEventListener("change", (e) => {
  appState.activeResidentId = e.target.value;
  saveState();
});

// Search and filter listeners
document.getElementById("areaSearchInput").addEventListener("input", renderCentres);
document.getElementById("materialFilter").addEventListener("change", renderCentres);

// Autofill button from QR pass to Staff Desk
document.getElementById("autofillStaffBtn").addEventListener("click", () => {
  const activeRes = getActiveResident();
  document.getElementById("staffResidentIdInput").value = activeRes.id;
  window.location.hash = "#staff-verification";
});

// Real-time Staff Points Preview Calculation
const staffWeightInput = document.getElementById("staffWeightInput");
const staffMaterialSelect = document.getElementById("staffMaterialSelect");
const pointsPreview = document.getElementById("pointsCalculationPreview");

function updatePointsPreview() {
  const weight = parseFloat(staffWeightInput.value) || 0;
  const mat = staffMaterialSelect.value;
  const rate = appState.materialRates[mat] || 0;
  const total = Math.round(weight * rate);
  pointsPreview.innerHTML = `Estimated Points to Credit: <strong>${total} GreenPoints</strong> (${weight.toFixed(1)} kg × ${rate} pts/kg)`;
}

staffWeightInput.addEventListener("input", updatePointsPreview);
staffMaterialSelect.addEventListener("change", updatePointsPreview);

// Staff Form Submission
document.getElementById("staffForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const enteredId = document.getElementById("staffResidentIdInput").value.trim().toUpperCase();
  const selectedHubId = document.getElementById("staffHubSelect").value;
  const materialKey = staffMaterialSelect.value;
  const weight = parseFloat(staffWeightInput.value);

  if (isNaN(weight) || weight <= 0) {
    alert("Please enter a valid weight greater than 0 kg.");
    return;
  }

  // Verification 1: Prevent awarding points at independent centres (e.g. IPC)
  const hub = appState.centres.find(c => c.id === selectedHubId);
  if (!hub || !hub.isGreenLoop) {
    alert("Action Denied: Points cannot be issued from an independent recycling centre.");
    return;
  }

  // Verification 2: Verify resident exists
  const resident = appState.residents.find(r => r.id.toUpperCase() === enteredId);
  if (!resident) {
    alert(`Resident ID "${enteredId}" not found. Try one of the demo IDs: GL-101, GL-102, or GL-103.`);
    return;
  }

  // Calculate points
  const rate = appState.materialRates[materialKey] || 0;
  const pointsEarned = Math.round(weight * rate);

  // Update State
  resident.points += pointsEarned;
  appState.totalWeightCollected += weight;

  const matLabel = staffMaterialSelect.options[staffMaterialSelect.selectedIndex].text.split("(")[0].trim();
  const now = new Date();
  const timeString = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

  appState.transactions.push({
    timestamp: timeString,
    residentId: resident.id,
    action: `Recycled ${matLabel} at ${hub.name.split(" ")[0]}`,
    weight: `${weight.toFixed(1)} kg`,
    pointsChange: `+${pointsEarned} pts`
  });

  staffWeightInput.value = "";
  updatePointsPreview();

  alert(`Success! Credited ${pointsEarned} GreenPoints to ${resident.name} (${resident.id}).`);
  saveState();
});

// Reward Redemption
function redeemReward(rewardId) {
  const activeRes = getActiveResident();
  const reward = appState.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  if (activeRes.points < reward.cost) {
    alert("Insufficient GreenPoints balance.");
    return;
  }

  if (confirm(`Redeem "${reward.title}" for ${reward.cost} GreenPoints?`)) {
    activeRes.points -= reward.cost;

    const now = new Date();
    const timeString = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

    appState.transactions.push({
      timestamp: timeString,
      residentId: activeRes.id,
      action: `Redeemed ${reward.title}`,
      weight: "-",
      pointsChange: `-${reward.cost} pts`
    });

    alert(`Voucher redeemed! Present confirmation at ${reward.partner}.`);
    saveState();
  }
}

// Project Voting
function castVote(projectId) {
  const activeRes = getActiveResident();

  if (activeRes.votedProjectId !== null) {
    alert("This household has already cast a vote for this cycle.");
    return;
  }

  const project = appState.projects.find(p => p.id === projectId);
  if (!project) return;

  if (confirm(`Confirm vote for "${project.name}"?`)) {
    project.votes += 1;
    activeRes.votedProjectId = project.id;
    alert(`Thank you! Your vote for "${project.name}" has been recorded.`);
    saveState();
  }
}

// Reset Demo Data
document.getElementById("resetDemoBtn").addEventListener("click", resetDemo);

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  updatePointsPreview();
});
