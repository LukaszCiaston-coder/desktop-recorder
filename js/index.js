window.addEventListener('DOMContentLoaded', function () {
    let mediaRecorder;
    let stream; // Referencja do strumienia mediów
    const chunks = [];
    let startTime;
    const maxRecordingTime = 120 * 60 * 1000; // 120 minut (w milisekundach)
    let selectedFormat = 'video/mp4';

    function startRecording() {
        // Sprawdź, czy nagrywanie jest już aktywne
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            stopRecording(); // Zatrzymaj poprzednie nagrywanie
            return;
        }

        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(function (streamObj) {
                stream = streamObj; // Zapisz referencję do strumienia mediów
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.addEventListener('dataavailable', function (event) {
                    chunks.push(event.data);
                });

                mediaRecorder.start();
                startTime = Date.now();

                // Automatyczne zatrzymywanie po osiągnięciu maksymalnego czasu nagrywania
                setTimeout(stopRecording, maxRecordingTime);
            })
            .catch(function (error) {
                console.error('Błąd:', error);
            });
    }

    function stopRecording() {
        if (!mediaRecorder || mediaRecorder.state !== 'recording') {
            return;
        }

        mediaRecorder.stop();
        mediaRecorder.addEventListener('stop', function () {
            const blob = new Blob(chunks, { type: selectedFormat });

            const fileName = document.getElementById('fileNameInput').value;
            const downloadLink = document.getElementById('downloadLink');
            if (downloadLink) {
                downloadLink.parentNode.removeChild(downloadLink);
            }

            const newDownloadLink = document.createElement('a');
            newDownloadLink.id = 'downloadLink';
            newDownloadLink.href = URL.createObjectURL(blob);
            newDownloadLink.download = fileName || 'screen_capture.' + selectedFormat.split('/')[1];
            newDownloadLink.innerText = 'Pobierz video';
            document.body.appendChild(newDownloadLink);

            const previewVideo = document.getElementById('previewVideo');
            previewVideo.src = URL.createObjectURL(blob);
            previewVideo.style.display = 'block';

            // Wyczyść zapisane dane
            chunks.length = 0;

            // Zatrzymaj udostępnianie
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        });
    }

    document.getElementById('startButton').addEventListener('click', function () {
        startRecording();
    });

    document.getElementById('stopButton').addEventListener('click', function () {
        stopRecording();
    });

    document.getElementById('formatSelect').addEventListener('change', function (event) {
        selectedFormat = event.target.value;
    });
});
