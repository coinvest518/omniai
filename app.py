from flask import Flask, request, jsonify
import yt_dlp
import whisper

app = Flask(__name__)

@app.route('/download', methods=['POST'])
def download():
    video_url = request.json.get('url')
    if not video_url:
        return jsonify({'error': 'URL is required'}), 400

    ydl_opts = {'outtmpl': '%(title)s.%(ext)s'}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        return jsonify({'message': 'Video downloaded successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to download video', 'details': str(e)}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file_path = request.json.get('file_path')
    if not file_path:
        return jsonify({'error': 'File path is required'}), 400

    model = whisper.load_model("base")
    try:
        result = model.transcribe(file_path)
        return jsonify({'transcription': result['text']}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to transcribe video', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
