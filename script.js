let currentDayData = [];
let historyData = JSON.parse(localStorage.getItem('pdvHistory')) || [];
let myChart;

window.onload = () => {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('m-data').value = hoje;
    updateHistoryStats();
    initChart();
};

// Escuta o upload de arquivo para importar
document.getElementById('file-upload').addEventListener('change', handleFileUpload);

function handleFileUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        rows.forEach(row => {
            const diff = calculateDiff(row.HoraInicio, row.HoraFim);
            currentDayData.push({ 
                PDV: row.PDV || "PDV -", 
                Data: row.Data || document.getElementById('m-data').value, 
                HoraInicio: row.HoraInicio || "00:00", 
                HoraFim: row.HoraFim || "00:00", 
                minutos: diff 
            });
        });
        renderTable();
        alert("Planilha importada com sucesso!");
    };
    reader.readAsArrayBuffer(file);
}

function calculateDiff(start, end) {
    if(!start || !end) return 0;
    const s = new Date(`2024-01-01T${start}`);
    const e = new Date(`2024-01-01T${end}`);
    let diff = Math.floor((e - s) / 60000);
    return diff < 0 ? diff + 1440 : diff;
}

function addManualRow() {
    const pdv = document.getElementById('m-pdv').value;
    const data = document.getElementById('m-data').value;
    const inicio = document.getElementById('m-inicio').value;
    const fim = document.getElementById('m-fim').value;

    if(!inicio || !fim) return alert("Preencha os horários!");

    const diff = calculateDiff(inicio, fim);
    currentDayData.push({ PDV: pdv, Data: data, HoraInicio: inicio, HoraFim: fim, minutos: diff });
    
    renderTable();
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
            <td><input type="text" placeholder="Adicionar nota..." style="background:transparent;border:none;color:white;border-bottom:1px solid #333;width:100%"></td>
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
    if(currentDayData.length === 0) return alert("Nenhum dado para salvar.");
    const total = currentDayData.reduce((acc, c) => acc + c.minutos, 0);
    const mediaFinal = parseFloat((total/currentDayData.length).toFixed(1));
    
    historyData.push({ data: currentDayData[0].Data, media: mediaFinal });
    localStorage.setItem('pdvHistory', JSON.stringify(historyData));
    
    currentDayData = [];
    renderTable();
    updateHistoryStats();
    alert("Dia finalizado! Gráfico atualizado.");
    location.reload();
}

function exportarExcel() {
    if(currentDayData.length === 0) return alert("Tabela vazia.");
    const ws = XLSX.utils.json_to_sheet(currentDayData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `Relatorio_PDV.xlsx`);
}

function updateHistoryStats() {
    if (!historyData.length) return;
    const total = historyData.reduce((acc, c) => acc + c.media, 0);
    const avg = (total / historyData.length).toFixed(1);
    document.getElementById('avg-month').innerText = `${avg} min`;
    document.getElementById('status-month').innerText = avg <= 5 ? "BOM ✅" : avg <= 15 ? "REGULAR ⚠️" : "RUIM ❌";
}

function initChart() {
    const canvas = document.getElementById('historyChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.map(d => d.data),
            datasets: [{ 
                label: 'Média Diária', 
                data: historyData.map(d => d.media), 
                borderColor: '#58a6ff', 
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(88, 166, 255, 0.1)'
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
