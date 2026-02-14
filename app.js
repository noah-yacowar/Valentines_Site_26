function seq(folder, count, ext="png") {
  return Array.from({length: count}, (_, i) =>
    `photos/${folder}/${folder}_${i+1}.${ext}`
  );
}

const MEMORIES = [
    {
    title: "First Date",
    date: "August 5, 2023",
    desc: "Our first date. Who knew we would be watching these photos on valentines day years down the road. All that we have done together since. Wish we could create that excitement everyday.",
    photos: seq("first_date", 5),
    lat: 43.6465,
    lng: -79.4637,
    locationLabel: "High Park, Toronto, ON"
    },  
    {
    title: "Elevator Moment",
    date: "January 7, 2024",
    desc: "You made me that hat, so very warm. A beautiful hat.",
    photos: seq("elevator", 2),
    lat: 43.77422564322491,
    lng: -79.41526240481147,
    locationLabel: "75 Canterbury Pl, North York, ON"
    },
    {
    title: "AandW Burgers Yumm",
    date: "February 15, 2024",
    desc: "Came to this burger joint, after what I assume was a shopping parooze at the (right next door) value village. Ah, nothing like a burger and some used underwear am I right :)",
    photos: seq("aw", 3),
    lat: 43.51172143956378,
    lng: -80.54940265111631,
    locationLabel: "330 Farmers Market Rd, Waterloo, ON"
    },   
    {
    title: "Niagara Spip",
    date: "November 10, 2024",
    desc: "Our first spip. Almost missed the bus home. luckily Daphne caught it in time.",
    photos: seq("niagara", 19),
    lat: 43.0896,
    lng: -79.0849,
    locationLabel: "Niagara Falls, ON"
    },
    {
    title: "Pacific Mall",
    date: "November 16, 2024",
    desc: "Went for the tech, but ended up going out with more love <3 (and some tech).",
    photos: seq("pacific_mall", 3),
    lat: 43.8277,
    lng: -79.3056,
    locationLabel: "Pacific Mall, Markham, ON"
    },
    {
    title: "Go Karting",
    date: "August 9, 2025",
    desc: "You were mad earlier that day because I made you drive to a closed park. I am sure you felt worse after I completely destroyed you (you did not let me win).",
    photos: seq("go_karting", 4),
    lat: 43.595813,
    lng: -79.64673,
    locationLabel: "Missisauga Mini Indy, Missisauga, ON"
    },
    {
    title: "Second Date",
    date: "August 17, 2023",
    desc: "Second date. At least I think so. But I thought we went to the mall?",
    photos: seq("second_date", 2),
    lat: 43.77365353603821,
    lng: -79.41364736483237,
    locationLabel: "H-Mart, North York, ON"
    },
    {
    title: "Mini Golf",
    date: "August 13, 2024",
    desc: "You won mini golf on the first date. You also won again here (barely). Your time will come.",
    photos: seq("mini_golf", 3),
    lat: 43.983448,
    lng: -79.260285,
    locationLabel: "Timber Creek Mini Golf and Fun Center, Newmarket, ON"
    },
    {
    title: "Escape Room",
    date: "November 8, 2024",
    desc: "We escaped with minimal hints! Except one which should not have counted. Also you were scared for some reason, but when it comes to horror movies you have no reaction? Make it make sense.",
    photos: seq("escape_room", 2),
    lat: 43.581065,
    lng: -79.650429,
    locationLabel: "Captive Escape Rooms, Missisauga, ON"
    },
    {
    title: "Cousin's Wedding",
    date: "July 12, 2025",
    desc: "Our first wedding (and first time leaving the great province of Ontario)! Was also my first wedding period. We laughed, you cried (I don't cry, just get wet eyes). You had some to drink and was the time I saw you most excited to dance. Lovely wedding, good inspo for ours :). Also the Mega bus was not that bad, and liked it more than driving.",
    photos: seq("cousin_rachel_wedding", 2),
    lat: 45.483705,
    lng: -73.913457,
    locationLabel: "Elm Ridge Country Club, Montreal, QC"
    },
];

// --------------------------
// Map init
// --------------------------
const map = L.map("map", { zoomControl: false });

const baseMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
});

const satelliteish = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19, attribution: "Tiles &copy; Esri" }
);

let usingSatellite = false;
baseMap.addTo(map);

const bounds = L.latLngBounds([]);
const markers = [];

// Small red dot pin
const pinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="
      width: 14px; height: 14px;
      background: #e11d48;
      border: 2px solid white;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(0,0,0,0.22);
    "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Create markers + bounds
for (const m of MEMORIES) {
  const ll = L.latLng(m.lat, m.lng);
  bounds.extend(ll);

  const marker = L.marker(ll, { icon: pinIcon }).addTo(map);
  markers.push({ marker, data: m });

  marker.bindTooltip(m.title, { direction: "top", offset: [0, -8], opacity: 0.95 });
  marker.on("click", () => openModal(m));
}

const initialBounds = bounds.isValid() ? bounds.pad(0.25) : null;
fitAll();

// --------------------------
// UI elements
// --------------------------
const sidePanel = document.getElementById("sidePanel");
const menuBtn = document.getElementById("menuBtn");
const panelCloseBtn = document.getElementById("panelCloseBtn");
const memoryList = document.getElementById("memoryList");

const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const locateBtn = document.getElementById("locateBtn");
const fitBtn = document.getElementById("fitBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const resetBtn = document.getElementById("resetBtn");
const mapTypeBtn = document.getElementById("mapTypeBtn");
const mapTypeLabel = document.getElementById("mapTypeLabel");
const pegmanBtn = document.getElementById("pegmanBtn");
const shareBtn = document.getElementById("shareBtn");

const toast = document.getElementById("toast");

// Panel open/close
menuBtn.addEventListener("click", () => sidePanel.classList.toggle("closed"));
panelCloseBtn.addEventListener("click", () => sidePanel.classList.add("closed"));

// Build memory list (thumbnail uses first photo)
memoryList.innerHTML = "";
MEMORIES.forEach((m) => {
  const thumb = (Array.isArray(m.photos) && m.photos.length) ? m.photos[0] : "";
  const item = document.createElement("div");
  item.className = "mem-item";
  item.innerHTML = `
    <div class="mem-thumb">${thumb ? `<img src="${thumb}" alt="">` : ""}</div>
    <div>
      <div class="mem-title">${escapeHtml(m.title)}</div>
      <div class="mem-meta">
        ${m.date ? `<span class="badge">${escapeHtml(m.date)}</span>` : ""}
        ${m.locationLabel ? `<span class="badge">${escapeHtml(m.locationLabel)}</span>` : ""}
        ${Array.isArray(m.photos) && m.photos.length > 1 ? `<span class="badge">${m.photos.length} photos</span>` : ""}
      </div>
    </div>
  `;
  item.addEventListener("click", () => {
    map.setView([m.lat, m.lng], Math.max(map.getZoom(), 14));
    openModal(m);
  });
  memoryList.appendChild(item);
});

// Controls
zoomInBtn.addEventListener("click", () => map.zoomIn());
zoomOutBtn.addEventListener("click", () => map.zoomOut());
fitBtn.addEventListener("click", () => fitAll());

resetBtn.addEventListener("click", () => {
  sidePanel.classList.remove("closed");
  fitAll();
  showToast("Reset view");
});

mapTypeBtn.addEventListener("click", () => {
  usingSatellite = !usingSatellite;

  if (usingSatellite) {
    map.removeLayer(baseMap);
    satelliteish.addTo(map);
    mapTypeLabel.textContent = "Satellite";
    showToast("Satellite view");
  } else {
    map.removeLayer(satelliteish);
    baseMap.addTo(map);
    mapTypeLabel.textContent = "Map";
    showToast("Map view");
  }
});

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      showToast("Fullscreen on");
    } else {
      await document.exitFullscreen();
      showToast("Fullscreen off");
    }
  } catch {
    showToast("Fullscreen not available");
  }
});

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 14);
      showToast("Centered on your location");

      const temp = L.circleMarker([latitude, longitude], {
        radius: 7,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.35,
      }).addTo(map);
      setTimeout(() => map.removeLayer(temp), 2500);
    },
    () => showToast("Couldn’t get location (permission denied?)"),
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

pegmanBtn.addEventListener("click", () => {
  showToast("Street View isn’t here... yet");
});

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast("Link copied!");
  } catch {
    showToast("Couldn’t copy link");
  }
});

// --------------------------
// Modal + Carousel
// --------------------------
const overlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalDesc = document.getElementById("modalDesc");
const modalLocation = document.getElementById("modalLocation");

const imgPrev = document.getElementById("imgPrev");
const imgNext = document.getElementById("imgNext");
const imgDots = document.getElementById("imgDots");

let currentPhotos = [];
let currentPhotoIndex = 0;

function openModal(m) {
  // Photos are an array. (If you accidentally still have photo: "...", this supports that too.)
  currentPhotos = Array.isArray(m.photos)
    ? m.photos
    : (m.photo ? [m.photo] : []);

  currentPhotoIndex = 0;

  modalTitle.textContent = m.title || "";
  modalDate.textContent = m.date || "";
  modalDesc.textContent = m.desc || "";
  modalLocation.textContent = m.locationLabel ? `📍 ${m.locationLabel}` : "";

  // Set image and UI
  setModalImage();
  rebuildDots();

  const multi = currentPhotos.length > 1;
  imgPrev.classList.toggle("hidden", !multi);
  imgNext.classList.toggle("hidden", !multi);
  imgDots.classList.toggle("hidden", !multi);

  overlay.classList.remove("hidden");
}

function closeModal() {
  overlay.classList.add("hidden");
  modalImg.removeAttribute("src");
  currentPhotos = [];
  currentPhotoIndex = 0;
  imgDots.innerHTML = "";
}

function setModalImage() {
  if (!currentPhotos.length) {
    modalImg.removeAttribute("src");
    modalImg.alt = "No photo";
    return;
  }
  modalImg.src = currentPhotos[currentPhotoIndex];
  modalImg.alt = `Memory photo ${currentPhotoIndex + 1} of ${currentPhotos.length}`;
  setActiveDot();
}

function prevImage() {
  if (currentPhotos.length < 2) return;
  currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
  setModalImage();
}

function nextImage() {
  if (currentPhotos.length < 2) return;
  currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
  setModalImage();
}

function rebuildDots() {
  imgDots.innerHTML = "";
  currentPhotos.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.setAttribute("aria-label", `Photo ${i + 1}`);
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPhotoIndex = i;
      setModalImage();
    });
    imgDots.appendChild(d);
  });
  setActiveDot();
}

function setActiveDot() {
  const dots = imgDots.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === currentPhotoIndex));
}

// Modal listeners
closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

// Arrow clicks (don’t bubble to overlay)
imgPrev.addEventListener("click", (e) => { e.stopPropagation(); prevImage(); });
imgNext.addEventListener("click", (e) => { e.stopPropagation(); nextImage(); });

window.addEventListener("keydown", (e) => {
  if (!overlay.classList.contains("hidden")) {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  }
});

// --------------------------
// Helpers
// --------------------------
function fitAll() {
  if (initialBounds && initialBounds.isValid()) {
    map.fitBounds(initialBounds);
  } else if (MEMORIES.length === 1) {
    map.setView([MEMORIES[0].lat, MEMORIES[0].lng], 13);
  } else {
    map.setView([0, 0], 2);
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1600);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
