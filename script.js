document.addEventListener('DOMContentLoaded', function() {
    const files = [
        "main.html", "iunie.html", "iulie.html", "august.html", "sept.html",
        "octombrie.html", "noiembrie.html", "decembrie.html"
    ];
    const monthToFile = {
        4: "main.html",      // Mai (lunile JS sunt 0-based)
        5: "iunie.html",
        6: "iulie.html",
        7: "august.html",
        8: "sept.html",
        9: "octombrie.html",
        10: "noiembrie.html",
        11: "decembrie.html"
    };
    const now = new Date();
    const currentMonth = now.getMonth();
    const expectedFile = monthToFile[currentMonth];
    const currentFile = window.location.pathname.split("/").pop();

    // Redirecționează automat doar dacă ești pe root sau index.html
    if (
        (!currentFile || currentFile === "" || currentFile === "index.html") &&
        expectedFile
    ) {
        window.location.href = expectedFile;
        return;
    }

    // Navigarea între luni
    let currentIndex = files.indexOf(currentFile);

    function navigate(direction) {
        if (direction === "left" && currentIndex > 0) {
            currentIndex--;
            window.location.href = files[currentIndex];
        } else if (direction === "right" && currentIndex < files.length - 1) {
            currentIndex++;
            window.location.href = files[currentIndex];
        }
    }

    document.getElementById("left-arrow").addEventListener("click", () => navigate("left"));
    document.getElementById("right-arrow").addEventListener("click", () => navigate("right"));

    // Elementele pop-up
    const popup = document.getElementById("popup");
    const sosireBtn = document.getElementById("sosire-btn");
    const plecareBtn = document.getElementById("plecare-btn");
    const closeBtn = document.querySelector(".close-btn");
    const manualBtn = document.getElementById("manual-btn");
    const manualInputs = document.getElementById("manual-inputs");
    const manualSosire = document.getElementById("manual-sosire");
    const manualPlecare = document.getElementById("manual-plecare");
    const manualOk = document.getElementById("manual-ok");
    const manualClear = document.getElementById("manual-clear");

    let currentCell = null;
    const today = new Date();
    const currentDay = today.getDate();

    // Funcție pentru închiderea pop-up-ului
    function closePopup() {
        popup.classList.add("hidden");
        document.querySelectorAll(".highlight").forEach(cell => cell.classList.remove("highlight"));
        manualInputs.classList.add("hidden");
        manualInputs.style.display = "none";
        sosireBtn.style.display = "none";
        plecareBtn.style.display = "none";
        manualBtn.style.display = "none";
        manualSosire.value = "";
        manualPlecare.value = "";
        currentCell = null;
    }

    // Funcție pentru obținerea numărului lunii
    function getCurrentMonthNumber() {
        const months = {
            'Ianuarie': '01', 'Februarie': '02', 'Martie': '03', 'Aprilie': '04',
            'Mai': '05', 'Iunie': '06', 'Iulie': '07', 'August': '08',
            'Septembrie': '09', 'Octombrie': '10', 'Noiembrie': '11', 'Decembrie': '12'
        };
        const th = document.querySelector('thead th[rowspan="2"]');
        return months[th ? th.textContent.trim() : 'Mai'] || '05';
    }

    // Funcție pentru salvarea datelor în baza de date
    async function saveToDatabase(employee, day, sosire, plecare) {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee,
                    day,
                    sosire: sosire || null,
                    plecare: plecare || null,
                    luna: getCurrentMonthNumber()
                })
            });
            const result = await response.json();
            if (result.status === 'error') {
                console.error('Eroare la salvarea în baza de date:', result.message);
                alert(`Eroare la salvarea datelor: ${result.message}`);
            }
        } catch (err) {
            console.error('Eroare la salvarea în baza de date:', err);
            alert('Eroare la comunicarea cu serverul. Verificați conexiunea sau serverul.');
        }
    }

    // Funcție pentru setarea orei curente
    function setTime(type) {
        if (!currentCell) return;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (type === "sosire") {
            currentCell.querySelector(".top").textContent = time;
        } else if (type === "plecare") {
            currentCell.querySelector(".bottom").textContent = time;
        }
        const employee = currentCell.closest('tr').querySelector('.name-button').textContent;
        const cells = Array.from(currentCell.parentNode.querySelectorAll('.ora'));
        const day = cells.indexOf(currentCell) + 1;
        const sosire = currentCell.querySelector(".top").textContent;
        const plecare = currentCell.querySelector(".bottom").textContent;
        saveToDatabase(employee, day, sosire, plecare);
        closePopup();
    }

    // Clic pe numele angajatului
    document.querySelectorAll(".name-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".highlight").forEach(cell => cell.classList.remove("highlight"));
            const employeeRow = button.closest("tr").id;
            const row = document.getElementById(employeeRow);
            const cells = row.querySelectorAll(".ora");
            currentCell = cells[currentDay - 1];
            if (currentCell) {
                currentCell.classList.add("highlight");
            } else {
                alert("Eroare: Celula pentru ziua curentă nu este disponibilă!");
                console.error('Celula lipsă pentru ziua:', currentDay);
                return;
            }
            sosireBtn.style.display = "inline-block";
            plecareBtn.style.display = "inline-block";
            manualBtn.style.display = "inline-block";
            manualInputs.classList.add("hidden");
            manualInputs.style.display = "none";
            popup.classList.remove("hidden");
        });
    });

    // Clic pe celule
    document.querySelectorAll(".ora").forEach(cell => {
        cell.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".highlight").forEach(c => c.classList.remove("highlight"));
            currentCell = cell;
            currentCell.classList.add("highlight");
            sosireBtn.style.display = "none";
            plecareBtn.style.display = "none";
            manualBtn.style.display = "none";
            manualInputs.classList.remove("hidden");
            manualInputs.style.display = "flex";
            manualSosire.value = currentCell.querySelector(".top").textContent || "";
            manualPlecare.value = currentCell.querySelector(".bottom").textContent || "";
            popup.classList.remove("hidden");
        });
    });

    // Butonul Sosire
    sosireBtn.addEventListener("click", () => setTime("sosire"));

    // Butonul Plecare
    plecareBtn.addEventListener("click", () => setTime("plecare"));

    // Butonul Manual
    manualBtn.addEventListener("click", () => {
        manualInputs.classList.remove("hidden");
        manualInputs.style.display = "flex";
        sosireBtn.style.display = "none";
        plecareBtn.style.display = "none";
        manualBtn.style.display = "none";
        manualSosire.value = currentCell.querySelector(".top").textContent || "";
        manualPlecare.value = currentCell.querySelector(".bottom").textContent || "";
    });

    // Butonul OK: Salvează orele introduse
    manualOk.addEventListener("click", () => {
        if (!currentCell) {
            alert("Selectați o celulă înainte de a salva valorile!");
            return;
        }

        const sosireValue = manualSosire.value.trim();
        const plecareValue = manualPlecare.value.trim();
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (sosireValue && !timeRegex.test(sosireValue)) {
            alert(`Ora de sosire "${sosireValue}" nu este validă! Folosiți formatul HH:MM.`);
            return;
        }
        if (plecareValue && !timeRegex.test(plecareValue)) {
            alert(`Ora de plecare "${plecareValue}" nu este validă! Folosiți formatul HH:MM.`);
            return;
        }

        // Salvează valorile în celulă
        currentCell.querySelector(".top").textContent = sosireValue;
        currentCell.querySelector(".bottom").textContent = plecareValue;

        // Salvează în baza de date
        const employee = currentCell.closest('tr').querySelector('.name-button').textContent;
        const cells = Array.from(currentCell.parentNode.querySelectorAll('.ora'));
        const day = cells.indexOf(currentCell) + 1;
        saveToDatabase(employee, day, sosireValue, plecareValue);
        closePopup();
    });

    // Butonul Clear: Șterge conținutul celulei
    manualClear.addEventListener("click", () => {
        if (!currentCell) {
            alert("Selectați o celulă înainte de a șterge valorile!");
            return;
        }

        // Șterge valorile din celulă
        currentCell.querySelector(".top").textContent = "";
        currentCell.querySelector(".bottom").textContent = "";

        // Salvează valori nule în baza de date
        const employee = currentCell.closest('tr').querySelector('.name-button').textContent;
        const cells = Array.from(currentCell.parentNode.querySelectorAll('.ora'));
        const day = cells.indexOf(currentCell) + 1;
        saveToDatabase(employee, day, null, null);
        closePopup();
    });

    // Închiderea pop-up-ului
    closeBtn.addEventListener("click", closePopup);

    // Încarcă datele existente din baza de date
    const luna = getCurrentMonthNumber();
    fetch(`/api/attendance?luna=${luna}`)
        .then(res => res.json())
        .then(data => {
            data.forEach(row => {
                const [year, month, day] = row.data.split('-');
                if (month !== luna) return;
                const tr = Array.from(document.querySelectorAll('tbody tr')).find(tr =>
                    tr.querySelector('.name-button').textContent === row.nume
                );
                if (!tr) return;
                const td = tr.querySelectorAll('.ora')[parseInt(day, 10) - 1];
                if (!td) return;
                if (row.ora_sosire) td.querySelector('.top').textContent = row.ora_sosire;
                if (row.ora_plecare) td.querySelector('.bottom').textContent = row.ora_plecare;
            });
        })
        .catch(err => console.error('Eroare la încărcarea datelor:', err));
});