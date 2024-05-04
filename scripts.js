const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let texts = [];
let undoStack = [];
let redoStack = [];
let dragging = false;
let selectedTextIndex = -1;
let offsetX, offsetY;
let debounceTimer;

function drawTexts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    texts.forEach((t, index) => {
        ctx.font = `${t.size} ${t.font}`;
        ctx.fillStyle = t.color;
        ctx.fillText(t.content, t.x, t.y);
        if (index === selectedTextIndex) {
            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x - 5, t.y - parseInt(t.size, 10) - 5, ctx.measureText(t.content).width + 10, parseInt(t.size, 10) + 10);
        }
    });
}

function updateEditorWithSelectedText(text) {
    if (text && Object.keys(text).length !== 0) {
        document.getElementById('text-input').value = text.content;
        document.getElementById('font-select').value = text.font;
        document.getElementById('size-input').value = parseInt(text.size, 10);
        document.getElementById('color-input').value = text.color;
    } else {
        // If no text is selected, clear the editor input fields
        document.getElementById('text-input').value = '';
        document.getElementById('font-select').value = '';
        document.getElementById('size-input').value = '';
        document.getElementById('color-input').value = '';
    }
}

function handleMouseDown(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    let textClicked = false;

    for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        if (
            mouseX > text.x &&
            mouseX < text.x + ctx.measureText(text.content).width &&
            mouseY > text.y - parseInt(text.size, 10) &&
            mouseY < text.y
        ) {
            selectedTextIndex = i;
            offsetX = mouseX - text.x;
            offsetY = mouseY - text.y;
            dragging = true;

            // Add "dragging" class to the canvas
            canvas.classList.add('dragging');

            drawTexts();
            textClicked = true;
            break;
        }
    }

    if (!textClicked) {
        selectedTextIndex = -1;
        drawTexts();
    }

    // Reflect the selected text properties in the editor
    updateEditorWithSelectedText(selectedTextIndex !== -1 ? texts[selectedTextIndex] : {});
}

function addText() {
    const newText = {
        content: 'New Text',
        x: Math.random() * (canvas.width - 100),
        y: Math.random() * (canvas.height - 20) + 20,
        font: 'Arial',
        size: '16px',
        color: '#000000',
    };
    texts.push({ ...newText });
    updateUndoredoStacks();
    selectedTextIndex = texts.length - 1;

    drawTexts();
    updateEditorWithSelectedText(newText);
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        texts = JSON.parse(undoStack[undoStack.length - 1]);
        drawTexts();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(texts));
        texts = JSON.parse(redoStack.pop());
        drawTexts();
    }
}

function updateTextEditor() {
    if (selectedTextIndex !== -1) {
        texts[selectedTextIndex].content = document.getElementById('text-input').value;
        texts[selectedTextIndex].font = document.getElementById('font-select').value;
        texts[selectedTextIndex].size = document.getElementById('size-input').value + 'px';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            texts[selectedTextIndex].color = document.getElementById('color-input').value;
            updateUndoredoStacks();
            drawTexts();
        }, 60); // Adjust the debounce time as needed
    }
}

function updateUndoredoStacks() {
    const currentState = JSON.stringify(texts);
    undoStack.push(currentState);
    redoStack = []; // Clear redo stack when a new change is made
}

document.getElementById('text-input').addEventListener('input', updateTextEditor);
document.getElementById('font-select').addEventListener('input', updateTextEditor);
document.getElementById('size-input').addEventListener('input', updateTextEditor);
document.getElementById('color-input').addEventListener('input', updateTextEditor);

document.getElementById('add-text-btn').addEventListener('click', addText);
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

canvas.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', (e) => {
    if (dragging && selectedTextIndex !== -1) {
        texts[selectedTextIndex].x = e.clientX - offsetX - canvas.getBoundingClientRect().left;
        texts[selectedTextIndex].y = e.clientY - offsetY - canvas.getBoundingClientRect().top;
        drawTexts();
    }
});

document.addEventListener('mouseup', () => {
    dragging = false;

    // Remove "dragging" class from the canvas
    canvas.classList.remove('dragging');
});

// Add initial text when the page loads
addText();