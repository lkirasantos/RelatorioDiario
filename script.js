:root {
    --bg-color: #121212;
    --card-bg: #1e1e1e;
    --text-color: #e0e0e0;
    --border-color: #333;
}

body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    padding: 20px; 
    background-color: var(--bg-color); 
    color: var(--text-color);
}

.summary-card { 
    background: var(--card-bg); 
    padding: 20px; 
    border-radius: 12px; 
    margin-bottom: 20px; 
    border: 1px solid var(--border-color);
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.stat-item { text-align: center; }
.stat-item span { display: block; font-size: 1.5rem; font-weight: bold; color: #007bff; }

table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden; }
th, td { border: 1px solid var(--border-color); padding: 10px; text-align: center; }
th { background-color: #2c2c2c; color: #fff; }

input, button { 
    background: #2c2c2c; 
    color: white; 
    border: 1px solid #444; 
    padding: 8px; 
    border-radius: 4px;
}

button { cursor: pointer; background: #007bff; border: none; font-weight: bold; }
button:hover { background: #0056b3; }

.status-bom { background-color: #1b5e20 !important; color: #c8e6c9; }
.status-regular { background-color: #fbc02d !important; color: #333; }
.status-ruim { background-color: #b71c1c !important; color: #ffcdd2; }
