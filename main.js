import { db } from './firebase.js';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  where, 
  getDocs 
} from "firebase/firestore";
let zonesCache = [];

function getStatusClass(percentage) {
  if (percentage < 40) return 'status-low';
  if (percentage <= 70) return 'status-medium';
  return 'status-high';
}

function getMapStatusClass(percentage) {
  if (percentage < 50) return 'status-green';
  if (percentage <= 80) return 'status-yellow';
  return 'status-red';
}

function renderZones(zones) {
  const container = document.getElementById('zones-container');
  if (!container) return;

  if (zones.length === 0) {
    container.innerHTML = `<p class="status-summary">Waiting for zone data...</p>`;
    return;
  }

  container.innerHTML = zones.map(zone => {
    const percentage = Math.round((zone.crowd / zone.capacity) * 100);
    const status = getDetailedStatus(percentage);
    
    return `
      <div class="zone-card">
        <div class="zone-header">
          <span class="zone-name">${zone.name}</span>
          <span class="percentage-badge label-${status.class}">${percentage}%</span>
        </div>
        <p class="stat-label">CURRENT CROWD</p>
        <p class="stat-value">${zone.crowd} <span>/ ${zone.capacity}</span></p>
        <div class="progress-container">
          <div class="progress-bar progress-${status.class}" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updateSmartSuggestion(zones) {
  const container = document.getElementById('suggestion-container');
  if (!container || zones.length < 2) return;

  // Calculate percentages for each zone
  const zonesWithPerc = zones.map(z => ({
    ...z,
    perc: Math.round((z.crowd / z.capacity) * 100)
  }));

  // Find highest and lowest
  const busiest = zonesWithPerc.reduce((prev, current) => (prev.perc > current.perc) ? prev : current);
  const quietest = zonesWithPerc.reduce((prev, current) => (prev.perc < current.perc) ? prev : current);

  // Only show if the busiest is actually crowded (> 70%)
  if (busiest.perc > 70) {
   container.innerHTML = `
  <div class="suggestion-card">
    <span class="suggestion-icon">🚀</span>
    <div class="suggestion-content">
      <p style="font-size:12px; color:#00d4ff;">AI Powered Recommendation</p>
      <p class="suggestion-text">
        Smart Route Suggestion:<br>
        Avoid <strong>${busiest.name}</strong> (${busiest.perc}%).<br>
        Enter via <strong>Gate ${quietest.name.slice(-1)}</strong> → Move to <strong>${quietest.name}</strong> (${quietest.perc}%).<br>
        This path will save time and reduce crowd exposure.
      </p>
    </div>
  </div>
`;
    `;
  } else {
    container.innerHTML = '';
  }
}

function renderFacilities(facilities) {
  const container = document.getElementById('facilities-container');
  if (!container) return;

  container.innerHTML = facilities.map(fac => {
    let content = '';
    let statusColor = 'green';

    if (fac.type === 'toilet') {
      const percentage = Math.round((fac.current / fac.capacity) * 100);
      if (percentage > 70) statusColor = 'red';
      else if (percentage > 40) statusColor = 'orange';
      
      content = `
        <div class="facility-main">
          <span class="stat-value">${fac.current} <span>/ ${fac.capacity}</span></span>
        </div>
        <div class="progress-container">
          <div class="progress-bar progress-${statusColor}" style="width: ${percentage}%"></div>
        </div>
      `;
    } else if (fac.type === 'food') {
      const waitTime = fac.queue * fac.avg_time;
      const queuePerc = Math.min((fac.queue / 15) * 100, 100);
      if (waitTime > 15) statusColor = 'red';
      else if (waitTime > 5) statusColor = 'orange';
      
      content = `
        <div class="facility-main">
          <span class="stat-value">${fac.queue} <span>people</span></span>
        </div>
        <div class="progress-container">
          <div class="progress-bar progress-${statusColor}" style="width: ${queuePerc}%"></div>
        </div>
        <div class="wait-time-small">Est. wait: ${waitTime} min</div>
      `;
    } else if (fac.type === 'parking') {
      const available = fac.total - fac.occupied;
      const percentage = Math.round((fac.occupied / fac.total) * 100);
      if (percentage > 90) statusColor = 'red';
      else if (percentage > 60) statusColor = 'orange';

      content = `
        <div class="facility-main">
          <span class="stat-value">${fac.occupied} <span>/ ${fac.total}</span></span>
        </div>
        <div class="progress-container">
          <div class="progress-bar progress-${statusColor}" style="width: ${percentage}%"></div>
        </div>
        <div class="wait-time-small">${available} slots available</div>
      `;
    }

    return `
      <div class="zone-card facility-card">
        <span class="facility-type">${fac.type.replace('_', ' ')}</span>
        <span class="zone-name">${fac.name}</span>
        ${content}
      </div>
    `;
  }).join('');
}

function renderGates(gates) {
  const mainContainer = document.getElementById('gates-container');
  const facilitiesContainer = document.getElementById('facilities-gates-container');
  const suggestionContainer = document.getElementById('gate-suggestion-container');
  
  if (!mainContainer && !facilitiesContainer) return;

  const gatesHtml = gates.map(gate => {
    const perc = Math.round((gate.crowd / gate.capacity) * 100);
    const status = getDetailedStatus(perc);
    
    return `
      <div class="zone-card">
        <div class="zone-header">
          <span class="zone-name">${gate.name}</span>
          <span class="percentage-badge label-${status.class}">${status.label}</span>
        </div>
        <p class="stat-label">CROWD STATUS</p>
        <p class="stat-value">${perc}%</p>
        <div class="progress-container">
          <div class="progress-bar progress-${status.class}" style="width: ${perc}%"></div>
        </div>
      </div>
    `;
  }).join('');

  if (mainContainer) mainContainer.innerHTML = gatesHtml;
  if (facilitiesContainer) facilitiesContainer.innerHTML = gatesHtml;

  // Smart Suggestion Logic
  if (suggestionContainer && gates.length > 0) {
    const sortedGates = [...gates].sort((a,b) => (a.crowd/a.capacity) - (b.crowd/b.capacity));
    const bestGate = sortedGates[0];
    const bestPerc = Math.round((bestGate.crowd / bestGate.capacity) * 100);
    
    suggestionContainer.innerHTML = `
      <div class="suggestion-card">
        <span class="suggestion-icon">💡</span>
        <div class="suggestion-text">
          Smart Entry Tip: <strong>${bestGate.name}</strong> is currently the least crowded (${bestPerc}%). 
          We recommend using this gate for faster entry.
        </div>
      </div>
    `;
  }
}

function renderTransport(data) {
  const container = document.getElementById('transport-container');
  if (!container || !data) return;

  const transportData = [
    { label: 'BUSES AVAILABLE', value: data.buses_available, type: 'Buses' },
    { label: 'METRO TIMING', value: data.metro_timing, type: 'Metro' },
    { label: 'CAB AVAILABILITY', value: data.cab_availability, type: 'Cabs' }
  ];

  container.innerHTML = transportData.map(item => `
    <div class="zone-card status-low">
      <span class="facility-type">${item.type}</span>
      <p class="stat-label">${item.label}</p>
      <p class="stat-value">${item.value}</p>
    </div>
  `).join('');
}

function getDetailedStatus(perc) {
  if (perc >= 90) return { label: 'Very High', class: 'red' };
  if (perc >= 60) return { label: 'High', class: 'orange' };
  return { label: 'Low', class: 'green' };
}

function renderMapZones(zones) {
  const mapContainer = document.getElementById('stadium-map-container');
  const summaryPanel = document.getElementById('zones-summary-panel');
  if (!mapContainer || !summaryPanel) return;

  const sectors = zones.map(zone => {
    const perc = Math.round((zone.crowd / zone.capacity) * 100);
    const status = getDetailedStatus(perc);
    const sectorClass = `sector-${zone.name.split(' ')[1].toLowerCase()}`;

    return `
      <div class="map-sector ${sectorClass} sector-${status.class}">
        <span class="sector-name">${zone.name.split(' ')[1]}</span>
        <span class="sector-perc">${perc}%</span>
      </div>
    `;
  }).join('');

  mapContainer.innerHTML = `
    <div class="stadium-wrapper">
      <div class="stadium-field"></div>
      ${sectors}
    </div>
  `;

  summaryPanel.innerHTML = zones.map(zone => {
    const perc = Math.round((zone.crowd / zone.capacity) * 100);
    const status = getDetailedStatus(perc);
    return `
      <div class="map-summary-card">
        <div class="card-left">
          <div class="status-dot indicator-${status.class}"></div>
          <div class="card-info">
            <h4>${zone.name}</h4>
            <p class="label-${status.class}">${status.label}</p>
          </div>
        </div>
        <div class="card-right">
          <p class="stat-perc">${perc}%</p>
          <p class="stat-ratio">${zone.crowd} / ${zone.capacity}</p>
        </div>
      </div>
    `;
  }).join('');
}

function renderMapGates(gates) {
  // Map visualization is now only in Overview for zones
  return;
}

async function handleEntry() {
  const button = document.getElementById('enter-stadium');
  if (!button) return;
if (button.disabled) return;

  try {
    button.disabled = true;
    button.innerText = 'Entering...';

    // 1. Get user data (user_1)
    const userRef = doc(db, "users", "user_1");
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found!");
    }

    const userData = userSnap.data();
    const userZoneName = userData.zone;

    // 2. Update user status
    await updateDoc(userRef, { status: 'ENTERED' });

    // 3. Find the zone document and increment crowd
    const zonesQuery = query(collection(db, "zones"), where("name", "==", userZoneName));
    const zoneDocs = await getDocs(zonesQuery);

    if (zoneDocs.empty) {
      throw new Error(`Zone ${userZoneName} not found!`);
    }

    const zoneRef = doc(db, "zones", zoneDocs.docs[0].id);
    await updateDoc(zoneRef, {
      crowd: increment(1)
    });

    // 4. Increment gate crowd based on zone mapping
    const zoneToGateMap = {
      'Zone A': 'gate_a',
      'Zone B': 'gate_a',
      'Zone C': 'gate_b',
      'Zone D': 'gate_c'
    };
    
    const gateId = zoneToGateMap[userZoneName];
    if (gateId) {
      const gateRef = doc(db, "gates", gateId);
      await updateDoc(gateRef, {
        crowd: increment(1)
      });
      console.log(`Gate ${gateId} incremented`);
    }

    button.innerText = 'Stadium Entered';
    
    // Show success message
    const statusMsg = document.getElementById('entry-status');
    if (statusMsg) {
      statusMsg.innerText = 'You have entered the stadium';
      statusMsg.classList.add('show');
    }

    console.log(`Successfully entered ${userZoneName}`);

  } catch (error) {
    console.error("Entry error:", error);
    alert("Something went wrong. Please try again.");
    button.disabled = false;
    button.innerText = 'Entry Failed - Try Again';
  }
}

// Real-time Firestore listener
document.addEventListener('DOMContentLoaded', () => {
  const zonesQuery = query(collection(db, "zones"), orderBy("name", "asc"));
  const facilitiesQuery = query(collection(db, "facilities"), orderBy("name", "asc"));
  const gatesQuery = query(collection(db, "gates"), orderBy("name", "asc"));
  const transportDocRef = doc(db, "transport", "main");
  
  // Navigation logic
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-view');
      if (!viewId) return;

      // Switch active nav
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Switch views
      const views = document.querySelectorAll('main.dashboard');
      views.forEach(v => v.style.display = 'none');
      document.getElementById(viewId).style.display = 'block';
    });
  });


  // Attach button listener
  const enterBtn = document.getElementById('enter-stadium');
  if (enterBtn) {
    enterBtn.addEventListener('click', handleEntry);
  }

  // Zones listener
onSnapshot(zonesQuery, (snapshot) => {
  if (!snapshot || snapshot.empty) {
    console.warn("No zones data available");
    return;
  }

  const zones = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
zonesCache = zones;
    
    renderZones(zones);
    updateSmartSuggestion(zones);
    renderMapZones(zones);
  });

  // Facilities listener
  onSnapshot(facilitiesQuery, (snapshot) => {
  if (!snapshot || snapshot.empty) {
    console.warn("No facilities data available");
    return;
  }

  const facilities = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  renderFacilities(facilities);
}, (error) => {
  console.error("Facilities error:", error);
});

  // Gates listener
  onSnapshot(gatesQuery, (snapshot) => { 
if (!snapshot || snapshot.empty) {
    console.warn("No gates data available");
    return;
}
    const gates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderGates(gates);
    renderMapGates(gates);
  }, (error) => {
    console.error("Gates error:", error);
  });

  // Transport listener
  onSnapshot(transportDocRef, (docSnap) => {
    if (docSnap.exists()) {
      renderTransport(docSnap.data());
    }
  }, (error) => {
    console.error("Transport error:", error);
  });
});
