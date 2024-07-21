document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    const wheelRadius = Math.min(canvas.width, canvas.height) / 2 - 20; // Ajustamos el radio para evitar cortes
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pointerSize = 20;

    const prizes = [
        "LABIAL YSL",
        "POUCH YSL",
        "PARTICIPA DE NUEVO",
        "ESPEJO YSL",
        "RETOQUE DE MAKE UP",
        "PARTICIPA DE NUEVO",
        "LABIAL YSL",
        "POUCH YSL",
        "PARTICIPA DE NUEVO",
        "ESPEJO YSL",
        "RETOQUE DE MAKE UP",
        "PARTICIPA DE NUEVO"
    ];

    const fullMessages = [
        "¡Felicidades! ¡Ganaste un LABIAL YSL!",
        "¡Felicidades! ¡Ganaste un POUCH YSL!",
        "Inscríbete y participa de nuevo",
        "¡Felicidades! ¡Ganaste un ESPEJO YSL!",
        "¡Felicidades! ¡Ganaste un RETOQUE DE MAKE UP!",
        "Inscríbete y participa de nuevo",
        "¡Felicidades! ¡Ganaste un LABIAL YSL!",
        "¡Felicidades! ¡Ganaste un POUCH YSL!",
        "Inscríbete y participa de nuevo",
        "¡Felicidades! ¡Ganaste un ESPEJO YSL!",
        "¡Felicidades! ¡Ganaste un RETOQUE DE MAKE UP!",
        "Inscríbete y participa de nuevo"
    ];

    let winningIndex = -1;

    const logo = new Image();
    logo.src = 'ysl.jpg'; // Asegúrate de proporcionar la ruta correcta a la imagen del logo

    logo.onload = function() {
        drawWheel(0);
    }

    function drawWheel(angle) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

        const numSegments = prizes.length;
        const angleStep = (2 * Math.PI) / numSegments;

        prizes.forEach((prize, index) => {
            const startAngle = index * angleStep;
            const endAngle = startAngle + angleStep;
            const color = index === winningIndex ? (index % 2 === 0 ? '#505050' : '#FFD700') : (index % 2 === 0 ? '#000' : '#D4AF37');

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle, false);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + angleStep / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = '18px Arial';
            ctx.fillText(prize, wheelRadius - 10, 10);
            ctx.restore();
        });

        ctx.restore();

        // Draw logo without rotation
        drawLogo();

        // Draw pointer
        drawPointer();
    }

    function drawLogo() {
        const logoRadius = wheelRadius / 4;
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logo, centerX - logoRadius, centerY - logoRadius, 2 * logoRadius, 2 * logoRadius);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    function drawPointer() {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - pointerSize, 0);
        ctx.lineTo(centerX + pointerSize, 0);
        ctx.lineTo(centerX, pointerSize * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    let isSpinning = false;
    let currentAngle = 0;
    let spinTime = 0;
    let spinTimeTotal = 0;

    spinButton.addEventListener('click', function() {
        if (!isSpinning) {
            isSpinning = true;
            spinTime = 0;
            spinTimeTotal = Math.random() * 3000 + 6000; // Increased random spin duration
            winningIndex = -1; // Reset winning index
            rotateWheel();
        }
    });

    function rotateWheel() {
        spinTime += 30;
        const spinAngle = easeOutQuart(spinTime, 0, 2 * Math.PI, spinTimeTotal);
        currentAngle += spinAngle;
        drawWheel(currentAngle);

        if (spinTime < spinTimeTotal) {
            requestAnimationFrame(rotateWheel);
        } else {
            stopRotateWheel();
        }
    }

    function stopRotateWheel() {
        isSpinning = false;
        const segmentAngle = 2 * Math.PI / prizes.length;
        const rotationOffset = Math.PI / 2;
        const totalAngle = (currentAngle + rotationOffset) % (2 * Math.PI);
        winningIndex = Math.floor((2 * Math.PI - totalAngle) / segmentAngle) % prizes.length;
        drawWheel(currentAngle); // Redraw the wheel to highlight the winning segment
        showPopup(fullMessages[winningIndex]);
        if (prizes[winningIndex].indexOf("PARTICIPA DE NUEVO") === -1) {
            startConfetti();
        }
    }

    function easeOutQuart(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }

    // Popup functions
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const closePopup = document.querySelector('.close');

    function showPopup(message) {
        popupMessage.textContent = message;
        popup.style.display = 'block';
    }

    closePopup.onclick = function() {
        popup.style.display = 'none';
        stopConfetti();
    }

    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = 'none';
            stopConfetti();
        }
    }

    // Draw the wheel initially
    drawWheel(0);

    // Confetti functions
    let confettiElements = [];
    let confettiAnimationFrame;

    function startConfetti() {
        confettiElements = [];
        for (let i = 0; i < 300; i++) { // Increased number of confetti elements
            confettiElements.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                r: Math.random() * 4 + 1,
                d: Math.random() * confettiCanvas.height,
                color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                tilt: Math.random() * 10 - 10,
            });
        }
        confettiAnimationFrame = requestAnimationFrame(updateConfetti);
    }

    function updateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiElements.forEach((confetti, index) => {
            confetti.y += Math.cos(confetti.d) + 1 + confetti.r / 2;
            confetti.x += Math.sin(confetti.d);
            if (confetti.y > confettiCanvas.height) {
                confettiElements[index] = {
                    x: Math.random() * confettiCanvas.width,
                    y: -10,
                    r: confetti.r,
                    d: confetti.d,
                    color: confetti.color,
                    tilt: confetti.tilt
                };
            }
            confettiCtx.beginPath();
            confettiCtx.lineWidth = confetti.r;
            confettiCtx.strokeStyle = confetti.color;
            confettiCtx.moveTo(confetti.x + confetti.tilt + confetti.r, confetti.y);
            confettiCtx.lineTo(confetti.x + confetti.tilt, confetti.y + confetti.tilt + confetti.r);
            confettiCtx.stroke();
        });
        confettiAnimationFrame = requestAnimationFrame(updateConfetti);
    }

    function stopConfetti() {
        cancelAnimationFrame(confettiAnimationFrame);
        confettiElements = [];
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
});
