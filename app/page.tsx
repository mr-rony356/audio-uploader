'use client';
import { useState, ChangeEvent, FormEvent } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadLink, setUploadLink] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const content = reader.result?.toString().split(',')[1];

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          content: content
        })
      });

      const result = await response.json();
      if (response.ok) {
        setUploadLink(result.link);
        setUploadDate(new Date().toLocaleString());
      } else {
        alert('File upload failed: ' + result.message);
      }
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-200  flex items-center justify-center p-4">
      <div className="bg-white p-16 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Upload Audio File</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-base text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-red-500 text-white font-semibold py-2 rounded-lg hover:bg-gradient-to-l transition-colors text-lg"
            disabled={loading} 
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {uploadLink && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg text-green-700">
            <p className="mb-2">File uploaded successfully!</p>
            <audio controls src={uploadLink} className="w-full mb-2">
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm">Uploaded on: {uploadDate}</p>
            <a href={uploadLink} className="text-blue-500 underline mt-2 block">View file</a>
            <a href={'https://github.com/mr-rony356/Eric-Audio-button'} className="text-blue-500 underline mt-2 block">Check repo</a>
          </div>
        )}
      </div>
    </div>
  );
}
