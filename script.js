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
    var containerNumber = document.getElementById('containerNumber').value.toUpperCase(); // Garantir que o número do contêiner seja em maiúsculas
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

// Obtém o botão de abrir câmera, o botão de fechar câmera e o elemento de vídeo
const openCameraBtn = document.getElementById('openCameraBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const cameraPreview = document.getElementById('cameraPreview');
let cameraStream = null;

// Função para abrir a câmera (câmera traseira por padrão)
openCameraBtn.addEventListener('click', function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Solicita permissão para acessar a câmera traseira
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        })
        .then(function(stream) {
            // Exibe o vídeo da câmera no elemento <video>
            cameraPreview.srcObject = stream;
            cameraPreview.style.display = "block"; // Torna o vídeo visível
            openCameraBtn.style.display = "none"; // Esconde o botão após abrir a câmera
            closeCameraBtn.style.display = "inline-block"; // Exibe o botão de fechar câmera

            // Armazena o stream da câmera para poder interrompê-lo depois
            cameraStream = stream;
        })
        .catch(function(error) {
            alert("Não foi possível acessar a câmera: " + error.message);
        });
    } else {
        alert("Seu navegador não suporta o acesso à câmera.");
    }
});

// Função para capturar uma imagem da câmera e executar OCR
document.getElementById('captureBtn').addEventListener('click', function() {
    // Cria um canvas para capturar a imagem do vídeo
    const canvas = document.createElement('canvas');
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    const ctx = canvas.getContext('2d');

    // Captura o quadro do vídeo
    ctx.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

    // Aplica filtro para melhorar a qualidade da imagem
    ctx.filter = 'contrast(200%) brightness(120%)'; // Aumenta o contraste e o brilho
    ctx.drawImage(canvas, 0, 0); // Reaplica a imagem no canvas

    // Converte para escala de cinza para melhorar o OCR
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // Loop para converter imagem em preto e branco (escala de cinza)
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Cálculo para intensidade de cinza
        let gray = (r * 0.3 + g * 0.59 + b * 0.11);
        data[i] = gray; // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
    }

    // Atualiza a imagem processada
    ctx.putImageData(imageData, 0, 0);

    // Usando o Tesseract para reconhecer o texto da imagem capturada
    Tesseract.recognize(
        canvas.toDataURL(), // Passa a imagem como um Data URL
        'eng', // O idioma a ser usado (no caso, inglês)
        {
            logger: m => console.log(m),
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // Limita o OCR a caracteres alfanuméricos
        }
    ).then(({ data: { text } }) => {
        // Preenche o número do contêiner com o texto reconhecido
        document.getElementById('containerNumber').value = text.trim().toUpperCase(); // Preenche com maiúsculas
    }).catch(error => {
        console.error("Erro ao realizar OCR: ", error);
    });
});

// Função para fechar a câmera
closeCameraBtn.addEventListener('click', function() {
    if (cameraStream) {
        // Interrompe o stream da câmera
        cameraStream.getTracks().forEach(track => track.stop());
    }
    cameraPreview.style.display = "none"; // Esconde o vídeo
    openCameraBtn.style.display = "inline-block"; // Exibe o botão de abrir câmera
    closeCameraBtn.style.display = "none"; // Esconde o botão de fechar câmera
});
