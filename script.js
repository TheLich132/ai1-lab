// Initialize map
const map = L.map('map').setView([52.237049, 21.017532], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;
let puzzlePieces = [];
let correctPositions = new Array(16).fill(false);
let draggedPiece = null;

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
document.getElementById('downloadBtn').addEventListener('click', () => {
    leafletImage(map, function (err, canvas) {
        if (err) {
            console.error('Error capturing map:', err);
            return;
        }
        const imgData = canvas.toDataURL('image/png');
        createPuzzle(imgData);
    });
});

// Create puzzle from map image
function createPuzzle(imgData) {
    const puzzleArea = document.getElementById('puzzleArea');
    puzzleArea.innerHTML = '';
    puzzlePieces = [];
    correctPositions = new Array(16).fill(false);

    // Create temporary image to get dimensions
    const tempImg = new Image();
    tempImg.onload = function () {
        // Create puzzle pieces
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

        // Shuffle and add pieces
        shuffleArray(puzzlePieces);
        puzzlePieces.forEach((piece, index) => {
            piece.dataset.currentIndex = index;
            puzzleArea.appendChild(piece);
        });

        // Setup drag and drop
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

    pieces.forEach(piece => {
        // Dragstart event
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = piece;
            piece.classList.add('dragging');
            e.dataTransfer.setData('text/plain', piece.dataset.currentIndex);
        });

        // Dragend event
        piece.addEventListener('dragend', (e) => {
            piece.classList.remove('dragging');
            draggedPiece = null;
            pieces.forEach(p => p.classList.remove('dragover'));
        });

        // Dragenter event
        piece.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (piece !== draggedPiece) {
                piece.classList.add('dragover');
            }
        });

        // Dragleave event
        piece.addEventListener('dragleave', (e) => {
            piece.classList.remove('dragover');
        });

        // Dragover event
        piece.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // Drop event
        piece.addEventListener('drop', (e) => {
            e.preventDefault();
            piece.classList.remove('dragover');

            if (draggedPiece && piece !== draggedPiece) {
                const fromIndex = parseInt(draggedPiece.dataset.currentIndex);
                const toIndex = parseInt(piece.dataset.currentIndex);

                // Swap the pieces in the DOM
                const parent = piece.parentNode;
                const placeholder = document.createElement('div');
                parent.insertBefore(placeholder, draggedPiece);
                parent.insertBefore(draggedPiece, piece);
                parent.insertBefore(piece, placeholder);
                parent.removeChild(placeholder);

                // Update current indices after swapping
                draggedPiece.dataset.currentIndex = toIndex;
                piece.dataset.currentIndex = fromIndex;

                // Check if the puzzle is completed
                updatePuzzleState();
            }
        });
    });
}

// Function to check the positions of all pieces
function updatePuzzleState() {
    correctPositions = puzzlePieces.map(piece => {
        const originalIndex = parseInt(piece.dataset.originalIndex);
        const currentIndex = parseInt(piece.dataset.currentIndex);
        return originalIndex === currentIndex;
    });

    // If all pieces are correctly placed, notify the user
    if (correctPositions.every(pos => pos)) {
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

// Check if a specific piece is in the correct position (optional)
function checkPosition(index) {
    const piece = document.querySelector(`.puzzle-piece[data-current-index="${index}"]`);
    if (!piece) return;

    const originalIndex = parseInt(piece.dataset.originalIndex);
    const currentIndex = parseInt(piece.dataset.currentIndex);

    correctPositions[currentIndex] = (originalIndex === currentIndex);
}

// Initialize puzzle state on page load
function initializePuzzle() {
    correctPositions = new Array(16).fill(false);
    requestPermissions();
}

// Initialize the game
initializePuzzle();