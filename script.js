// ==========================================================================
// GreenLoop Prototype — Core Application Engine
// ==========================================================================

// 1. Initial Demonstration Data
const INITIAL_STATE = {
  activeResidentId: "RES001",
  residents: [
    { id: "RES001", name: "Ahmad Fauzi", unit: "No. 12, Jalan Hijau 2", points: 85, votedProjectId: null },
    { id: "RES002", name: "Tan Wei Ling", unit: "No. 45, Jalan Hijau 4", points: 140, votedProjectId: null },
    { id: "RES003", name: "Priya Murugan", unit: "No. 08, Jalan Hijau 1", points: 30, votedProjectId: null }
  ],
  ratesPerKg: {
    plastic: 10,
    paper: 5,
    aluminium: 20,
    organics: 4
  },
  centres: [
    {
      id: "HUB_01",
      name: "Taman Sentosa Community Hall Hub",
      area: "Precinct 1",
      materials: ["Plastic", "Paper", "Aluminium", "Organics"],
      schedule: "Mon & Thu: 8:00 AM - 12:00 PM",
      isGreenLoop: true
    },
    {
      id: "HUB_02",
      name: "Surau Al-Falah Guardhouse Drop-Off",
      area: "Precinct 2",
      materials: ["Plastic", "Aluminium"],
      schedule: "Saturdays: 9:00 AM - 2:00 PM",
      isGreenLoop: true
    },
    {
      id: "HUB_03",
      name: "Township Central Recycling Depot",
      area: "Commercial Zone",
      materials: ["Plastic", "Paper", "Aluminium"],
      schedule: "Daily: 9:00 AM - 5:00 PM",
      isGreenLoop: false // Independent centre
    }
  ],
  rewards: [
    { id: "REW_01", title: "RM5 Local Cafe Voucher", cost: 50, partner: "Kopi Kita (Township Square)" },
    { id: "REW_02", title: "Herb Seedling Starter Kit", cost: 30, partner: "Township Community Nursery" },
    { id: "REW_03", title: "1-Day Community Pool Pass", cost: 80, partner: "Clubhouse Administration" }
  ],
  projects: [
    { id: "PRJ_01", name: "Community Herb Garden", description: "Convert idle lawn beside Hall 1 into an organic herb garden.", votes: 12 },
    { id: "PRJ_02", name: "Shade Tree Planting", description: "Plant 25 native rain trees along Central Walkway for cooler jogging paths.", votes: 19 },
    { id: "PRJ_03", name: "Green Shaded Pavilion", description: "Build a community shaded gazebo with rainwater harvesting tank.", votes: 8 }
  ],
  transactions: [
    {
      date: "2026-10-18 09:30",
      residentName: "Ahmad Fauzi",
      action: "Recycled Plastic",
      weight: "3.5 kg",
      pointsChange: "+35 pts"
    },
    {
      date: "2026-10-19 14:15",
      residentName: "Tan Wei Ling",
      action: "Recycled Aluminium",
      weight: "2.0 kg",
      pointsChange: "+40 pts"
    }
  ],
  totalWeightCollected: 5.5
};

// 2. Load or Initialize State from localStorage
const STORAGE_KEY = "greenloop_prototype_data";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved state. Loading defaults.", e);
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

let appState = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  renderAll();
}

function resetDemo() {
  if (confirm("Reset all demo data back to default values?")) {
    localStorage.removeItem(STORAGE_KEY);
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    renderAll();
  }
}

// 3. Helper Functions
function getActiveResident() {
  return appState.residents.find(r => r.id === appState.activeResidentId) || appState.residents[0];
}

// 4. Rendering Functions

// Render Resident Switcher and Resident Portal
function renderResidentSection() {
  const activeRes = getActiveResident();
  const select = document.getElementById("activeResidentSelect");
  const staffSelect = document.getElementById("staffResidentSelect");

  // Populate Dropdowns
  select.innerHTML = appState.residents
    .map(r => `<option value="${r.id}" ${r.id === activeRes.id ? "selected" : ""}>${r.name} (${r.unit})</option>`)
    .join("");

  staffSelect.innerHTML = appState.residents
    .map(r => `<option value="${r.id}">${r.name} —${r.unit}</option>`)
    .join("");

  // Update Profile Card
  document.getElementById("resName").textContent = activeRes.name;
  document.getElementById("resUnit").textContent = "Unit: " + activeRes.unit;
  document.getElementById("resPoints").textContent = activeRes.points + " pts";
}

// Render Recycling Centres Directory
function renderCentres() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filterMaterial = document.getElementById("materialFilter").value;
  const container = document.getElementById("centresList");

  const filtered = appState.centres.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm) || c.area.toLowerCase().includes(searchTerm);
    const matchesMaterial = filterMaterial === "ALL" || c.materials.includes(filterMaterial);
    return matchesSearch && matchesMaterial;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">No centres found matching your search criteria.</p>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="card hub-card ${c.isGreenLoop ? 'is-greenloop' : ''}">
      <div>
        <span class="badge ${c.isGreenLoop ? 'badge-greenloop' : 'badge-independent'}">
          ${c.isGreenLoop ? '⭐ Official GreenLoop Hub (Awards Points)' : 'Independent Centre (No Points)'}
        </span>
        <h4 class="card-title">${c.name}</h4>
        <p class="card-text"><strong>Area:</strong> ${c.area}</p>
        <p class="card-text"><strong>Accepted:</strong> ${c.materials.join(", ")}</p>
        <p class="card-text"><strong>Schedule:</strong> ${c.schedule}</p>
      </div>
    </div>
  `).join("");

  // Also populate Staff Hub Dropdown (only GreenLoop hubs eligible)
  const staffHubSelect = document.getElementById("staffHubSelect");
  staffHubSelect.innerHTML = appState.centres.map(c => `
    <option value="${c.id}" ${!c.isGreenLoop ? 'disabled' : ''}>
      ${c.name}${c.isGreenLoop ? '(Verified GreenLoop Hub)' : '[Ineligible - Independent]'}
    </option>
  `).join("");
}

// Render Rewards Catalog
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
          class="btn ${canAfford ? 'btn-secondary' : 'btn-voted'}" 
          style="margin-top: 12px;"
          onclick="redeemReward('${r.id}')"
          ${!canAfford ? 'disabled' : ''}
        >
          ${canAfford ? 'Redeem Voucher' : 'Not Enough Points'}
        </button>
      </div>
    `;
  }).join("");
}

// Render Community Voting
function renderVoting() {
  const activeRes = getActiveResident();
  const container = document.getElementById("projectsList");
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
          class="btn ${hasVotedThis ? 'btn-primary' : (hasVotedAny ? 'btn-voted' : 'btn-secondary')}" 
          style="margin-top: 12px;"
          onclick="castVote('${p.id}')"
          ${hasVotedAny ? 'disabled' : ''}
        >
          ${hasVotedThis ? '✓ Your Vote' : (hasVotedAny ? 'Vote Recorded' : 'Vote for this Project')}
        </button>
      </div>
    `;
  }).join("");
}

// Render History Table
function renderHistory() {
  const tbody = document.getElementById("historyTableBody");
  if (appState.transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No activity logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.transactions.slice(-8).reverse().map(t => `
    <tr>
      <td>${t.date}</td>
      <td><strong>${t.residentName}</strong></td>
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
  renderResidentSection();
  renderCentres();
  renderRewards();
  renderVoting();
  renderHistory();
  renderDashboard();
}

// ==========================================================================
// 5. User Interaction & Event Handlers
// ==========================================================================

// Switch active resident from top bar
document.getElementById("activeResidentSelect").addEventListener("change", (e) => {
  appState.activeResidentId = e.target.value;
  saveState();
});

// Search & Filter Listeners
document.getElementById("searchInput").addEventListener("input", renderCentres);
document.getElementById("materialFilter").addEventListener("change", renderCentres);

// Real-time Staff Points Preview
const weightInput = document.getElementById("staffWeightInput");
const materialSelect = document.getElementById("staffMaterialSelect");
const pointsPreview = document.getElementById("pointsPreview");

function updatePreview() {
  const w = parseFloat(weightInput.value) || 0;
  const mat = materialSelect.value;
  const rate = appState.ratesPerKg[mat] || 0;
  const total = Math.round(w * rate);
  pointsPreview.innerHTML = `Estimated Points to Credit: <strong>${total} GreenPoints</strong> (${w.toFixed(1)} kg × ${rate} pts/kg)`;
}

weightInput.addEventListener("input", updatePreview);
materialSelect.addEventListener("change", updatePreview);

// Staff Recycling Form Submit
document.getElementById("recyclingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const residentId = document.getElementById("staffResidentSelect").value;
  const hubId = document.getElementById("staffHubSelect").value;
  const material = materialSelect.value;
  const weight = parseFloat(weightInput.value);

  if (isNaN(weight) || weight <= 0) {
    alert("Please enter a valid weight in kilograms.");
    return;
  }

  const selectedHub = appState.centres.find(c => c.id === hubId);
  if (!selectedHub || !selectedHub.isGreenLoop) {
    alert("Error: Points can only be awarded at official GreenLoop Hubs.");
    return;
  }

  const resident = appState.residents.find(r => r.id === residentId);
  if (!resident) {
    alert("Resident not found.");
    return;
  }

  // Calculate points
  const rate = appState.ratesPerKg[material] || 0;
  const pointsEarned = Math.round(weight * rate);

  // Update State
  resident.points += pointsEarned;
  appState.totalWeightCollected += weight;

  // Format nice material label
  const matLabel = materialSelect.options[materialSelect.selectedIndex].text.split("(")[0].trim();

  // Log Transaction
  const now = new Date();
  const timeStr = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

  appState.transactions.push({
    date: timeStr,
    residentName: resident.name,
    action: `Recycled ${matLabel}`,
    weight: `${weight.toFixed(1)} kg`,
    pointsChange: `+${pointsEarned} pts`
  });

  // Reset form
  weightInput.value = "";
  updatePreview();

  alert(`Success! Credited ${pointsEarned} GreenPoints to${resident.name}.`);
  saveState();
});

// Redeem Reward
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
    const timeStr = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

    appState.transactions.push({
      date: timeStr,
      residentName: activeRes.name,
      action: `Redeemed ${reward.title}`,
      weight: "-",
      pointsChange: `-${reward.cost} pts`
    });

    alert(`Voucher redeemed! Show this confirmation at ${reward.partner}.`);
    saveState();
  }
}

// Cast Vote
function castVote(projectId) {
  const activeRes = getActiveResident();

  if (activeRes.votedProjectId !== null) {
    alert("You have already cast your vote for this cycle.");
    return;
  }

  const project = appState.projects.find(p => p.id === projectId);
  if (!project) return;

  if (confirm(`Vote for "${project.name}" as your preferred community greening initiative?`)) {
    project.votes += 1;
    activeRes.votedProjectId = project.id;
    alert(`Thank you! Your vote for "${project.name}" has been recorded.`);
    saveState();
  }
}

// Reset Button Listener
document.getElementById("resetDemoBtn").addEventListener("click", resetDemo);

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  updatePreview();
});
