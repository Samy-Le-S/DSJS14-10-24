// Fonction pour obtenir les valeurs des inputs
function getValues() {
    const { inputMontant, inputTaux, inputAnnee } = window;
    const montant = Math.abs(inputMontant.valueAsNumber) || 0;
    const annee = Math.abs(inputAnnee.valueAsNumber) || 0;
    const mois = annee * 12 || 1;
    const taux = Math.abs(inputTaux.valueAsNumber) || 0;
    const tauxMensuel = taux / 100 / 12;
    return { montant, annee, mois, taux, tauxMensuel };
}

// Fonction pour calculer la mensualité
function calculMensualite(montant, tauxMensuel, mois) {
    if (tauxMensuel) {
        return montant * tauxMensuel / (1 - Math.pow(1 / (1 + tauxMensuel), mois));
    }
    return montant / mois;
}

// Fonction pour calculer l'amortissement
function calculAmortissement(montant, tauxMensuel, mois, annee) {
    const remboursementMensuel = calculMensualite(montant, tauxMensuel, mois);
    let balance = montant;
    const amortissementM = [];

    for (let y = 0; y < annee; y++) {
        for (let m = 0; m < 12; m++) {
            const interestM = balance * tauxMensuel;
            const montantM = remboursementMensuel - interestM;
            balance -= montantM;
            amortissementM.push({ remboursementMensuel, capitalAmorti: montantM, interet: interestM, capitalRestantDu: balance });
        }
    }

    return { remboursementMensuel, amortissementM };
}

// Fonction pour remplir le tableau avec les données d'amortissement
function remplirTableau(amortissement) {
    const tbody = document.querySelector("#inputMensualite tbody");
    tbody.innerHTML = amortissement.map(({ remboursementMensuel, capitalAmorti, interet, capitalRestantDu }, index) => {
        const isWarning = Math.round(capitalAmorti) < Math.round(interet) * 1.5;
        return `
            <tr class="${isWarning ? "warning" : ""}">
                <td>${index + 1}</td>
                <td>${Math.round(capitalAmorti)}</td>
                <td>${Math.round(interet)}</td>
                <td>${Math.round(capitalRestantDu)}</td>
                <td>${Math.round(remboursementMensuel)}</td>
            </tr>
        `;
    }).join('');
}

// Ajout d'un écouteur d'événements pour chaque input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener("input", () => {
        const { montant, tauxMensuel, mois, annee } = getValues();
        const { amortissementM } = calculAmortissement(montant, tauxMensuel, mois, annee);
        remplirTableau(amortissementM);
    });
});

let currentSortColumn = -1;
let currentSortOrder = 'asc';

// Fonction pour trier le tableau
function sortTable(columnIndex) {
    const table = document.getElementById("inputMensualite");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);

    if (currentSortColumn === columnIndex) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = columnIndex;
        currentSortOrder = 'asc';
    }

    const sortedRows = rows.sort((a, b) => {
        const aValue = parseFloat(a.cells[columnIndex].innerText);
        const bValue = parseFloat(b.cells[columnIndex].innerText);
        return currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
    updateSortArrows();
}

// Fonction pour mettre à jour les flèches de tri
function updateSortArrows() {
    document.querySelectorAll('.sort-arrow').forEach(arrow => {
        arrow.classList.remove('asc', 'desc');
    });

    if (currentSortColumn !== -1) {
        const arrow = document.getElementById(`arrow-${currentSortColumn}`);
        arrow.classList.add(currentSortOrder);
    }
}