// Initialize map
const map = L.map('map').setView([52.237049, 21.017532], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;
let puzzlePieces = [];
let emptySlots = []; // Stores the empty slots in emptyArea
let correctPositions = new Array(16).fill(false);
let draggedPiece = null;
let draggedFromArea = null; // Track if piece is dragged from puzzleArea or emptyArea

// Request permissions
async function requestPermissions() {
    try {
        const notificationPermission = await Notification.requestPermission();
        console.log('Notification permission:', notificationPermission);
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Location button handler
document.getElementById('locationBtn').addEventListener('click', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([latitude, longitude]).addTo(map);
            map.setView([latitude, longitude], 13);
            alert(`Współrzędne: ${latitude}, ${longitude}`);
        });
    }
});

// Download map button handler
let play_counter = 0;
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (play_counter === 0) {
        leafletImage(map, function (err, canvas) {
            if (err) {
                console.error('Error capturing map:', err);
                return;
            }
            const imgData = canvas.toDataURL('image/png');
            createPuzzle(imgData);
        });
        play_counter++;
    } else {
        alert('Odśwież stronę, aby rozpocząć nową grę!');
    }
});

// Create puzzle from map image
function createPuzzle(imgData) {
    const puzzleArea = document.getElementById('puzzleArea');
    const emptyArea = document.getElementById('emptyArea');
    
    puzzleArea.innerHTML = '';
    emptyArea.innerHTML = ''; // Clear emptyArea for new empty slots

    puzzlePieces = [];
    emptySlots = [];
    correctPositions = new Array(16).fill(false);

    // Create temporary image to get dimensions
    const tempImg = new Image();
    tempImg.onload = function () {
        // Create puzzle pieces for puzzleArea
        for (let i = 0; i < 16; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.dataset.originalIndex = i; // Store original position
            piece.dataset.currentIndex = i;  // Store current position

            const img = document.createElement('img');
            img.src = imgData;
            piece.appendChild(img);

            // Calculate clip path for each piece
            const row = Math.floor(i / 4);
            const col = i % 4;
            img.style.clipPath = `inset(${row * 25}% ${100 - (col + 1) * 25}% ${100 - (row + 1) * 25}% ${col * 25}%)`;
            img.style.position = 'absolute';
            img.style.width = '400%';
            img.style.height = '400%';
            img.style.left = `${-col * 100}%`;
            img.style.top = `${-row * 100}%`;

            puzzlePieces.push(piece);
        }

        // Shuffle and add pieces to puzzleArea
        shuffleArray(puzzlePieces);
        puzzlePieces.forEach((piece, index) => {
            piece.dataset.currentIndex = index;
            puzzleArea.appendChild(piece);
        });

        // Create empty slots in emptyArea
        for (let i = 0; i < 16; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'puzzle-piece empty-slot';
            emptySlot.dataset.index = i; // Store index of the slot

            // Add grey background to empty slots
            emptySlot.style.backgroundColor = '#ccc';
            emptyArea.appendChild(emptySlot);
            emptySlots.push(emptySlot); // Add slot to the array for tracking
        }

        // Setup drag and drop between puzzleArea and emptyArea
        setupDragAndDrop();
    };
    tempImg.src = imgData;
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Setup drag and drop
function setupDragAndDrop() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const puzzleArea = document.getElementById('puzzleArea');
    const emptyArea = document.getElementById('emptyArea');

    pieces.forEach(piece => {
        // Dragstart event
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = piece;
            draggedFromArea = piece.parentElement; // Remember which area the piece was dragged from
            piece.classList.add('dragging');
            e.dataTransfer.setData('text/plain', piece.dataset.currentIndex);
        });

        // Dragend event
        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
            draggedPiece = null;
            draggedFromArea = null;
        });
    });

    // Allow dropping on empty slots in emptyArea
    emptySlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedPiece && slot.classList.contains('empty-slot')) {
                // Replace empty slot with dragged puzzle piece
                const tempSlot = slot.cloneNode(true); // Clone the empty slot

                emptyArea.replaceChild(draggedPiece, slot);
                draggedPiece.classList.remove('empty-slot');
                draggedPiece.dataset.currentIndex = slot.dataset.index;

                // Add the empty slot back to the puzzle area (switch places)
                draggedFromArea.appendChild(tempSlot);
                setupDragAndDrop(); // Re-initialize drag and drop for new elements

                updatePuzzleState();
            }
        });
    });

    // Allow dropping back into puzzleArea
    puzzleArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    puzzleArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece && draggedPiece.parentElement === emptyArea) {
            const tempPiece = document.createElement('div');
            tempPiece.className = 'puzzle-piece empty-slot';
            tempPiece.style.backgroundColor = '#ccc';

            // Switch places between dragged piece and an empty slot
            puzzleArea.appendChild(draggedPiece);
            emptyArea.appendChild(tempPiece);
            
            setupDragAndDrop(); // Re-initialize drag and drop for new elements
            updatePuzzleState();
        }
    });
}

// Function to check the positions of all pieces
function updatePuzzleState() {
    const emptyArea = document.getElementById('emptyArea');
    const piecesInEmptyArea = emptyArea.querySelectorAll('.puzzle-piece');

    correctPositions = Array.from(piecesInEmptyArea).map(piece => {
        const originalIndex = parseInt(piece.dataset.originalIndex);
        const currentIndex = parseInt(piece.dataset.currentIndex);
        return originalIndex === currentIndex;
    });

    // If all pieces are correctly placed, notify the user
    if (correctPositions.length === 16 && correctPositions.every(pos => pos)) {
        console.log('Puzzle completed!');
        if (Notification.permission === 'granted') {
            new Notification('Gratulacje!', {
                body: 'Układanka została poprawnie ułożona!'
            });
        } else {
            alert('Gratulacje! Układanka została poprawnie ułożona!');
        }
    }
}

// Initialize puzzle state on page load
function initializePuzzle() {
    correctPositions = new Array(16).fill(false);
    requestPermissions();
}

// Initialize the game
initializePuzzle();
