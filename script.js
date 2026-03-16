let allData = [];

function updateStats() {
    if (allData.length === 0) return;
    
    const totalMinutes = allData.reduce((acc, curr) => acc + curr.minutos, 0);
    const avg = (totalMinutes / allData.length).toFixed(1);
    
    document.getElementById('avg-day').innerText = `${avg} min`;
    document.getElementById('total-ocs').innerText = allData.length;
    
    const bom = allData.filter(d => d.minutos <= 5).length;
    const regular = allData.filter(d => d.minutos > 5 && d.minutos <= 15).length;
    const ruim = allData.filter(d => d.minutos > 15).length;
    
    document.getElementById('status-counts').innerHTML = `B/R/R <span>${bom} / ${regular} / ${ruim}</span>`;
}

function addManualRow() {
    const pdv = document.getElementById('m-pdv').value;
    const data = document.getElementById('m-data').value;
    const inicio = document.getElementById('m-inicio').value;
    const fim = document.getElementById('m-fim').value;

    if(!inicio || !fim) return alert("Preencha as horas!");

    const diff = calculateDiff(inicio, fim);
    const newData = { PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff };
    
    allData.push(newData);
    renderNewRow(newData);
    updateStats();
}

function renderNewRow(row) {
    const tbody = document.querySelector('#data-table tbody');
    const statusClass = getStatusClass(row.minutos);
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${row.PDV}</td>
        <td>${row.Data}</td>
        <td>${row.HoraInicio}</td>
        <td>${row.HoraFim}</td>
        <td>${row.minutos} min</td>
        <td class="${statusClass}">${getStatusLabel(row.minutos)}</td>
        <td><input type="text" class="obs-field" placeholder="Obs..."></td>
    `;
    tbody.appendChild(tr);
}

// Reutilize suas funções calculateDiff, getStatusClass e getStatusLabel anteriores
