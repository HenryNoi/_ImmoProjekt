// Master Engine - Modul 3: APP/main.js (Teil 1)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Ladeprozess der JSON-Matrix aus dem APP-Verzeichnis
    fetch("APP/kriterien.json")
        .then(response => {
            if (!response.ok) throw new Error("Fehler beim Laden der kriterien.json");
            return response.json();
        })
        .then(data => {
            initializeSearchEngine(data);
        })
        .catch(error => console.error("Engine-Fehler:", error));
});

function initializeSearchEngine(data) {
    const panel = document.getElementById("filterPanel");
    if (!panel) return;

    // Gerüst-Struktur des linken Schiebe-Panels aufbauen (Clean & Edel)
    panel.innerHTML = `
        <div style="padding: 20px; background-color: #392E1C; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light);">
            <h3 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; letter-spacing: 1.5px; text-transform: lowercase; color: var(--gold-champagne);">Kriterien-Filter</h3>
            <button id="closePanelBtn" style="background: none; border: none; color: #FFFFFF; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <div id="panelContentWrapper" style="padding: 20px; overflow-y: auto; height: calc(100% - 60px); font-family: 'Helvetica Neue', Arial, sans-serif;">
            <!-- Gelbe Master-Schalter-Zone -->
            <div id="yellowZone" style="background-color: #FFFDF5; border: 1px solid var(--border-light); padding: 15px; margin-bottom: 25px;"></div>
            <!-- Graue Kriterien-Zone -->
            <div id="grayZone" style="display: flex; flex-direction: column; gap: 25px;"></div>
        </div>
    `;

    // Event-Listener für Schließen-Button verknüpfen
    document.getElementById("closePanelBtn").addEventListener("click", () => {
        panel.classList.remove("open");
    });

    // 2. Gelbe Sektion rendern (Haupt-Automatismen)
    renderYellowZone(data.master_controls_yellow);

    // 3. Graue Sektion starten (Vertikal fließendes Kriterien-Band)
    renderGrayZone(data.matrix_categories_gray);
}

function renderYellowZone(yellowData) {
    const yellowZone = document.getElementById("yellowZone");
    
    for (const [key, control] of Object.entries(yellowData)) {
        const segment = document.createElement("div");
        segment.style.marginBottom = "15px";
        if (key === "usage_type") segment.style.marginBottom = "0";

        segment.innerHTML = `
            <label style="display: block; font-size: 11px; text-transform: lowercase; letter-spacing: 1.5px; color: var(--gold-dark); margin-bottom: 6px; font-weight: bold;">${control.label}</label>
            <select id="master-${key}" style="width: 100%; padding: 10px; border: 1px solid #DCD6C8; background-color: #FFFFFF; font-size: 14px; color: var(--text-dark); outline: none; cursor: pointer;">
                ${control.options.map(opt => `<option value="\${opt}" opt === control.default ? 'selected' : ''>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('')}
            </select>
        `;
        yellowZone.appendChild(segment);
    }
}

function renderGrayZone(grayData) {
    const grayZone = document.getElementById("grayZone");

    // Sektion A: Objekt-Art (Hierarchische Eltern-Kind-Logik)
    if (grayData.objekt_art) {
        const objArtSection = document.createElement("div");
        objArtSection.style.borderBottom = "1px solid var(--border-light)";
        objArtSection.style.paddingBottom = "20px";
        
        let htmlContent = `<h4 style="font-size: 13px; text-transform: lowercase; letter-spacing: 1px; color: var(--text-dark); margin-bottom: 12px; font-weight: bold;"><span id="parent-indicator" style="margin-right: 5px; color: var(--gold-dark);">☑</span> ${grayData.objekt_art.label}</h4>`;

        for (const [subKey, subCat] of Object.entries(grayData.objekt_art.sub_categories)) {
            htmlContent += `
                <div style="margin-bottom: 12px; padding-left: 5px;">
                    <span style="font-size: 13px; font-weight: bold; color: var(--gold-dark); display: block; margin-bottom: 6px;">${subCat.label}</span>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${subCat.items.map(item => `
                            <label class="hover-item" style="display: flex; align-items: center; padding: 6px 8px; font-size: 13px; color: #444; cursor: pointer; user-select: none; transition: background-color 0.2s; background-color: #F5F5F5;">
                                <input type="checkbox" class="engine-child-trigger" checked style="margin-right: 10px; accent-color: var(--gold-dark); width: 15px; height: 15px; cursor: pointer;">
                                \${item}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        objArtSection.innerHTML = htmlContent;
        grayZone.appendChild(objArtSection);
        
        // Logik-Verknüpfung für Eltern-Kind-Indikator initialisieren
        setupParentChildLogic();
    }
}
// Sektion B: Dimensionen, Preise & Zimmer (Kompakte Doppel-Zeilen)
    if (grayData.dimensionen_und_preise) {
        const dimSection = document.createElement("div");
        dimSection.style.borderBottom = "1px solid var(--border-light)";
        dimSection.style.paddingBottom = "20px";
        
        dimSection.innerHTML = `
            <h4 style="font-size: 13px; text-transform: lowercase; letter-spacing: 1px; color: var(--text-dark); margin-bottom: 12px; font-weight: bold;">${grayData.dimensionen_und_preise.label}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="background-color: #F5F5F5; padding: 6px 8px;">
                    <label style="display: block; font-size: 10px; color: var(--gold-dark);">${grayData.dimensionen_und_preise.fields.preis_minimal.label}</label>
                    <select style="width: 100%; border: none; background: transparent; font-size: 13px; outline: none; cursor: pointer;"><option>0 €</option><option>60.000 €</option></select>
                </div>
                <div style="background-color: #F5F5F5; padding: 6px 8px;">
                    <label style="display: block; font-size: 10px; color: var(--gold-dark);">${grayData.dimensionen_und_preise.fields.preis_maximal.label}</label>
                    <select style="width: 100%; border: none; background: transparent; font-size: 13px; outline: none; cursor: pointer;"><option>Maximal</option></select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background-color: #F5F5F5; padding: 6px 8px;">
                    <label style="display: block; font-size: 10px; color: var(--gold-dark);">${grayData.dimensionen_und_preise.fields.groesse_minimal.label}</label>
                    <select style="width: 100%; border: none; background: transparent; font-size: 13px; outline: none; cursor: pointer;"><option>0 m²</option></select>
                </div>
                <div style="background-color: #F5F5F5; padding: 6px 8px;">
                    <label style="display: block; font-size: 10px; color: var(--gold-dark);">${grayData.dimensionen_und_preise.fields.groesse_maximal.label}</label>
                    <select style="width: 100%; border: none; background: transparent; font-size: 13px; outline: none; cursor: pointer;"><option>unbegrenzt</option></select>
                </div>
            </div>
        `;
        grayZone.appendChild(dimSection);
    }

    // Sektion C: Merkmale & Umgebung (Das stabile vertikale Band)
    if (grayData.merkmale_und_umgebung) {
        const featSection = document.createElement("div");
        featSection.style.borderBottom = "1px solid var(--border-light)";
        featSection.style.paddingBottom = "20px";
        
        let featHtml = `<h4 style="font-size: 13px; text-transform: lowercase; letter-spacing: 1px; color: var(--text-dark); margin-bottom: 12px; font-weight: bold;">${grayData.merkmale_und_umgebung.label}</h4><div style="display: flex; flex-direction: column; gap: 8px;">`;
        
        grayData.merkmale_und_umgebung.items.forEach(item => {
            featHtml += `
                <label style="display: flex; align-items: center; padding: 6px 8px; font-size: 13px; color: #444; cursor: pointer; user-select: none; transition: background-color 0.2s; background-color: #F5F5F5;">
                    <input type="checkbox" checked style="margin-right: 10px; accent-color: var(--gold-dark); width: 15px; height: 15px; cursor: pointer;">
                    \${item}
                </label>
            `;
        });
        featHtml += `</div>`;
        featSection.innerHTML = featHtml;
        grayZone.appendChild(featSection);
    }
}

// 4. Intelligente Eltern-Kind-Logik (Sklavische Umsetzung deines Excel-Befehls)
function setupParentChildLogic() {
    const children = document.querySelectorAll(".engine-child-trigger");
    const parentIndicator = document.getElementById("parent-indicator");
    if (!parentIndicator || children.length === 0) return;

    function evaluateZustand() {
        let allChecked = true;
        let noneChecked = true;

        children.forEach(cb => {
            if (cb.checked) noneChecked = false;
            if (!cb.checked) allChecked = false;
        });

        if (allChecked) {
            parentIndicator.textContent = "☑";
            parentIndicator.style.color = "var(--gold-dark)";
        } else if (noneChecked) {
            parentIndicator.textContent = "☐";
            parentIndicator.style.color = "#CCCCCC";
        } else {
            parentIndicator.textContent = "⚬"; // Der Teil-Ausschluss-Indikator (-) laut Protokoll
            parentIndicator.style.color = "var(--gold-dark)";
        }
    }

    children.forEach(cb => cb.addEventListener("change", evaluateZustand));
    evaluateZustand(); // Initiallauf
}