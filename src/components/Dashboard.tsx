// src/pages/Dashboard.tsx (or src/components/Dashboard.tsx)
import React, { useContext, useEffect, useRef, useState } from 'react';
import Logout from './Logout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Select, { MultiValue, ActionMeta } from 'react-select';
import axios from 'axios';
import { ImCheckmark } from "react-icons/im";
import { FiAlertTriangle } from "react-icons/fi";
import { FiXOctagon } from "react-icons/fi";
import { WiDust, WiStrongWind } from "react-icons/wi";
import { FaSmog } from "react-icons/fa";
import { MdOutlineAir } from "react-icons/md";
import { getFcmToken, onMessageListener } from '../firebaseMessaging';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css'
import "./dashboardComponents/loading-container.css"
import { AuthContext } from '../context/AuthContext';



const cities = [
  "Tirana", "Andorra la Vella", "Yerevan", "Vienna", "Baku", "Minsk", "Brussels", "Sarajevo", "Sofia", "Zagreb",
  "Nicosia", "Prague", "Copenhagen", "Tallinn", "Helsinki", "Paris", "Tbilisi", "Berlin", "Athens", "Budapest",
  "Reykjavik", "Dublin", "Rome", "Astana", "Pristina", "Riga", "Vaduz", "Vilnius", "Luxembourg", "Skopje", "Valletta",
  "Chisinau", "Monaco", "Podgorica", "Amsterdam", "Oslo", "Warsaw", "Lisbon", "Bucharest", "Moscow", "San Marino",
  "Belgrade", "Bratislava", "Ljubljana", "Madrid", "Stockholm", "Bern", "Ankara", "Kyiv", "London", "Vatican City"
];

const sortedCities = cities.sort();
const cityOptions = sortedCities.map(city => ({ value: city, label: city }));

interface OptionType {
  value: string;
  label: string;
}

type IconColor = 'green' | 'yellow' | 'red';


const Dashboard: React.FC = () => {


  const {username, setUsername} = useContext(AuthContext);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  // const [storedNotifications,setStoredNotifications] = useState<any[]>([]);
  const [notifications,setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<any>(null);

  const [isTokenFetched, setIsTokenFetched] = useState(false); // New state variable
  const isInitialMount = useRef(true);
  const [loader, setLoader] = useState(true);
  const [key, setKey] = useState(0);
  const [notHad, setNotHad] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  

  useEffect(() => {
    const notificationsWithTimestamps = [];
    const storedNotifications = sessionStorage.getItem('notifications');
    console.log("Retrieved notifications from localStorage:", storedNotifications);
    if (storedNotifications) {
      console.log('stored notifications:',storedNotifications);

      const parsedNotifications = JSON.parse(storedNotifications);
      console.log('parsed notifications:', parsedNotifications);
      for(const no in parsedNotifications){
        
        if(parsedNotifications[no].timestamp){
          notificationsWithTimestamps.push(parsedNotifications[no]);
        }
      }
      
      notificationsWithTimestamps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotifications(notificationsWithTimestamps);
    } else {
      console.log('no stored');
      setNotifications([]); // Set to an empty array if nothing is in localStorage
    }
  }, []);

  
  useEffect(() => {
    const storedSubscriptions = sessionStorage.getItem('subscriptions');
    console.log("Retrieved subscriptions from localStorage:", storedSubscriptions);
    if (storedSubscriptions) {
      console.log('stored:',storedSubscriptions);
      
      const parsedSubscriptions = JSON.parse(storedSubscriptions);
      console.log('stored:', parsedSubscriptions);
      setSubscriptions(parsedSubscriptions);
    } else {
      console.log('no stored');
      setSubscriptions([]); // Set to an empty array if nothing is in localStorage
    }
  }, []);

   // Update localStorage whenever subscriptions state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark as loaded
    } else {
      console.log("Saving subscriptions to localStorage:", subscriptions);
      sessionStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      console.log("before if notifications", notifications);
      if(notifications.length > 0){
        console.log("Saving notifications to local storage:", notifications);
        sessionStorage.setItem('notifications', JSON.stringify(notifications));
      }
    }
  }, [subscriptions, notifications]); 
  

  useEffect(() => {
    if(notifications.length != 0){
      setLoader(false);
    };
  }, [subscriptions, notifications]);


  const handleChange = (
    selectedOptions: MultiValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    if (selectedOptions) {
      // Extract city names (values) from selected options
      const selectedValues = selectedOptions.map(option => option.value);
      setSelectedCities(selectedValues); // Update the selected cities
      setKey((prevKey) => prevKey + 1);
    } else {
      setSelectedCities([]); // Clear the selection if nothing is selected
    }
  };
  
  
  const goToAllCities = () => {
      navigate('/dashboard/allCities');
  };

  const seeStatistics = () => {
    navigate('/dashboard/statistics');
  };
  
  
  useEffect(() => {
    const mountPreviousNotifications = async () => {
      const notificationsOnMount: any[] = [];
      let sortedNotificationsOnMount: any[] = [];
      console.log("not had", notHad);
      console.log("username in mount", username);
      if(notHad){
        try {
            const response = await fetch(`${apiUrl}/mountPreviousNotifications`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'username': String(username) ,
              },
              // body: JSON.stringify({ username: localStorage.getItem('username') }),
        });

        const result = await response.json();
  
        console.log("result", result);
        if(Array.isArray(result)){
          for(var p in result){
            for(var entry in result[p]){
              for(var city in result[p][entry]){
                if(result[p][entry][city].timestamp){
                  notificationsOnMount.push(result[p][entry][city]);
                }
              }
            }
            
          }
        }
        console.log("on mount", notificationsOnMount);
        sortedNotificationsOnMount = notificationsOnMount.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setNotifications(sortedNotificationsOnMount);

  
        } catch (error) {
            console.error('Error while fetching previous notifications', error);
         // Set loading to false even if there is an error
        }
        };
      };
    mountPreviousNotifications(); // Fetch the cities when the component mounts
  }, []);


  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#f8f9fa', // Change background color
      borderColor: '#ced4da', // Change border color
      boxShadow: 'none',
      width: '100%',
      padding: '14px 16px',
      '&:hover': {
        borderColor: '#80bdff', // Change border color on hover
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : null, // Change background color based on selection and hover
      color: state.isSelected ? 'white' : 'black', // Change text color
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown appears above other elements
    }),
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username: username, // Replace with actual username
      subscribedCities: selectedCities, // Selected cities
    };

    try {
      const response = await fetch(`${apiUrl}/subscribedToCities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const notifToBe: any[] =  [];
      const result = await response.json();

      if (result.success) {
        console.log('Subscription data sent successfully');
        // setSubscriptions(payload.subscribedCities);
        setSubscriptions(prev => {
          const combinedCities = [...new Set([...prev, ...selectedCities])];
          return combinedCities;
        });

        sessionStorage.setItem('subscriptions',JSON.stringify(subscriptions));

        const notificationsOnSubscribe: any[] = [];
        let sortedNotificationsOnSubscribe: any[] = [];

        try {
          const reply = await fetch(`${apiUrl}/mountPreviousNotifications`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'username': String(payload.username),
            },
          
          });

          const result_ = await reply.json();
          
          console.log("result", result_);
          if(Array.isArray(result_)){
            for(var p in result_){
              for(var entry in result_[p]){
                for(var city in result_[p][entry]){
                  if(result_[p][entry][city].timestamp){
                    notificationsOnSubscribe.push(result_[p][entry][city]);
                  }
                }
              }
              
            }
          }
          
          sortedNotificationsOnSubscribe = notificationsOnSubscribe.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setNotifications(sortedNotificationsOnSubscribe);

        
        } catch (error) {
            console.error('Error while fetching previous notifications', error);
        // Set loading to false even if there is an error
        }

        // setNotifications(result.data);
      } else {
        console.error('Failed to send subscription data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const handleUnsubscribe = async (cityName: string) => {
    try {

      console.log(cityName);
        // Send the unsubscription request to the backend
        const response = await fetch(`${apiUrl}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, cityName }),
        });

        if (response.ok) {
            // If unsubscription is successful, update the frontend list
            const updatedSubs = subscriptions.filter((city) => city !== cityName); 
            setSubscriptions(updatedSubs);
            console.log('Filakia');
            sessionStorage.setItem('subscriptions' , JSON.stringify(updatedSubs));

            const notificationsOnMount: any[] = [];
            let sortedNotificationsOnMount: any[] = [];
            try {
                const response = await fetch(`${apiUrl}/mountPreviousNotifications`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'username': String(username),
                  },
                  // body: JSON.stringify({ username: localStorage.getItem('username') }),
            });

            const result = await response.json();
            
            console.log("result", result);
            if(Array.isArray(result)){
              for(var p in result){
                for(var entry in result[p]){
                  for(var city in result[p][entry]){
                    if(result[p][entry][city].timestamp){
                      notificationsOnMount.push(result[p][entry][city]);
                    }
                  }
                }
                
              }
            }
            console.log("on unsubscribe", notificationsOnMount);
            sortedNotificationsOnMount = notificationsOnMount.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setNotifications(sortedNotificationsOnMount);
        } catch (error) {
            console.error('Error while fetching previous notifications', error);
         // Set loading to false even if there is an error
        }
    

        } else {
            console.error('Failed to unsubscribe');
        }
    } catch (error) {
        console.error('Error during unsubscription:', error);
    }
  };

  const handleCityClick = async(cityName : string) => {
    navigate(`/dashboard/${cityName}`);
  }



  useEffect(() => {
    if(username !== null && username !== undefined){
      const socket = new WebSocket(`ws://localhost:8080/ws/notifications/${username}`);
      // const notificationsOnMount: any[] = [];

      let latestNotification: any = null;
      let updateTimeout: any = null;

      const flushNotification = () => {
        if (latestNotification !== null) {
          setNotifications((prev) => [...prev, ...latestNotification]);
          latestNotification = null;
        }
      };


      for(let i in notifications){
        console.log(notifications[i].timestamp);
      }


      socket.onopen = () => {
        console.log("WebSocket connection established:");
        // You can send a message or perform any initialization here
        socket.send( `Hello from ${username}!` );
      };
      
        
      socket.addEventListener("message", event => {
        const allNotifications = [];
        try {
          let exists = false;
          console.log("event data", event.data);
          console.log(sessionStorage.getItem("notifications"));
          const event_data = JSON.parse(event.data);
          const notificationsHistory = JSON.parse(String(sessionStorage.getItem("notifications")));
          const newNotification = event_data.notification;
          const city = newNotification.notification.name;

          notificationsHistory.map( (notification: { timestamp: any; }) =>{
            if (newNotification.timestamp === notification.timestamp) {
              console.log(newNotification.timestamp, "and", notification.timestamp);
              exists = true;
            }
          })

          const subs = sessionStorage.getItem("subscriptions") || Array(sessionStorage.getItem("subscriptions"));
          

          if (subs.includes(city)) {

            // Ensure that the new notification is an object and not already in stored notifications
            if (newNotification && typeof newNotification === 'object' && !exists) {
              setNotifications((prevNotifications) =>{
                const updatedNotifications = [newNotification, ...prevNotifications];

                return updatedNotifications;
              });

              setNotHad(false);
              setLoader(false);
            } else {
              console.error('Invalid notification received:', newNotification);
              setLoader(false);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setLoader(false);
        }
      });
      
    
      return () => {
        socket.close(); // Clean up the socket connection on component unmount
        if (updateTimeout) {
          clearTimeout(updateTimeout); // Clear the timeout on component unmount
        }
      };
    }
  }, []);
  

  return (
    <div>
      <div className="welcome-container">
        {username && <p>Welcome, {username}!</p>}
        <div className="button-group">
          <button type="button" onClick={goToAllCities}>All Cities</button>
          <button type="button" onClick={seeStatistics}>Statistics</button>
          <Logout />
        </div>
      </div>
      <div className= "content">
        <div className='selection'>
          <div className='sel'>
            <Select
              isMulti
              options={cityOptions}
              onChange={handleChange}
              styles={customStyles}
              placeholder="From which cities do you want to get notifications? Select them from here!"
            />
          </div>
          <button onClick={handleSubscribe}>Subscribe</button>
        </div>
      <div className='subscriptions'>
        <h3>Subscribed Cities</h3>
            <ul className='subscriptions-list'>
                {subscriptions.map((city, index) => (
                    <li key={index} className='city-item'>
                        <a onClick={() => handleCityClick(city)} className='city-link'>{city}</a>
                        <button onClick={() => handleUnsubscribe(city)} className='unsubscribe-btn'>
                            X
                        </button>
                    </li>
                ))}
            </ul>
      </div>
      <h4>
      {loader ? (
      
        <span className="loader"></span>
      
      ):notifications.map((notif, index) => {
  
      if (!notif || !notif.notification || !notif.timestamp) {
        // console.error(`Notification at index ${index} is invalid:`, notif);
        return null; // Skip this notification
      }
      
      const { timestamp, notification } = notif;
      const {
        name,
        lat,
        lon,
        wind_speed,
        co,
        no2,
        o3,
        so2,
        pm2_5,
        pm10,
        overall_cluster,
        state,
        iconColor,
      } = notification; // Destructure fields from notification
      
      return (
        <li key={index} className='notification-list'>
          {/* <p>Timestamp:{new Date(Number(timestamp)).toISOString()},City:{name},State:{state},Lat/Lon:{lat},{lon},Wind Speed:{wind_speed},CO:{co},NO2:{no2},O3:{o3},SO2:{so2},PM2.5:{pm2_5},PM10:{pm10},Cluster:{overall_cluster},Icon Color:<span style={{ color: iconColor }}>{iconColor}</span></p> */}
          <div className="notification-card" style={{ borderLeftColor: iconColor }}>
              <div className="header">
                <h3>{name}</h3>
                <p className='state' >{state}</p>
                <p className="timestamp">{new Date((timestamp)).toLocaleString()}</p>
              </div>
              <div className='metrics-container'>
                <div className="metrics">
                  <p><strong>Wind Speed:<WiStrongWind /></strong> {wind_speed} kh/h</p>
                  <p><strong>SO₂:<FaSmog /></strong> {so2} µg/m³</p>
                  <p><strong>PM₂.₅:<FaSmog /></strong> {pm2_5} µg/m³</p>
                  <p><strong>PM₁₀:<FaSmog /></strong> {pm10} µg/m³</p>
                </div>
              

                <div className="right-section" style={{ backgroundColor: iconColor }}>
                  {(iconColor as string) === 'red' ? <FiXOctagon /> : (iconColor as string) === 'Yellow' ? <FiAlertTriangle /> : <ImCheckmark />}
                
                </div>
            </div>
          </div>
        </li>
      );
        })}
      </h4>
    </div>
    </div>
  );
};

export default Dashboard;
