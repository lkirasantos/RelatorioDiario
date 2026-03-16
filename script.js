let currentDayData = [];
let historyData = JSON.parse(localStorage.getItem('pdvHistory')) || [];
let myChart;

window.onload = () => {
    // Data automática: 16/03/2026 conforme sistema
    document.getElementById('m-data').value = new Date().toISOString().split('T')[0];
    updateHistoryStats();
    initChart();
};

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

    if(!pdv || !inicio || !fim) return alert("Preencha PDV e Horários!");

    const diff = calculateDiff(inicio, fim);
    currentDayData.push({ PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff, obs: "" });
    
    renderTable();
    document.getElementById('m-inicio').value = '';
    document.getElementById('m-fim').value = '';
}

function renderTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    currentDayData.forEach((row, index) => {
        let status = row.minutos <= 5 ? 'status-bom' : row.minutos <= 15 ? 'status-regular' : 'status-ruim';
        let label = row.minutos <= 5 ? 'BOM' : row.minutos <= 15 ? 'REGULAR' : 'RUIM';
        tbody.innerHTML += `<tr>
            <td>${row.PDV}</td><td>${row.Data}</td><td>${row.HoraInicio}</td><td>${row.HoraFim}</td>
            <td>${row.minutos} min</td><td class="${status}">${label}</td>
            <td><input type="text" class="obs-field" value="${row.obs}" onchange="updateObs(${index}, this.value)"></td>
        </tr>`;
    });
    updateTodayStats();
}

function updateObs(index, val) { currentDayData[index].obs = val; }

function updateTodayStats() {
    if (currentDayData.length === 0) return;
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const avg = (total / currentDayData.length).toFixed(1);
    document.getElementById('avg-day').innerText = `${avg} min`;
    document.getElementById('total-ocs').innerText = currentDayData.length;
}

function finalizarDia() {
    if(currentDayData.length === 0) return alert("Sem dados hoje!");
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const avgDay = (total / currentDayData.length).toFixed(1);
    
    historyData.push({ data: currentDayData[0].Data, media: parseFloat(avgDay) });
    localStorage.setItem('pdvHistory', JSON.stringify(historyData));
    
    currentDayData = [];
    renderTable();
    updateHistoryStats();
    updateChart();
    alert("Dia salvo no histórico!");
}

function exportarExcel() {
    if(currentDayData.length === 0) return alert("Tabela vazia!");
    const ws = XLSX.utils.json_to_sheet(currentDayData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `Relatorio_PDV_${new Date().toLocaleDateString()}.xlsx`);
}

function updateHistoryStats() {
    if (historyData.length === 0) return;
    const total = historyData.reduce((acc, c) => acc + c.media, 0);
    const avgMonth = (total / historyData.length).toFixed(1);
    document.getElementById('avg-month').innerText = `${avgMonth} min`;
    document.getElementById('status-month').innerText = avgMonth <= 5 ? "BOM ✅" : avgMonth <= 15 ? "REGULAR ⚠️" : "RUIM ❌";
}

function initChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.map(d => d.data),
            datasets: [{ label: 'Médias Diárias', data: historyData.map(d => d.media), borderColor: '#58a6ff', tension: 0.3 }]
        }
    });
}

function updateChart() {
    myChart.data.labels = historyData.map(d => d.data);
    myChart.data.datasets[0].data = historyData.map(d => d.media);
    myChart.update();
}

function limparTudo() {
    if(confirm("Isso apagará TODO o histórico do gráfico e meses. Confirma?")) {
        localStorage.clear();
        location.reload();
    }
}
