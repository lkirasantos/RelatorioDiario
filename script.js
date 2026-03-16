let currentDayData = [];
let historyData = JSON.parse(localStorage.getItem('pdvHistory')) || [];
let myChart;

// Iniciar página
window.onload = () => {
    // Definir data de hoje no campo
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('m-data').value = hoje;
    
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

    if(!pdv || !inicio || !fim) return alert("Selecione o PDV e as horas!");

    const diff = calculateDiff(inicio, fim);
    currentDayData.push({ PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff });
    
    renderTable();
    // Nota: O PDV e Data não são limpos para ficarem "travados" como você pediu
    document.getElementById('m-inicio').value = '';
    document.getElementById('m-fim').value = '';
}

function renderTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    currentDayData.forEach(row => {
        let status = row.minutos <= 5 ? 'status-bom' : row.minutos <= 15 ? 'status-regular' : 'status-ruim';
        let label = row.minutos <= 5 ? 'BOM' : row.minutos <= 15 ? 'REGULAR' : 'RUIM';
        tbody.innerHTML += `<tr>
            <td>${row.PDV}</td><td>${row.Data}</td><td>${row.HoraInicio}</td><td>${row.HoraFim}</td>
            <td>${row.minutos} min</td><td class="${status}">${label}</td>
            <td><input type="text" style="width:80%" placeholder="..."></td>
        </tr>`;
    });
    updateTodayStats();
}

function updateTodayStats() {
    if (currentDayData.length === 0) return;
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const avg = (total / currentDayData.length).toFixed(1);
    document.getElementById('avg-day').innerText = `${avg} min`;
    document.getElementById('total-ocs').innerText = currentDayData.length;
}

function finalizarDia() {
    if(currentDayData.length === 0) return alert("Nenhum dado para salvar!");
    
    const totalMin = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const avgDay = (totalMin / currentDayData.length).toFixed(1);
    const dataRef = currentDayData[0].Data;

    // Salvar no histórico
    historyData.push({ data: dataRef, media: parseFloat(avgDay) });
    localStorage.setItem('pdvHistory', JSON.stringify(historyData));

    // Limpar para o próximo dia
    currentDayData = [];
    renderTable();
    updateHistoryStats();
    updateChart();
    alert("Dia finalizado e salvo com sucesso!");
}

function updateHistoryStats() {
    if (historyData.length === 0) return;
    const total = historyData.reduce((acc, c) => acc + c.media, 0);
    const avgMonth = (total / historyData.length).toFixed(1);
    
    document.getElementById('avg-month').innerText = `${avgMonth} min`;
    
    let status = "";
    if(avgMonth <= 5) status = "BOM ✅";
    else if(avgMonth <= 15) status = "REGULAR ⚠️";
    else status = "RUIM ❌";
    
    document.getElementById('status-month').innerText = status;
}

function initChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.map(d => d.data),
            datasets: [{
                label: 'Média de Tempo (min)',
                data: historyData.map(d => d.media),
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { scales: { y: { beginAtZero: true }, x: { ticks: { color: '#8b949e' } } } }
    });
}

function updateChart() {
    myChart.data.labels = historyData.map(d => d.data);
    myChart.data.datasets[0].data = historyData.map(d => d.media);
    myChart.update();
}
