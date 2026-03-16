let currentDayData = [];
let historyData = JSON.parse(localStorage.getItem('pdvHistory')) || [];
let myChart;

window.onload = () => {
    // Data automática
    document.getElementById('m-data').value = new Date().toISOString().split('T')[0];
    updateHistoryStats();
    initChart();
};

function addManualRow() {
    const pdv = document.getElementById('m-pdv').value;
    const data = document.getElementById('m-data').value;
    const inicio = document.getElementById('m-inicio').value;
    const fim = document.getElementById('m-fim').value;

    if(!inicio || !fim) return alert("Preencha as horas de início e fim!");

    const s = new Date(`2024-01-01T${inicio}`);
    const e = new Date(`2024-01-01T${fim}`);
    let diff = Math.floor((e - s) / 60000);
    
    if (diff < 0) diff += 1440; // Ajuste para caso passe da meia-noite

    currentDayData.push({ PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff });
    renderTable();
    
    // Limpa apenas as horas
    document.getElementById('m-inicio').value = '';
    document.getElementById('m-fim').value = '';
}

function renderTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    currentDayData.forEach(row => {
        let cls = row.minutos <= 5 ? 'status-bom' : row.minutos <= 15 ? 'status-regular' : 'status-ruim';
        let label = row.minutos <= 5 ? 'BOM' : row.minutos <= 15 ? 'REGULAR' : 'RUIM';
        tbody.innerHTML += `<tr>
            <td>${row.PDV}</td><td>${row.Data}</td><td>${row.HoraInicio}</td><td>${row.HoraFim}</td>
            <td>${row.minutos} min</td><td class="${cls}">${label}</td>
            <td><input type="text" placeholder="Obs..." style="background:transparent;color:#fff;border:none;border-bottom:1px solid #333;width:100%"></td>
        </tr>`;
    });
    updateTodayStats();
}

function updateTodayStats() {
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const avg = currentDayData.length ? (total / currentDayData.length).toFixed(1) : 0;
    document.getElementById('avg-day').innerText = `${avg} min`;
    document.getElementById('total-ocs').innerText = currentDayData.length;
}

function finalizarDia() {
    if(!currentDayData.length) return alert("Nenhum dado para finalizar.");
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const mediaFinal = parseFloat((total/currentDayData.length).toFixed(1));
    
    historyData.push({ data: currentDayData[0].Data, media: mediaFinal });
    localStorage.setItem('pdvHistory', JSON.stringify(historyData));
    
    currentDayData = [];
    renderTable();
    updateHistoryStats();
    alert("Dia finalizado e salvo no gráfico!");
    location.reload();
}

function exportarExcel() {
    if(!currentDayData.length) return alert("Tabela vazia.");
    const ws = XLSX.utils.json_to_sheet(currentDayData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `Relatorio_PDV_${new Date().toLocaleDateString()}.xlsx`);
}

function updateHistoryStats() {
    if (!historyData.length) return;
    const total = historyData.reduce((acc, c) => acc + c.media, 0);
    const avg = (total / historyData.length).toFixed(1);
    document.getElementById('avg-month').innerText = `${avg} min`;
    document.getElementById('status-month').innerText = avg <= 5 ? "BOM" : avg <= 15 ? "REGULAR" : "RUIM";
}

function initChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.map(d => d.data),
            datasets: [{ 
                label: 'Média Diária (min)', 
                data: historyData.map(d => d.media), 
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { color: '#30363d' } }, x: { grid: { display: false } } }
        }
    });
}

function limparTudo() { 
    if(confirm("Apagar todo o histórico?")) {
        localStorage.clear(); 
        location.reload(); 
    }
}
