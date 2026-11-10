import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';

interface City {
    name: string;
    co: number;
    iconColor: string;
    lat: number;
    lon: number;
    no2: number;
    o3: number;
    pm10: number;
    pm2_5: number;
    so2: number;
    state: string;
    time: string;
    wind_speed: number;
}

const getColoredIcon = (color: string) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        iconSize: [25, 41],   // Size of the marker
        iconAnchor: [12, 41], // The anchor for the icon (its base)
        popupAnchor: [1, -34], // Where the popup should appear relative to the marker
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
        shadowSize: [41, 41],      
    });
};

const SpecificCity : React.FC = () => {
    // const position: LatLngExpression = [51.505, -0.09]; // Example position (London)
    const { city } = useParams<{ city: string }>();
    const [message, setMessage] = useState<string | null>(null);
    const [cityData, setCityData] = useState<City |null >(null);
    const [center, setCenter] = useState<LatLngExpression | null>(null); // Initial position (example: London)
    const [ld, setLd] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        if (city) {
            const response = await fetch(`${apiUrl}/get-data/${city}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
            console.log(data); // Handle the fetched data here
            setMessage(data.name);
            setCityData(data);
            
        }
    };
    
    useEffect(() => {
        fetchData(); // Call the API when the component mounts or the city changes
    }, [city]);
    
    useEffect(() => {
        if (cityData) {
            setCenter([cityData.lat, cityData.lon]);
            setLd(false);
        }
    }, [cityData]);

    if (ld) {
        return (
            <div className="loading-container">
                <span className="loader"></span>
            </div>
        );
    }

    return(
        <div>
        {center && ( // Only render MapContainer if center is set
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '1000px', width: '100%' }}
                attributionControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cityData && (
                    <Marker
                        position={[cityData.lat, cityData.lon]}
                        icon={cityData.iconColor ? getColoredIcon(cityData.iconColor) : getColoredIcon('black')}
                    >
                        <Popup>
                            <strong>{cityData.name}</strong><br />
                            PM10: {cityData.pm10}<br />
                            PM2.5: {cityData.pm2_5}<br />
                            SO2: {cityData.so2}<br />
                            Wind Speed: {cityData.wind_speed}<br />
                            Warning: {cityData.state}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        )}
    </div>
    );

};

export default SpecificCity;