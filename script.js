let allData = [];

document.getElementById('file-upload').addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        rows.forEach(row => {
            const diff = calculateDiff(row.HoraInicio, row.HoraFim);
            allData.push({ ...row, minutos: diff });
        });
        renderTable();
    };
    reader.readAsArrayBuffer(file);
}

function calculateDiff(start, end) {
    if(!start || !end) return 0;
    const s = new Date(`2024-01-01T${start}`);
    const e = new Date(`2024-01-01T${end}`);
    let diff = Math.floor((e - s) / 60000);
    return diff < 0 ? 0 : diff;
}

function addManualRow() {
    const pdv = document.getElementById('m-pdv').value;
    const data = document.getElementById('m-data').value;
    const inicio = document.getElementById('m-inicio').value;
    const fim = document.getElementById('m-fim').value;

    if(!inicio || !fim) return alert("Preencha as horas!");

    const diff = calculateDiff(inicio, fim);
    allData.push({ PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff });
    
    renderTable();
    // Limpa campos
    document.getElementById('m-pdv').value = '';
}

function renderTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    
    allData.forEach(row => {
        const statusClass = row.minutos <= 5 ? 'status-bom' : row.minutos <= 15 ? 'status-regular' : 'status-ruim';
        const statusLabel = row.minutos <= 5 ? 'BOM' : row.minutos <= 15 ? 'REGULAR' : 'RUIM';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.PDV || '-'}</td>
            <td>${row.Data || '-'}</td>
            <td>${row.HoraInicio}</td>
            <td>${row.HoraFim}</td>
            <td>${row.minutos} min</td>
            <td class="${statusClass}">${statusLabel}</td>
            <td><input type="text" class="obs-field" placeholder="Obs..."></td>
        `;
        tbody.appendChild(tr);
    });
    updateStats();
}

function updateStats() {
    if (allData.length === 0) return;
    const totalMin = allData.reduce((acc, curr) => acc + curr.minutos, 0);
    const avg = (totalMin / allData.length).toFixed(1);
    const bom = allData.filter(d => d.minutos <= 5).length;
    const reg = allData.filter(d => d.minutos > 5 && d.minutos <= 15).length;
    const ruim = allData.filter(d => d.minutos > 15).length;

    document.getElementById('avg-day').innerText = `${avg} min`;
    document.getElementById('total-ocs').innerText = allData.length;
    document.getElementById('status-counts').innerText = `${bom} / ${reg} / ${ruim}`;
}
