import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Update with your actual socket server

function RaceManualInput() {
    const [driverPhoto, setDriverPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [driverName, setDriverName] = useState('');

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image (JPEG, PNG, or GIF)');
                return;
            }

            if (file.size > maxSize) {
                alert('Image size should be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Store the actual file for potential upload
            setDriverPhoto(file);
        }
    };

    const handlePhotoSubmit = (e) => {
        e.preventDefault();

        if (!driverPhoto) {
            alert('Please select an image to upload');
            return;
        }

        if (!driverName.trim()) {
            alert('Please enter driver name');
            return;
        }

        // Create FormData to send file
        const formData = new FormData();
        formData.append('driverPhoto', driverPhoto);
        formData.append('driverName', driverName);

        // Emit socket event to send photo and name to RaceEvent
        socket.emit('driver-photo-update', {
            photo: photoPreview,  // Base64 encoded image
            name: driverName
        });

        // Reset form
        setDriverPhoto(null);
        setPhotoPreview(null);
        setDriverName('');
        e.target.reset();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Driver Photo Upload</h2>
                
                <form onSubmit={handlePhotoSubmit} className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Driver Name</label>
                        <input 
                            type="text" 
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter driver name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Upload Driver Photo</label>
                        <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handlePhotoUpload}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {photoPreview && (
                        <div className="mb-4 flex flex-col items-center">
                            <img 
                                src={photoPreview} 
                                alt="Driver Preview" 
                                className="mt-2 w-64 h-64 object-cover rounded-lg shadow-md"
                            />
                            <p className="mt-2 text-sm text-gray-600">
                                {`${(driverPhoto.size / 1024).toFixed(2)} KB`}
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={!driverPhoto || !driverName}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                    >
                        Update Driver Photo
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RaceManualInput;