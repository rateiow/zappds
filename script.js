// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const captureArea = document.getElementById('captureArea');

// Header Inputs
const statusTimeInput = document.getElementById('statusTime');
const batteryLevelInput = document.getElementById('batteryLevel');
const carrierNameInput = document.getElementById('carrierName');
const signalStrengthInput = document.getElementById('signalStrength');
const contactNameInput = document.getElementById('contactName');
const contactStatusInput = document.getElementById('contactStatus');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const unreadCountInput = document.getElementById('unreadCountInput');

// Message Inputs
const msgContentInput = document.getElementById('msgContent');
const msgTimeInput = document.getElementById('msgTime');
const msgStatusInput = document.getElementById('msgStatus');
const msgImageDetail = document.getElementById('msgImageDetail');
const msgCaption = document.getElementById('msgCaption');
const audioDurationInput = document.getElementById('audioDuration');
const audioPlayedInput = document.getElementById('audioPlayed');

// Element Sections
const inputText = document.getElementById('input-text');
const inputImage = document.getElementById('input-image');
const inputAudio = document.getElementById('input-audio');

// Preview Elements
const previewTime = document.getElementById('previewTime');
const previewBattery = document.getElementById('previewBattery');
const previewSignalBars = [
    document.getElementById('sig1'),
    document.getElementById('sig2'),
    document.getElementById('sig3'),
    document.getElementById('sig4')
];
const previewCarrier = document.getElementById('iphone-header-operator-display'); // Note: I might need to add this ID to HTML if missing, checking logic below.
// Wait, I didn't add an ID for carrier in HTML, let me fix that logic by selecting via class or adding ID.
// Re-checking index.html: <span class="text-[12px] font-bold ml-1">4G</span> is hardcoded. I should target it.
// I'll grab it via relative path for now or update it.
// Let's use a more robust selector for carrier text.

const previewProfilePic = document.getElementById('previewProfilePic');
const previewName = document.getElementById('previewName');
const previewStatus = document.getElementById('previewStatus');
const unreadCountDisplay = document.getElementById('unreadCountDisplay');

// Templates
const tplSent = document.getElementById('tpl-msg-sent');
const tplReceived = document.getElementById('tpl-msg-received');
const tplImageSent = document.getElementById('tpl-msg-image-sent');
const tplImageReceived = document.getElementById('tpl-msg-image-received');
const tplAudioSent = document.getElementById('tpl-msg-audio-sent');
const tplAudioReceived = document.getElementById('tpl-msg-audio-received');

// State
let currentSender = 'read';
let activeSenderType = 'receiver';
let activeMsgType = 'text'; // text, image, audio

// --- Initialization ---
function init() {
    setupListeners();
    updateHeader();
}

function setupListeners() {
    // Header Live Updates
    statusTimeInput.addEventListener('input', () => { previewTime.textContent = statusTimeInput.value; });

    batteryLevelInput.addEventListener('input', () => {
        previewBattery.style.width = batteryLevelInput.value + '%';
        // Color Change for Low Battery
        if (batteryLevelInput.value <= 20) {
            previewBattery.classList.remove('bg-black');
            previewBattery.classList.add('bg-red-500');
        } else {
            previewBattery.classList.add('bg-black');
            previewBattery.classList.remove('bg-red-500');
        }
    });

    // Signal Strength Logic
    signalStrengthInput.addEventListener('input', updateSignal);

    contactNameInput.addEventListener('input', () => { previewName.textContent = contactNameInput.value; });
    contactStatusInput.addEventListener('input', () => { previewStatus.textContent = contactStatusInput.value; });

    // Unread Count Logic
    unreadCountInput.addEventListener('input', () => {
        unreadCountDisplay.textContent = unreadCountInput.value;
    });

    // Time Sync: When header time changes, update message time input
    statusTimeInput.addEventListener('input', () => {
        msgTimeInput.value = statusTimeInput.value;
    });

    // Profile Photo
    profilePhotoInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewProfilePic.src = e.target.result;
                document.getElementById('profilePreviewInput').src = e.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Carrier Update (Targeting the 4G text)
    // In HTML it was: <span class="text-[12px] font-bold ml-1">4G</span> 
    // I need to be careful. I'll search for it relative to previewTime parent.
    carrierNameInput.addEventListener('input', () => {
        const carrierEl = previewTime.nextElementSibling.querySelector('span');
        if (carrierEl) carrierEl.textContent = carrierNameInput.value;
    });
}

function updateSignal() {
    const val = parseInt(signalStrengthInput.value);
    previewSignalBars.forEach((bar, index) => {
        if (index < val) {
            bar.classList.remove('bg-gray-300');
            bar.classList.add('bg-black');
        } else {
            bar.classList.add('bg-gray-300');
            bar.classList.remove('bg-black');
        }
    });
}

function updateHeader() {
    // Initial run to sync inputs
    previewTime.textContent = statusTimeInput.value;
    updateSignal();
}

// --- Message Logic ---

window.setSender = function (type) {
    activeSenderType = type;
    const btnSender = document.getElementById('btnSender');
    const btnReceiver = document.getElementById('btnReceiver');

    if (type === 'sender') { // Green / Right
        btnSender.classList.add('bg-emerald-100', 'text-emerald-800', 'border-emerald-200');
        btnSender.classList.remove('text-gray-600', 'hover:bg-gray-100');

        btnReceiver.classList.remove('bg-emerald-100', 'text-emerald-800', 'border-emerald-200');
        btnReceiver.classList.add('text-gray-600', 'hover:bg-gray-100');
    } else { // White / Left
        btnReceiver.classList.add('bg-emerald-100', 'text-emerald-800', 'border-emerald-200');
        btnReceiver.classList.remove('text-gray-600', 'hover:bg-gray-100');

        btnSender.classList.remove('bg-emerald-100', 'text-emerald-800', 'border-emerald-200');
        btnSender.classList.add('text-gray-600', 'hover:bg-gray-100');
    }
}

// Toggle Message Inputs
window.toggleMsgInput = function () {
    const radios = document.getElementsByName('msgType');
    for (const r of radios) {
        if (r.checked) {
            activeMsgType = r.value;
            break;
        }
    }

    inputText.classList.add('hidden');
    inputImage.classList.add('hidden');
    inputAudio.classList.add('hidden');

    if (activeMsgType === 'text') inputText.classList.remove('hidden');
    if (activeMsgType === 'image') inputImage.classList.remove('hidden');
    if (activeMsgType === 'audio') inputAudio.classList.remove('hidden');
}

window.addMessage = function () {
    const time = msgTimeInput.value;
    const status = msgStatusInput.value;

    let clone;

    // --- TEXT MESSAGE ---
    if (activeMsgType === 'text') {
        const text = msgContentInput.value;
        if (!text) return;

        if (activeSenderType === 'sender') {
            clone = tplSent.content.cloneNode(true);
            clone.querySelector('.bg-[#DCF8C5]').classList.add('tail-sent'); // Add tail class
            // Handle Ticks... (Logic below)
        } else {
            clone = tplReceived.content.cloneNode(true);
        }
        clone.querySelector('.msg-text').textContent = text;
        clone.querySelector('.msg-time').textContent = time;
    }

    // --- IMAGE MESSAGE ---
    else if (activeMsgType === 'image') {
        if (msgImageDetail.files && msgImageDetail.files[0]) {
            if (activeSenderType === 'sender') {
                clone = tplImageSent.content.cloneNode(true);
            } else {
                clone = tplImageReceived.content.cloneNode(true);
            }

            const imgEl = clone.querySelector('.msg-image');
            const reader = new FileReader();
            reader.onload = function (e) {
                imgEl.src = e.target.result;
            };
            reader.readAsDataURL(msgImageDetail.files[0]);

            const caption = msgCaption.value;
            if (caption) {
                const capEl = clone.querySelector('.msg-caption');
                capEl.textContent = caption;
                capEl.classList.remove('hidden');
            }
            clone.querySelector('.msg-time').textContent = time;
        } else {
            alert("Selecione uma imagem!");
            return;
        }
    }

    // --- AUDIO MESSAGE ---
    else if (activeMsgType === 'audio') {
        if (activeSenderType === 'sender') {
            clone = tplAudioSent.content.cloneNode(true);
        } else {
            clone = tplAudioReceived.content.cloneNode(true);
            // Ensure profile pic is set for received audio if needed
            const profileUrl = document.getElementById('previewProfilePic').src;
            if (clone.querySelector('.audio-profile')) {
                clone.querySelector('.audio-profile').src = profileUrl;
            }
        }
        clone.querySelector('.audio-duration').textContent = audioDurationInput.value;
        clone.querySelector('.msg-time').textContent = time;
    }

    // --- COMMON: TICKS LOGIC (ONLY FOR SENT MESSAGES) ---
    if (activeSenderType === 'sender') {
        const statusContainer = clone.querySelector('.msg-status');
        if (statusContainer) {
            let iconSvg = '';
            if (status === 'none') {
                statusContainer.innerHTML = '';
            } else if (status === 'sent') {
                // 1 Tick Gray
                iconSvg = `<svg class="w-[14px] h-[14px] text-gray-500" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3 6.4L15.3 2.4C15.7 2 15.7 1.4 15.3 1L14.6 0.3C14.2 -0.1 13.6 -0.1 13.2 0.3L9.6 3.9C9.4 4.1 9.3 4.4 9.4 4.7C9.2 4.6 8.9 4.6 8.7 4.8L8.6 4.9C8.2 5.3 8.2 5.9 8.6 6.3L11.3 9L11.3 6.4Z" fill="currentColor"/></svg>`;
            } else if (status === 'delivered') {
                // 2 Ticks Gray
                iconSvg = `<svg class="w-[14px] h-[14px] text-gray-500" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3 6.4L15.3 2.4C15.7 2 15.7 1.4 15.3 1L14.6 0.3C14.2 -0.1 13.6 -0.1 13.2 0.3L9.6 3.9C9.4 4.1 9.3 4.4 9.4 4.7C9.2 4.6 8.9 4.6 8.7 4.8L8.6 4.9C8.2 5.3 8.2 5.9 8.6 6.3L11.3 9L11.3 6.4Z" fill="currentColor"/><path d="M4.6 6.4L8.6 2.4C9 2 9 1.4 8.6 1L7.9 0.3C7.5 -0.1 6.9 -0.1 6.5 0.3L0.9 5.9C0.5 6.3 0.5 6.9 0.9 7.3L3.6 10C4 10.4 4.6 10.4 5 10L5.7 9.3C6.1 8.9 6.1 8.3 5.7 7.9L4.6 6.8V6.4Z" fill="currentColor"/></svg>`;
            } else if (status === 'read') {
                // 2 Ticks Blue
                iconSvg = `<svg class="w-[14px] h-[14px] text-[#34B7F1]" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3 6.4L15.3 2.4C15.7 2 15.7 1.4 15.3 1L14.6 0.3C14.2 -0.1 13.6 -0.1 13.2 0.3L9.6 3.9C9.4 4.1 9.3 4.4 9.4 4.7C9.2 4.6 8.9 4.6 8.7 4.8L8.6 4.9C8.2 5.3 8.2 5.9 8.6 6.3L11.3 9L11.3 6.4Z" fill="currentColor"/><path d="M4.6 6.4L8.6 2.4C9 2 9 1.4 8.6 1L7.9 0.3C7.5 -0.1 6.9 -0.1 6.5 0.3L0.9 5.9C0.5 6.3 0.5 6.9 0.9 7.3L3.6 10C4 10.4 4.6 10.4 5 10L5.7 9.3C6.1 8.9 6.1 8.3 5.7 7.9L4.6 6.8V6.4Z" fill="currentColor"/></svg>`;
            }

            // If audio played is checked (for audio msg only), blue microphone
            if (activeMsgType === 'audio') {
                const played = document.getElementById('audioPlayed').checked;
                const micIcon = clone.querySelector('.ph-microphone');
                if (played && micIcon) {
                    micIcon.classList.remove('text-[#57943F]'); // green
                    micIcon.classList.add('text-[#34B7F1]'); // blue
                }
            }
            statusContainer.innerHTML = iconSvg;
        }
    }

    // Add Delete Logic
    const msgContainer = clone.querySelector('.group');
    const deleteBtn = clone.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            msgContainer.remove();
        });
    }

    chatContainer.appendChild(clone);

    // Auto Scroll
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Reset Input
    if (activeMsgType === 'text') {
        msgContentInput.value = '';
        msgContentInput.focus();
    } else if (activeMsgType === 'image') {
        msgCaption.value = '';
        msgImageDetail.value = ''; // reset file input
    }
}

// Download Logic
window.downloadImage = function () {
    if (document.activeElement) document.activeElement.blur();
    chatContainer.style.overflow = 'hidden';

    // Ensure full width for truncate elements during capture
    const truncateElements = document.querySelectorAll('.truncate');
    truncateElements.forEach(el => el.classList.remove('truncate'));

    html2canvas(captureArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // Transparent to pick up CSS bg
        // If background image is still an issue, we can force a solid color or inject base64
    }).then(canvas => {
        // Restore truncate
        truncateElements.forEach(el => el.classList.add('truncate'));
        chatContainer.style.overflow = 'auto';

        const link = document.createElement('a');
        link.download = 'whatsapp-fake-chat.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Start
init();
