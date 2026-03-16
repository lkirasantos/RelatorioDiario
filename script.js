document.getElementById('file-upload').addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        renderTable(rows);
    };
    reader.readAsArrayBuffer(file);
}

function calculateDiff(start, end) {
    const s = new Date(`2024-01-01T${start}`);
    const e = new Date(`2024-01-01T${end}`);
    return Math.floor((e - s) / 60000); // retorna minutos
}

function getStatusClass(minutes) {
    if (minutes <= 5) return 'status-bom';
    if (minutes <= 15) return 'status-regular';
    return 'status-ruim';
}

function getStatusLabel(minutes) {
    if (minutes <= 5) return 'Bom';
    if (minutes <= 15) return 'Regular';
    return 'Ruim';
}

function renderTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    let stats = { bom: 0, regular: 0, ruim: 0 };

    data.forEach(row => {
        const diff = calculateDiff(row.HoraInicio, row.HoraFim);
        const statusClass = getStatusClass(diff);
        const statusLabel = getStatusLabel(diff);
        
        // Contagem para o resumo
        if (diff <= 5) stats.bom++;
        else if (diff <= 15) stats.regular++;
        else stats.ruim++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.PDV}</td>
            <td>${row.Data}</td>
            <td>${row.HoraInicio}</td>
            <td>${row.HoraFim}</td>
            <td>${diff} min</td>
            <td class="${statusClass}">${statusLabel}</td>
            <td><input type="text" placeholder="Obs..."></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total-stats').innerHTML = 
        `Total: ${data.length} | Bom: ${stats.bom} | Regular: ${stats.regular} | Ruim: ${stats.ruim}`;
}