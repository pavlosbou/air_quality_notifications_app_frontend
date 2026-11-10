import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import  MarkerClusterGroup  from 'react-leaflet-cluster';

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

const AllCities : React.FC = () => {
    const position: LatLngExpression = [51.505, -0.09]; // Example position (London)
    const [cities, setCities] = useState<City[]>([]);
    const [load, setLoad] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    
    useEffect(() => {
        const fetchAllCities = async () => {
            try {
                const response = await fetch(`${apiUrl}/getAllData`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
            },
            });
    
            const result = await response.json();

            const uniqueCities = result.filter((city: City, index: number, self: City[]) =>
                index === self.findIndex((c) => c.name === city.name)
            );

            setCities(uniqueCities);
            setLoad(false);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
    
        fetchAllCities(); // Fetch the cities when the component mounts
    }, []);

    // console.log(cities);

    if (load) {
        return (
            <div className="loading-container">
                <span className="loader"></span>
            </div>
        );
    }
            
    return (
        <div>
            {/* MapContainer with center and zoom props */}
            <MapContainer
                center={position}
                zoom={4}
                style={{ height: '1000px', width: '100%' }}
                attributionControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Example Marker */}
                {/* <Marker position={position}> */}
                {/* <MarkerClusterGroup> */}
                {cities.map((city, index) => {
                    const markerIcon = city.iconColor ? getColoredIcon(city.iconColor) : getColoredIcon('black');
                    // console.log('City', city.name);
                    return(                    
                            <Marker key={index}  position={[city.lat,city.lon]} icon={markerIcon}>
                                <Popup>
                                    <strong>{city.name}</strong><br />
                                    {/* CO: {city.co}<br /> */}
                                    {/* NO2: {city.no2}<br /> */}
                                    {/* O3: {city.o3}<br /> */}
                                    PM10: {city.pm10}<br />
                                    PM2.5: {city.pm2_5}<br />
                                    SO2: {city.so2}<br />
                                    Wind Speed: {city.wind_speed}<br />
                                    {/* Last Updated: {city.time} */}
                                    Warning : {city.state}
                                </Popup>
                            </Marker>
                        
                    )})}
                {/* </MarkerClusterGroup> */}
                {/* </Marker> */}
            </MapContainer>
        </div>

    );

};

export default AllCities