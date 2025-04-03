// Variáveis para armazenar os dados de contêineres
let totalContainers = 0;
let fullContainers = 0;
let emptyContainers = 0;
let containerTypes = {
    "20 Dry": 0,
    "20 FR": 0,
    "20 OT": 0,
    "20 RF": 0,
    "20 TANK": 0,
    "40 Dry": 0,
    "40 FR": 0
};

// Variáveis para os gráficos
let containerTypeChart = null;
let containerStatusChart = null;

// Manipulador do formulário
document.getElementById('inventoryForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    // Captura os valores do formulário
    var date = document.getElementById('date').value;
    var containerNumber = document.getElementById('containerNumber').value;
    var containerType = document.getElementById('containerType').value;
    
    // Determina o status do contêiner com base no estado do checkbox
    var containerStatus = document.getElementById('containerStatus').checked ? "Cheio" : "Vazio";
    document.getElementById('statusLabel').textContent = containerStatus; // Atualiza o texto diretamente para "Cheio" ou "Vazio"
    
    var observations = document.getElementById('observations').value;

    // Verifica se o número do contêiner é alfanumérico
    var containerNumberRegex = /^[A-Za-z0-9]+$/;
    if (!containerNumberRegex.test(containerNumber)) {
        alert('O número do contêiner deve ser alfanumérico.');
        return;
    }

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!date || !containerNumber || !containerType) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Adiciona uma linha na tabela com os dados
    var table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    var newRow = table.insertRow();

    newRow.innerHTML = `
        <td>${date}</td>
        <td>${containerNumber}</td>
        <td>${containerType}</td>
        <td>${containerStatus}</td>
        <td>${observations}</td>
        <td>
            <button onclick="editRow(this)">Editar</button>
            <button onclick="deleteRow(this)">Excluir</button>
        </td>
    `;

    // Atualiza as contagens no dashboard
    totalContainers++;
    if (containerStatus === "Cheio") {
        fullContainers++;
    } else {
        emptyContainers++;
    }
    containerTypes[containerType]++;

    // Atualiza os dados no gráfico
    updateCharts();

    // Limpar os campos após envio
    document.getElementById('inventoryForm').reset();
});

// Função para excluir uma linha
function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var containerType = row.cells[2].textContent;
    var containerStatus = row.cells[3].textContent;

    row.parentNode.removeChild(row);

    // Atualiza as contagens
    totalContainers--;
    if (containerStatus === "Cheio") {
        fullContainers--;
    } else {
        emptyContainers--;
    }
    containerTypes[containerType]--;

    updateCharts();
}

// Função para editar uma linha
function editRow(button) {
    var row = button.parentNode.parentNode;
    var date = row.cells[0].textContent;
    var containerNumber = row.cells[1].textContent;
    var containerType = row.cells[2].textContent;
    var containerStatus = row.cells[3].textContent === "Cheio" ? true : false;
    var observations = row.cells[4].textContent;

    // Preenche os campos do formulário com os valores da linha
    document.getElementById('date').value = date;
    document.getElementById('containerNumber').value = containerNumber;
    document.getElementById('containerType').value = containerType;
    document.getElementById('containerStatus').checked = containerStatus;
    document.getElementById('observations').value = observations;

    // Opcional: Remover a linha após a edição para não duplicar dados
    deleteRow(button); // Exclui a linha antiga antes de salvar a nova
}

// Função para atualizar os gráficos
function updateCharts() {
    // Gráfico de Tipos de Contêineres
    if (containerTypeChart) {
        containerTypeChart.data.datasets[0].data = Object.values(containerTypes);
        containerTypeChart.update();
    }

    // Gráfico de Cheios vs Vazios
    if (containerStatusChart) {
        containerStatusChart.data.datasets[0].data = [fullContainers, emptyContainers];
        containerStatusChart.update();
    }

    // Exibe o dashboard
    document.getElementById('dashboard').style.display = "block";
}

// Função para gerar o PDF do dashboard
function downloadDashboard() {
    const dashboardElement = document.getElementById('dashboard');
    
    // Opções de configuração do html2pdf
    const options = {
        margin: 10,
        filename: 'dashboard.pdf',
        html2canvas: {
            scale: 2, // Aumenta a qualidade da renderização do canvas
            logging: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape', // Define a orientação horizontal
            compressPdf: true, // Comprime o PDF para reduzir o tamanho do arquivo
            pageSize: 'a4', // Tamanho da página A4
            autoSize: true // Ajusta o conteúdo automaticamente para caber na página
        }
    };

    // Gera o PDF
    html2pdf().from(dashboardElement).set(options).save();
}

// Função para exportar a tabela para Excel
function exportToExcel() {
    var wb = XLSX.utils.table_to_book(document.getElementById('inventoryTable'), { sheet: "Inventário" });
    XLSX.writeFile(wb, "inventario.xlsx");
}

// Inicializa os gráficos
window.onload = function() {
    var ctx1 = document.getElementById('containerTypeChart').getContext('2d');
    containerTypeChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: Object.keys(containerTypes),
            datasets: [{
                data: Object.values(containerTypes),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF99'],
            }]
        }
    });

    var ctx2 = document.getElementById('containerStatusChart').getContext('2d');
    containerStatusChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Cheios', 'Vazios'],
            datasets: [{
                data: [fullContainers, emptyContainers],
                backgroundColor: ['#FF6384', '#36A2EB'],
            }]
        }
    });
};

// Atualiza o status do contêiner sempre que o toggle mudar
document.getElementById('containerStatus').addEventListener('change', function() {
    var containerStatus = this.checked ? "Cheio" : "Vazio";
    document.getElementById('statusLabel').textContent = containerStatus; // Atualiza o texto para refletir o status
});
